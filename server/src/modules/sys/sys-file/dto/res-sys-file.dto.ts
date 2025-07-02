import { PartialType } from '@nestjs/mapped-types';
import { CreateSysFileDto } from './req-sys-file.dto';

export class UpdateSysFileDto extends PartialType(CreateSysFileDto) {}
