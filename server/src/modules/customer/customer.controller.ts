import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Put,
  StreamableFile,
  UseInterceptors,
  UploadedFile,
  ParseFilePipeBuilder,
} from '@nestjs/common';
import { CustomerService } from './customer.service';
import {
  AddCustomerDto,
  GetCustomerListDto,
  UpdateCustomerDto,
  UpdateSupportDto,
} from './dto/req-customer.dto';
import { RepeatSubmit } from 'src/common/decorators/repeat-submit.decorator';
import { BusinessTypeEnum, Log } from 'src/common/decorators/log.decorator';
import { CreateMessagePipe } from 'src/common/pipes/createmessage.pipe';
import { RequiresPermissions } from 'src/common/decorators/requires-permissions.decorator';
import { PaginationPipe } from 'src/common/pipes/pagination.pipe';
import { DataObj } from 'src/common/class/data-obj.class';
import { UpdateMessagePipe } from 'src/common/pipes/updatemessage.pipe';
import { StringToArrPipe } from 'src/common/pipes/stringtoarr.pipe';
import { Keep } from 'src/common/decorators/keep.decorator';
import { ExcelService } from '../common/excel/excel.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiException } from 'src/common/exceptions/api.exception';

@Controller('customer')
export class CustomerController {
  constructor(
    private readonly customerService: CustomerService,
    private readonly excelService: ExcelService,
  ) {}

  @Post()
  @RepeatSubmit()
  @Log({
    title: '客户管理',
    businessType: BusinessTypeEnum.insert,
  })
  @RequiresPermissions('customer:add')
  async add(@Body(CreateMessagePipe) addCustomerDto: AddCustomerDto) {
    await this.customerService.add(addCustomerDto);
  }
  /* 分页查询 */
  @Get('list')
  @RequiresPermissions('customer:query')
  async list(@Query(PaginationPipe) getCustomerListDto: GetCustomerListDto) {
    return await this.customerService.list(getCustomerListDto);
  }
  /* 通过id查询 */
  @Get(':id')
  @RequiresPermissions('customer:query')
  async oneByPostId(@Param('id') id: number) {
    const post = await this.customerService.oneByCustomerId(id);
    return DataObj.create(post);
  }

  /* 更新 */
  @Put()
  @RepeatSubmit()
  @RequiresPermissions('customer:edit')
  @Log({
    title: '客户管理',
    businessType: BusinessTypeEnum.update,
  })
  async uplate(@Body(UpdateMessagePipe) updateCustomerDto: UpdateCustomerDto) {
    await this.customerService.update(updateCustomerDto);
  }

  /* 删除 */
  @Delete(':ids')
  @RequiresPermissions('customer:remove')
  @Log({
    title: '客户管理',
    businessType: BusinessTypeEnum.delete,
  })
  async delete(@Param('ids', new StringToArrPipe()) idArr: number[]) {
    await this.customerService.delete(idArr);
  }
  /**
   * 下载模板
   */
  @RepeatSubmit()
  @Post('importTemplate')
  @Keep()
  async importTemplate() {
    const file = await this.excelService.importTemplate(AddCustomerDto);
    return new StreamableFile(file);
  }

  /* 导入 */
  @Post('importData')
  @RepeatSubmit()
  @RequiresPermissions('customer:import')
  @UseInterceptors(FileInterceptor('file'))
  async importData(
    @Query() updateSupportDto: UpdateSupportDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({
          maxSize: 1024 * 1024 * 5,
        })
        .addFileTypeValidator({
          fileType:
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })
        .build({
          exceptionFactory: (error) => {
            throw new ApiException(
              '文件格式错误！ 文件最大为5M，且必须是 xlsx 格式',
            );
          },
        }),
    )
    file: Express.Multer.File,
  ) {
    const data = await this.excelService.import<AddCustomerDto>(
      AddCustomerDto,
      file,
    );
    await this.customerService.importData(data, updateSupportDto.updateSupport);
  }
}
