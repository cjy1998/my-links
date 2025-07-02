/*
https://docs.nestjs.com/modules
*/

import { Global, Module } from '@nestjs/common';
import { ExcelModule } from './excel/excel.module';
import { UploadModule } from './upload/upload.module';
import { OssModule } from './oss/oss.module';

@Global()
@Module({
  imports: [ExcelModule, UploadModule, OssModule],
  controllers: [],
  providers: [],
  exports: [ExcelModule],
})
export class CommonModule {}
