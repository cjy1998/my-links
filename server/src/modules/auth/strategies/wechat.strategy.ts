import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-wechat';
import { AuthService } from '../auth.service';

@Injectable()
export class WeChatStrategy extends PassportStrategy(Strategy, 'wechat') {
  constructor(private authService: AuthService) {
    super({
      appID: process.env.WECHAT_APP_ID,
      appSecret: process.env.WECHAT_APP_SECRET,
      client: 'web',
      callbackURL: process.env.WECHAT_CALLBACK_URL,
      scope: 'snsapi_login',
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    // 标准化微信返回的数据结构
    return {
      provider: 'wechat',
      providerId: profile.openid,
      nickName: profile.nickname,
      avatar: profile.headimgurl,
      accessToken,
    };
  }
}