import {
  IsEnum,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsDateString,
  MaxLength,
  MinLength,
} from 'class-validator';
// Impor enum dari lokasi baru
import { JenisSurat } from '../enums/jenis-surat.enum';

export class CreateSuratDto {
  @IsEnum(JenisSurat, { message: 'Jenis surat harus MASUK atau KELUAR' })
  @IsNotEmpty({ message: 'Jenis surat tidak boleh kosong' })
  jenis: JenisSurat;

  @IsString({ message: 'Perihal harus berupa string' })
  @IsNotEmpty({ message: 'Perihal tidak boleh kosong' })
  @MaxLength(500, { message: 'Perihal maksimal 500 karakter' })
  @MinLength(5, { message: 'Perihal minimal 5 karakter' })
  perihal: string;

  @IsDateString({}, { message: 'Tanggal surat harus format ISO date' })
  @IsNotEmpty({ message: 'Tanggal surat tidak boleh kosong' })
  tanggal_surat: string;

  @IsOptional()
  @IsString({ message: 'Pengirim harus berupa string' })
  @MaxLength(255, { message: 'Pengirim maksimal 255 karakter' })
  pengirim?: string;

  @IsOptional()
  @IsString({ message: 'Penerima harus berupa string' })
  @MaxLength(255, { message: 'Penerima maksimal 255 karakter' })
  penerima?: string;

  @IsOptional()
  @IsUUID('4', { message: 'ID aparat harus UUID valid' })
  id_aparat_penandatangan?: string;

  @IsOptional()
  @IsString({ message: 'Isi ringkas harus berupa string' })
  isi_ringkas?: string;

  @IsOptional()
  @IsString({ message: 'Lampiran URL harus berupa string' })
  @MaxLength(500, { message: 'Lampiran URL maksimal 500 karakter' })
  lampiran_url?: string;
}