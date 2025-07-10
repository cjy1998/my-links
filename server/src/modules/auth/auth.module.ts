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
import { GitHubStrategy } from './strategies/github.strategy';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './auth.constants';
import { SysUserModule } from '../sys/sys-user/sys-user.module';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      useFactory: () => {
        const expiresIn = 60 * 60 * 24 * 365; // 与LoginModule保持一致
        return {
          secret: jwtConstants.secret, // 使用共享的常量
          signOptions: { expiresIn: expiresIn },
        };
      },
    }),
  ],
  controllers: [],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    GitHubStrategy
  ],
  exports: [AuthService],
})
export class AuthModule { }
