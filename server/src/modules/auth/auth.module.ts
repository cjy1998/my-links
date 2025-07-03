/*
 * @Author: jiang.sheng 87789771@qq.com
 * @Date: 2024-04-23 19:15:56
 * @LastEditors: jiang.sheng 87789771@qq.com
 * @LastEditTime: 2024-05-15 23:16:35
 * @FilePath: /meimei-new/src/modules/auth/auth.module.ts
 * @Description:
 *
 */
import { forwardRef, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { LoginModule } from '../login/login.module';
import { WeChatStrategy } from './strategies/wechat.strategy';
import { GiteeStrategy } from './strategies/gitee.strategy';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [PassportModule,HttpModule],
  controllers: [],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    WeChatStrategy,
    GiteeStrategy
  ],
  exports: [AuthService],
})
export class AuthModule { }
