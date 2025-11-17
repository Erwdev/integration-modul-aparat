import { PartialType } from '@nestjs/mapped-types';
import { CreateEkspedisiDto } from './create-ekspedisi.dto';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { StatusEkspedisi } from '../enums/status-ekspedisi.enum';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateEkspedisiDto extends PartialType(CreateEkspedisiDto) {
  @ApiProperty({
    description: 'Status ekspedisi',
    enum: StatusEkspedisi,
    example: StatusEkspedisi.TERKIRIM,
    required: false,
  })
  @IsOptional()
  @IsEnum(StatusEkspedisi, {
    message: 'Status harus salah satu dari: DALAM_PERJALANAN, TERKIRIM, GAGAL, DIKEMBALIKAN',
  })
  status?: StatusEkspedisi;

  @ApiProperty({
    description: 'Catatan tambahan untuk tracking ekspedisi',
    example: 'Paket sudah sampai di kantor pos tujuan',
    required: false,
    maxLength: 1000,
  })
  @IsOptional()
  @IsString({ message: 'Catatan harus berupa string' })
  @MaxLength(1000, { message: 'Catatan maksimal 1000 karakter' })
  catatan?: string;
}