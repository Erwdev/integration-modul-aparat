import { IsOptional, IsEnum, IsString, IsDateString } from 'class-validator';
import { StatusEkspedisi } from '../enums/status-ekspedisi.enum';
import { JenisPengiriman } from '../enums/jenis-pengiriman.enum';

export class FilterEkspedisiDto {
  @IsOptional()
  @IsEnum(StatusEkspedisi)
  status?: StatusEkspedisi;

  @IsOptional()
  @IsEnum(JenisPengiriman)
  metode_kirim?: JenisPengiriman;

  @IsOptional()
  @IsString()
  kurir?: string;

  @IsOptional()
  @IsDateString()
  tanggal_kirim?: string;
}
