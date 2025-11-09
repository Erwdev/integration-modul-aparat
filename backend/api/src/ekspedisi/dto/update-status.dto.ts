import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { StatusEkspedisi } from '../enums/status-ekspedisi.enum';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateStatusDto {
  @ApiProperty({
    description: 'Status baru ekspedisi',
    enum: StatusEkspedisi,
    example: StatusEkspedisi.TERKIRIM,
    required: true,
  })
  @IsEnum(StatusEkspedisi, {
    message: 'Status harus salah satu dari: DALAM_PERJALANAN, TERKIRIM, GAGAL, DIKEMBALIKAN',
  })
  status: StatusEkspedisi;

  @ApiProperty({
    description: 'Catatan perubahan status (opsional)',
    example: 'Paket telah diterima oleh penerima langsung',
    required: false,
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'Catatan harus berupa string' })
  @MaxLength(500, { message: 'Catatan maksimal 500 karakter' })
  catatan?: string;
}