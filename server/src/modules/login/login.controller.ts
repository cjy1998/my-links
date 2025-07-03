/*
 * @Author: Sheng.Jiang
 * @Date: 2021-12-08 18:30:39
 * @LastEditTime: 2024-05-17 17:08:30
 * @LastEditors: JiangSheng 87789771@qq.com
 * @Description: 登录 controller
 * @FilePath: \meimei-new\src\modules\login\login.controller.ts
 * You can you up，no can no bb！！
 */

import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Headers,
  Req,
  Res,
  Query,
} from '@nestjs/common';
import { Public } from 'src/common/decorators/public.decorator';
import { User, UserEnum } from 'src/common/decorators/user.decorator';
import { LocalAuthGuard } from 'src/common/guards/local-auth.guard';
import { ReqLoginDto } from './dto/req-login.dto';
import { ResImageCaptchaDto, ResLoginDto } from './dto/res-login.dto';
import { LoginService } from './login.service';
import { SysUser } from '@prisma/client';
import { Request } from 'express';
import { UserInfo } from 'src/common/type/user-info.type';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../auth/auth.service';
import { Response } from 'express';
@Controller()
export class LoginController {
  constructor(
    private readonly loginService: LoginService,
    private readonly authService: AuthService,
  ) {}

  /* 获取图片验证码 */
  @Get('captchaImage')
  @Public()
  async captchaImage(): Promise<ResImageCaptchaDto> {
    return await this.loginService.createImageCaptcha();
  }

  /* 用户登录 */
  @Post('login')
  @Public()
  @UseGuards(LocalAuthGuard)
  async login(
    @Body() reqLoginDto: ReqLoginDto,
    @User() user: SysUser,
    @Req() req: Request,
  ): Promise<ResLoginDto> {
    return await this.loginService.login(user, req);
  }

  /* 获取用户信息 */
  @Get('getInfo')
  async getInfo(@User() user: UserInfo) {
    const { permissions, roles } = user;
    const roleKeys = roles.map((item) => item.roleKey);
    delete user.permissions;
    return {
      user,
      permissions,
      roles: roleKeys,
    };
  }

  /* 获取用户路由信息 */
  @Get('getRouters')
  async getRouters(
    @User(UserEnum.userId) userId: number,
    @User(UserEnum.permissions) permissions: string[],
  ) {
    return await this.loginService.getRouters(userId, permissions);
  }

  /* 退出登录 */
  @Public()
  @Post('logout')
  async logout(@Headers('Authorization') authorization: string) {
    if (authorization) {
      const token = authorization.slice(7);
      await this.loginService.logout(token);
    }
  }

  @Public()
   @Get('wechat')
   @UseGuards(AuthGuard('wechat'))
  wechatLogin(@Res() res: Response) {
    const authUrl = `https://open.weixin.qq.com/connect/qrconnect?appid=${process.env.WECHAT_APP_ID}&redirect_uri=${encodeURIComponent(process.env.WECHAT_CALLBACK_URL)}&response_type=code&scope=snsapi_login&state=STATE`;
    res.redirect(authUrl);
  }

  // 微信登录回调
  @Public()
  @Get('wechat/callback')
  @UseGuards(AuthGuard('wechat'))
  async wechatCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
  ) {
    try {
      const wechatUser = await this.authService.getWechatUser(code);
      
      const result = await this.authService.handleSocialLogin({
        provider: 'wechat',
        providerId: wechatUser.openid,
        nickName: wechatUser.nickname,
        avatar: wechatUser.headimgurl,
      });

      res.redirect(`${process.env.FRONTEND_URL}/login?token=${result.token}`);
    } catch (error) {
      res.redirect(`${process.env.FRONTEND_URL}/login?error=${error.message}`);
    }
  }

  // Gitee登录跳转
  @Public()
  @Get('gitee')
  @UseGuards(AuthGuard('gitee'))
  giteeLogin(@Res() res: Response) {
    const authUrl = `https://gitee.com/oauth/authorize?client_id=${process.env.GITEE_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.GITEE_CALLBACK_URL)}&response_type=code`;
    res.redirect(authUrl);
  }

  // Gitee登录回调
  @Public()
  @Get('gitee/callback')
  @UseGuards(AuthGuard('gitee'))
  async giteeCallback(
    @Query('code') code: string,
    @Res() res: Response,
  ) {
    try {
      const giteeUser = await this.authService.getGiteeUser(code);
      
      const result = await this.authService.handleSocialLogin({
        provider: 'gitee',
        providerId: giteeUser.id,
        nickName: giteeUser.name,
        avatar: giteeUser.avatar_url,
        email: giteeUser.email,
      });

      res.redirect(`${process.env.FRONTEND_URL}/login?token=${result.token}`);
    } catch (error) {
      res.redirect(`${process.env.FRONTEND_URL}/login?error=${error.message}`);
    }
  }
}
