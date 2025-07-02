import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { DataBaseDto } from 'src/common/dto/data-base.dto';

export class CreateSysFileDto extends DataBaseDto {
  @IsString()
  fileName: string;
  @IsString()
  fileType: string;
  @IsNumber()
  fileSize: number;
  @IsString()
  fileUrl: string;
}
