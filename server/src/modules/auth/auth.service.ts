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
import { Payload } from '../login/login.interface';
import { ConfigService } from '@nestjs/config';
import { SysUser } from '@prisma/client';
@Injectable()
export class AuthService {
  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly prisma: PrismaService,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
  ) { }

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



  // 生成JWT令牌
  async generateToken(user: SysUser) {
   const payload: Payload = { userId:user.userId, pv: 1 };
    const token = this.jwtService.sign(payload);
    const expiresIn = this.configService.get('expiresIn') || 60 * 60 * 24 * 7;
    return token;
    
  }

 async handleThirdPartyLogin(
    provider: string,
    providerId: string,
    email: string,
    username: string,
    nickname: string,
    avatar: string,
    accessToken: string,
    expireTime: Date,
  ): Promise<SysUser> {
    // 1. 查找是否已有该第三方账号关联
    const socialUser = await this.prisma.sysSocialUser.findFirst({
      where: { provider, providerId },
      include: { user: true },
    });

    // 2. 若已关联，更新token并返回用户
    if (socialUser) {
      await this.prisma.sysSocialUser.update({
        where: { socialId: socialUser.socialId },
        data: { accessToken, expireTime },
      });
      return socialUser.user;
    }

    // 3. 若未关联，检查邮箱是否已存在本地用户
    let user = email ? await this.prisma.sysUser.findFirst({ where: { email } }) : null;

    // 4. 若邮箱存在，关联第三方账号到该用户
    if (user) {
      await this.prisma.sysSocialUser.create({
        data: {
          provider,
          providerId,
          userId: user.userId,
          userName: user.userName,
          nickName: nickname,
          avatar,
          accessToken,
          expireTime,
        },
      });
      return user;
    }

    // 5. 若完全是新用户，创建新用户并关联
    // 确保用户名唯一（避免与现有用户冲突）
    let uniqueUsername = username || `github_${providerId.slice(0, 8)}`;
    let count = 1;
    while (await this.prisma.sysUser.findUnique({ where: { userName: uniqueUsername } })) {
      uniqueUsername = `${username}_${count++}`;
    }

    // 创建用户并关联第三方信息
    return this.prisma.sysUser.create({
      data: {
        userName: uniqueUsername,
        nickName: nickname,
        email: email || null,
        avatar: avatar || null,
        // 第三方用户无需密码
        socialAccounts: {
          create: {
            provider,
            providerId,
            accessToken,
            expireTime,
          },
        },
      },
    });
  }
}
