import { Inject, Injectable } from '@nestjs/common';
import { CreateSysFileDto } from './dto/req-sys-file.dto';
import { ApiException } from 'src/common/exceptions/api.exception';
import { CustomPrismaService, PrismaService } from 'nestjs-prisma';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ExtendedPrismaClient } from 'src/shared/prisma/prisma.extension';

@Injectable()
export class SysFileService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('OSS_CLIENT')
    private ossClient: any,
    @Inject('CustomPrisma')
    private readonly customPrisma: CustomPrismaService<ExtendedPrismaClient>,
  ) {}

  async uploadImage(
    file: Express.Multer.File & { createBy: string; createTime: string },
  ) {
    if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
      throw new ApiException('只能上传图片');
    }
    // 检查文件大小 5MB
    if (file.size > 5 * 1024 * 1024) {
      throw new ApiException('文件大小不能超过5MB！');
    }
    try {
      const res = await this.ossClient.put(file.originalname, file.buffer);
      if (res) {
        const params: CreateSysFileDto = {
          fileUrl: res.url,
          fileName: file.originalname,
          fileType: file.mimetype,
          fileSize: file.size,
          createBy: file.createBy, // 新增字段
          createTime: file.createTime, // 新增字段
        };
        const result = await this.prisma.sysFile.create({
          data: params,
        });
        return {
          data: result,
        };
      }
      throw new ApiException('上传失败，请稍后重试！');
    } catch (error) {
      throw new ApiException(error);
    }
  }
  /**
   * 上传文件
   * @param file
   * @returns
   */
  // 可能需要添加安全机制 ，防止注入脚本
  async uploadFile(
    file: Express.Multer.File & { createBy: string; createTime: string },
  ) {
    if (!file.mimetype.match(/\/(html|css|javascript)$/)) {
      throw new ApiException('只能上传 html、js、css 文件');
    }
    // 检查文件大小 5MB
    if (file.size > 10 * 1024 * 1024) {
      throw new ApiException('文件大小不能超过10MB！');
    }
    try {
      const res = await this.ossClient.put(file.originalname, file.buffer);
      if (res) {
        const params: CreateSysFileDto = {
          fileUrl: res.url,
          fileName: file.originalname,
          fileType: file.mimetype,
          fileSize: file.size,
          createBy: file.createBy, // 新增字段
          createTime: file.createTime, // 新增字段
        };
        const result = await this.prisma.sysFile.create({
          data: params,
        });
        return {
          data: result,
        };
      }
      throw new ApiException('上传失败，请稍后重试！');
    } catch (error) {
      throw new ApiException(error);
    }
  }

  /**
   * 分页查询文件
   * @param pagination
   * @returns
   */
  async findAll(pagination: PaginationDto) {
    const { skip, take } = pagination;
    try {
      return await this.customPrisma.client.sysFile.findAndCount({
        where: {
          delFlag: '0',
        },
        skip,
        take,
      });
    } catch (error) {
      throw new ApiException(error);
    }
  }

  /**
   * 根据ID查询文件
   * @param id
   * @returns
   */
  async findOneById(id: number) {
    try {
      const result = await this.prisma.sysFile.findUnique({
        where: {
          id,
        },
      });
      return { data: result };
    } catch (error) {
      throw new ApiException(error);
    }
  }

  /**
   * 删除文件
   * @param ids
   * @returns
   */
  async remove(ids: number[]) {
    try {
      await this.prisma.sysFile.updateMany({
        data: {
          delFlag: '1',
        },
        where: {
          id: {
            in: ids,
          },
        },
      });
      return {
        data: true,
      };
    } catch (error) {
      throw new ApiException(error);
    }
  }
}
