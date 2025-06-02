import { Inject, Injectable } from '@nestjs/common';
import {
  AddCustomerDto,
  GetCustomerListDto,
  UpdateCustomerDto,
} from './dto/req-customer.dto';
// import { UpdateCustomerDto } from './dto/res-customer.dto';
import { CustomPrismaService, PrismaService } from 'nestjs-prisma';
import { ExtendedPrismaClient } from 'src/shared/prisma/prisma.extension';
import { ApiException } from 'src/common/exceptions/api.exception';
import dayjs from 'dayjs';

@Injectable()
export class CustomerService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('CustomPrisma')
    private readonly customPrisma: CustomPrismaService<ExtendedPrismaClient>,
  ) {}

  /* 分页查询 */
  async list(getCustomerListDto: GetCustomerListDto) {
    const {
      skip,
      take,
      orderByFileds,
      orderByRule,
      orderNo,
      name,
      orderStatus,
    } = getCustomerListDto;
    return await this.customPrisma.client.customer.findAndCount({
      orderBy: {
        [orderByFileds]: orderByRule,
      },
      where: {
        orderNo: {
          contains: orderNo,
        },
        name: {
          contains: name,
        },
        orderStatus,
      },
      skip,
      take,
    });
  } /* 新增 */
  async add(addCustomerDto: AddCustomerDto) {
    return await this.prisma.customer.create({
      data: addCustomerDto,
    });
  }
  /* 通过id查询 */
  async oneByCustomerId(id: number) {
    return await this.prisma.customer.findUnique({
      where: {
        id,
      },
    });
  }

  /* 更新 */
  async update(updateCustomerDto: UpdateCustomerDto) {
    return await this.prisma.$transaction(async (prisma) => {
      const { id } = updateCustomerDto;
      const customer = await prisma.customer.findUnique({
        where: {
          id,
        },
      });
      if (!customer) throw new ApiException('该记录不存在，请重新查询后操作。');
      return await prisma.customer.update({
        data: updateCustomerDto,
        where: {
          id,
        },
      });
    });
  }

  /* 删除 */
  async delete(idArr: number[]) {
    await this.prisma.customer.deleteMany({
      where: {
        id: {
          in: idArr,
        },
      },
    });
  }
  /* 导入 */
  async importData(importSysUserDtoArr: AddCustomerDto[], isUpdate: boolean) {
    return await this.prisma.$transaction(async (prisma) => {
      for (const item of importSysUserDtoArr) {
        item.createTime = dayjs().format();
        if (!isUpdate) {
          const user = await prisma.customer.findFirst({
            where: {
              orderNo: item.orderNo,
            },
          });
          if (user)
            throw new ApiException(
              '订单号' + item.orderNo + ' 已经存在，请更换后再试。',
            );
          await prisma.customer.create({
            data: item,
          });
        } else {
          const existing = await prisma.customer.findFirst({
            where: {
              orderNo: item.orderNo,
            },
          });
          if (existing) {
            await prisma.customer.update({
              where: { id: existing.id },
              data: item,
            });
          } else {
            await prisma.customer.create({
              data: item,
            });
          }
        }
      }
    });
  }
}
