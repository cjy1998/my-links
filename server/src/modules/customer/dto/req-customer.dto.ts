import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { DataBaseDto } from 'src/common/dto/data-base.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Excel } from 'src/modules/common/excel/excel.decorator';

/* 分页查询 */
export class GetCustomerListDto extends PaginationDto {
  /* 店铺名称 */
  @IsOptional()
  @IsString()
  name?: string;

  /* 订单号 */
  @IsOptional()
  @IsString()
  orderNo?: string;

  /* 订单状态 */
  @IsOptional()
  @IsString()
  orderStatus?: string;
  /* 订单创建时间 */
  @IsOptional()
  @IsString()
  orderCreateTime?: string;
  /* 商品总价 */
  @IsOptional()
  @IsNumber()
  shopAllPrice?: string;
  /* 商品单价 */
  @IsOptional()
  @IsNumber()
  shopPrice?: string;
  /* 实付金额 */
  @IsOptional()
  @IsNumber()
  shopPayPrice?: string;
  /* 商品id */
  @IsOptional()
  @IsNumber()
  shopId?: string;
  /* 商品名称 */
  @IsOptional()
  @IsString()
  shopName?: string;
  /* 商品规格 */
  @IsOptional()
  @IsString()
  shopSpec?: string;
  /* 下单数量 */
  @IsOptional()
  @IsNumber()
  buyNum?: string;
  /* 下单时间 */
  @IsOptional()
  @IsString()
  buyTime?: string;
  /* 收件人 */
  @IsOptional()
  @IsString()
  buyName?: string;
  /* 收件人电话 */
  @IsOptional()
  @IsString()
  buyPhone?: string;
  /* 收件人地址 */
  @IsOptional()
  @IsString()
  buyAddress?: string;

  /*排序字段名称*/
  @IsOptional()
  @IsString()
  orderByFileds?: string;
  /*排序方式*/
  @IsOptional()
  @IsString()
  orderByRule?: string;
}
/* 新增 */
export class AddCustomerDto extends DataBaseDto {
  @IsOptional()
  @IsString()
  @Excel({ name: '店铺名称' })
  name: string;

  //   @IsOptional()
  @IsString()
  @Excel({ name: '订单号' })
  orderNo: string;

  @IsOptional()
  @IsString()
  @Excel({ name: '订单状态' })
  orderStatus: string;

  @IsOptional()
  @IsString()
  @Excel({ name: '订单创建时间' })
  orderCreateTime: string;

  @IsOptional()
  @IsNumber()
  @Excel({ name: '商品总价' })
  shopAllPrice: number;

  @IsOptional()
  @IsNumber()
  @Excel({ name: '商品单价' })
  shopPrice: number;

  @IsOptional()
  @IsNumber()
  @Excel({ name: '实付金额' })
  shopPayPrice: number;

  @IsOptional()
  @IsNumber()
  @Excel({ name: '商品id' })
  shopId: number;

  @IsOptional()
  @IsString()
  @Excel({ name: '商品名称' })
  shopName: string;

  @IsOptional()
  @IsString()
  @Excel({ name: '商品规格' })
  shopSpec: string;

  @IsOptional()
  @IsNumber()
  @Excel({ name: '下单数量' })
  buyNum: number;

  @IsOptional()
  @IsString()
  @Excel({ name: '下单时间' })
  buyTime: string;

  @IsOptional()
  @IsString()
  @Excel({ name: '收件人' })
  buyName: string;

  @IsOptional()
  @IsString()
  @Excel({ name: '收件人电话' })
  buyPhone: string;

  @IsOptional()
  @IsString()
  @Excel({ name: '收件人地址' })
  buyAddress: string;
}

/* 编辑 */
export class UpdateCustomerDto extends AddCustomerDto {
  @IsNumber()
  id: number;
}
/* 导入 */
export class UpdateSupportDto {
  @IsBoolean()
  @Type()
  updateSupport: boolean;
}
