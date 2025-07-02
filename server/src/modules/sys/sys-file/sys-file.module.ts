import { Module } from '@nestjs/common';
import { SysFileService } from './sys-file.service';
import { SysFileController } from './sys-file.controller';

@Module({
  controllers: [SysFileController],
  providers: [SysFileService],
})
export class SysFileModule {}
