import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Query,
} from '@nestjs/common';
import { SysFileService } from './sys-file.service';
import { CreateSysFileDto } from './dto/req-sys-file.dto';
import { UpdateSysFileDto } from './dto/res-sys-file.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateMessagePipe } from 'src/common/pipes/createmessage.pipe';
import { StringToArrPipe } from 'src/common/pipes/stringtoarr.pipe';
import { PaginationPipe } from 'src/common/pipes/pagination.pipe';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { RepeatSubmit } from 'src/common/decorators/repeat-submit.decorator';
import { BusinessTypeEnum, Log } from 'src/common/decorators/log.decorator';
import { RequiresPermissions } from 'src/common/decorators/requires-permissions.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('文件管理')
@Controller('system/file')
export class SysFileController {
  constructor(private readonly sysFileService: SysFileService) {}
  /**
   * 上传图片
   */
  @Post('upload/image')
  @RepeatSubmit()
  @Log({
    title: '文件管理-上传图片',
    businessType: BusinessTypeEnum.insert,
  })
  @RequiresPermissions('system:file:add:img')
  @UseInterceptors(FileInterceptor('file'))
  uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body(CreateMessagePipe) body: any,
  ) {
    // 合并文件对象和管道处理后的body
    const fileWithMeta = {
      ...file,
      createBy: body.createBy,
      createTime: body.createTime,
    };
    return this.sysFileService.uploadImage(fileWithMeta);
  }
  /**
   * 上传文件
   */
  @Post('upload/file')
  @RepeatSubmit()
  @Log({
    title: '文件管理-上传文件',
    businessType: BusinessTypeEnum.insert,
  })
  @RequiresPermissions('system:file:add:file')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body(CreateMessagePipe) body: any,
  ) {
    // 合并文件对象和管道处理后的body
    const fileWithMeta = {
      ...file,
      createBy: body.createBy,
      createTime: body.createTime,
    };
    return this.sysFileService.uploadFile(fileWithMeta);
  }
  /**
   * 文件列表
   */
  @Get('list')
  @RequiresPermissions('system:file:query')
  findAll(@Query(PaginationPipe) pagination: PaginationDto) {
    return this.sysFileService.findAll(pagination);
  }
  /**
   * 文件详情
   */
  @Get(':id')
  @RequiresPermissions('system:file:query')
  findOne(@Param('id') id: number) {
    return this.sysFileService.findOneById(id);
  }
  /**
   * 删除文件
   */
  @Delete(':ids')
  @RequiresPermissions('system:file:remove')
  @Log({
    title: '文件管理',
    businessType: BusinessTypeEnum.delete,
  })
  remove(@Param('ids', new StringToArrPipe()) ids: number[]) {
    return this.sysFileService.remove(ids);
  }
}
