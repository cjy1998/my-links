import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-gitee';
import { AuthService } from '../auth.service';

@Injectable()
export class GiteeStrategy extends PassportStrategy(Strategy, 'gitee') {
  constructor(private authService: AuthService) {
    super({
      clientID: process.env.GITEE_CLIENT_ID,
      clientSecret: process.env.GITEE_CLIENT_SECRET,
      callbackURL: process.env.GITEE_CALLBACK_URL,
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    // 标准化Gitee返回的数据结构
    return {
      provider: 'gitee',
      providerId: profile.id,
      nickName: profile.username,
      avatar: profile._json.avatar_url,
      email: profile._json.email,
      accessToken,
    };
  }
}