import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { AuthService } from '../auth.service';

@Injectable()
export class GitHubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(private authService: AuthService) {
    super({
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL,
      scope: ['user:email'], // 请求的权限范围
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    try {
    console.log('GitHub profile:', profile); // 打印GitHub用户信息
    const email = profile.emails?.[0]?.value || null;
    const username = profile.displayName || profile.username;
    const nickname = profile.username || username;
    const avatar = profile.photos?.[0]?.value || null;

    // 计算token过期时间 (假设为1小时后)
    const expireTime = new Date();
    expireTime.setHours(expireTime.getHours() + 1);

    // 处理第三方登录，查找或创建用户
    return await this.authService.handleThirdPartyLogin(
      'github',
      profile.id,
      email,
      username,
      nickname,
      avatar,
      accessToken,
      expireTime,
    );
  } catch (error) {
    console.error('GitHub authentication error:', error);
    throw new Error('GitHub authentication failed');
  } 
}
}