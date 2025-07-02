import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
const OSS = require('ali-oss');

@Global()
@Module({
  providers: [
    {
      provide: 'OSS_CLIENT',
      async useFactory(config: ConfigService) {
        const client = new OSS({
          region: config.get('OSS_REGION'),
          bucket: config.get('OSS_BUCKET'),
          accessKeyId: config.get('OSS_ACCESS_KEY_ID'),
          accessKeySecret: config.get('OSS_ACCESS_KEY_SECRECT'),
          secure: config.get('OSS_SECURE'),
        });
        return client;
      },
      inject: [ConfigService],
    },
  ],
  exports: ['OSS_CLIENT'],
})
export class OssModule {}
