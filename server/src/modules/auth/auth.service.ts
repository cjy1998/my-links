/*
 * @Author: jiang.sheng 87789771@qq.com
 * @Date: 2024-04-23 19:15:56
 * @LastEditors: jiang.sheng 87789771@qq.com
 * @LastEditTime: 2024-05-18 10:19:04
 * @FilePath: /meimei-new/src/modules/auth/auth.service.ts
 * @Description: 用户身份校验
 *
 */
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { isEmpty } from 'lodash';
import { ApiException } from 'src/common/exceptions/api.exception';
import Redis from 'ioredis';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'nestjs-prisma';
import {
  CAPTCHA_IMG_KEY,
  USER_INFO_KEY,
  USER_TOKEN_KEY,
  USER_VERSION_KEY,
} from 'src/common/contants/redis.contant';
import { JwtService } from '@nestjs/jwt';
import {  Cache } from '@nestjs/cache-manager';
import { Prisma, SysUser } from '@prisma/client';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
@Injectable()
export class AuthService {
  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly prisma: PrismaService,
    private jwtService: JwtService,
    private httpService: HttpService,
    @Inject( Cache) private cacheManager: Cache
  ) {}

  /* 判断验证码是否正确 */
  async checkImgCaptcha(uuid: string, code: string) {
    const result = await this.redis.get(`${CAPTCHA_IMG_KEY}:${uuid}`);
    if (isEmpty(result) || code.toLowerCase() !== result.toLowerCase()) {
      throw new ApiException('验证码错误');
    }
    await this.redis.del(`${CAPTCHA_IMG_KEY}:${uuid}`);
  }

  /* 判断用户账号密码是否正确 */
  async validateUser(userName: string, password: string) {
    const user = await this.prisma.sysUser.findUnique({
      include: {
        dept: true,
      },
      where: {
        userName,
        delFlag: '0',
        status: '0',
      },
    });
    if (!user) throw new ApiException('用户名或密码错误');
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new ApiException('用户名或密码错误');
    return user;
  }

  /* 判断token 是否过期 或者被重置 */
  async validateToken(userId: number, pv: number, restoken: string) {
    const token = await this.redis.get(`${USER_TOKEN_KEY}:${userId}`);
    if (restoken !== token) throw new ApiException('登录状态已过期', 401);
    const passwordVersion = await this.redis.get(
      `${USER_VERSION_KEY}:${userId}`,
    );
    if (pv.toString() !== passwordVersion)
      throw new ApiException('用户信息或全权限范围已被修改', 401);
    const userString = await this.redis.get(`${USER_INFO_KEY}:${userId}`);
    if (userString) {
      return JSON.parse(userString);
    }
  }

  /**
   * @description: 处理第三方登录
   * @param profile 
   * @returns 
   */
  async handleSocialLogin(profile: {
    provider: string;
    providerId: string;
    nickName?: string;
    avatar?: string;
    email?: string;
    phone?: string;
  }) {
    // 1. 检查是否已绑定
    const socialUser = await this.prisma.sysSocialUser.findUnique({
      where: {
        social_provider_unique: {
          provider: profile.provider,
          providerId: profile.providerId,
        },
      },
      include: { user: true },
    }) as Prisma.SysSocialUserGetPayload<{ include: { user: true } }> | null;

    if (socialUser?.user) {
      return this.generateToken(socialUser.user);
    }

    // 3. 未绑定则尝试通过邮箱匹配现有账号
    if (profile.email) {
      const user = await this.prisma.sysUser.findFirst({
        where: { 
          email: profile.email,
          delFlag: '0',
          status: '0'
        },
      });

      if (user) {
        // 绑定第三方账号到现有用户
        await this.bindSocialAccount(user.userId, profile= {
          provider: profile.provider,
          providerId: profile.providerId,
          nickName: profile.nickName,
          avatar: profile.avatar,
        });
        return this.generateToken(user);
      }
    }

    // 4. 没有匹配账号，抛出异常
    throw new UnauthorizedException('未找到关联的系统账号，请联系管理员绑定');
  }
  // 绑定第三方账号
  private async bindSocialAccount(
    userId: number,
    profile: {
      provider: string;
      providerId: string;
      nickName?: string;
      avatar?: string;
    },
  ) {
    return this.prisma.sysSocialUser.create({
      data: {
        provider: profile.provider,
        providerId: profile.providerId,
        userId,
        nickName: profile.nickName,
        avatar: profile.avatar,
      },
    });
  }

  // 生成JWT令牌
  private async generateToken(user: any) {
    const payload = { 
      sub: user.userId,
      username: user.userName,
      roles: [] // 根据实际需求添加角色信息
    };
    const token = this.jwtService.sign(payload);
    await this.cacheManager.set(`user:${user.userId}:token`, token, 3600);
    return {
      user: {
        userId: user.userId,
        userName: user.userName,
        nickName: user.nickName,
        avatar: user.avatar,
      },
      token,
    };
  }

  // 获取微信用户信息
  async getWechatUser(code: string) {
    const { data: tokenData } = await firstValueFrom(
      this.httpService.get(
        `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${process.env.WECHAT_APP_ID}&secret=${process.env.WECHAT_APP_SECRET}&code=${code}&grant_type=authorization_code`
      )
    );

    const { data: userInfo } = await firstValueFrom(
      this.httpService.get(
        `https://api.weixin.qq.com/sns/userinfo?access_token=${tokenData.access_token}&openid=${tokenData.openid}`
      )
    );

    return {
      openid: tokenData.openid,
      nickname: userInfo.nickname,
      headimgurl: userInfo.headimgurl,
    };
  }

  // 获取Gitee用户信息
  async getGiteeUser(code: string) {
    const { data: tokenData } = await firstValueFrom(
      this.httpService.post('https://gitee.com/oauth/token', {
        grant_type: 'authorization_code',
        client_id: process.env.GITEE_CLIENT_ID,
        client_secret: process.env.GITEE_CLIENT_SECRET,
        code,
        redirect_uri: process.env.GITEE_CALLBACK_URL,
      })
    );

    const { data: userInfo } = await firstValueFrom(
      this.httpService.get('https://gitee.com/api/v5/user', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      })
    );

    return {
      id: userInfo.id,
      name: userInfo.name,
      avatar_url: userInfo.avatar_url,
      email: userInfo.email,
    };
  }
}
