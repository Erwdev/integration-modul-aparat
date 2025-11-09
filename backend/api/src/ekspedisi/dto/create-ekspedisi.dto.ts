import { IsUUID, IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { JenisPengiriman } from '../enums/jenis-pengiriman.enum';

export class CreateEkspedisiDto {
  @IsUUID()
  surat_id: string;

  @IsString()
  kurir: string;

  @IsOptional()
  @IsUUID()
  petugas_aparat_id?: string;

  @IsDateString()
  tanggal_kirim: string;

  @IsEnum(JenisPengiriman)
  metode_kirim: JenisPengiriman;
}
