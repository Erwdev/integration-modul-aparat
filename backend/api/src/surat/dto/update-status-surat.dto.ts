import { IsEnum, IsNotEmpty } from 'class-validator';
// Impor enum dari lokasi baru
import { StatusSurat } from '../enums/status-surat.enum';

export class UpdateStatusSuratDto {
  @IsEnum(StatusSurat, {
    message: 'Status harus: DRAFT, TERKIRIM, DITERIMA, atau SELESAI',
  })
  @IsNotEmpty({ message: 'Status tidak boleh kosong' })
  status: StatusSurat;
}