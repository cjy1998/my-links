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
  Delete,
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
  ) { }

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
  @Delete('logout')
  @Public()
  async logout(@Headers('Authorization') authorization: string) {
    if (authorization) {
      const token = authorization.slice(7);
      await this.loginService.logout(token);
    }
  }
  // GitHub登录入口
  @Public()
  @Get('github')
  @UseGuards(AuthGuard('github'))
  githubAuth() {
    // 会自动重定向到GitHub授权页
  }

  // GitHub回调
  @Public()
  @Get('callback_github')
  @UseGuards(AuthGuard('github'))
  async githubCallback(@Req() req, @Res() res: Response, @Query('error') error: string) {
    if (error) {
      console.error('GitHub authentication error:', error);
      return res.redirect(`${process.env.FRONTEND_URL}?error=auth_failed`);
    }

    try {
      // 生成JWT
      const token = await this.authService.generateToken(req.user);
      
      // 设置HTTP-only Cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 3600000, // 1小时
        sameSite: 'lax',
      });

      // 重定向到前端
      res.redirect(process.env.FRONTEND_URL || '/');
    } catch (err) {
      console.error('Token generation error:', err);
      res.redirect(`${process.env.FRONTEND_URL}?error=token_error`);
    }
  }

}
