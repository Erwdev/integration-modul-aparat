import { PartialType } from '@nestjs/mapped-types';
import { CreateEkspedisiDto } from './create-ekspedisi.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { StatusEkspedisi } from '../enums/status-ekspedisi.enum';

export class UpdateEkspedisiDto extends PartialType(CreateEkspedisiDto) {
  @IsOptional()
  @IsEnum(StatusEkspedisi)
  status?: StatusEkspedisi;
}
