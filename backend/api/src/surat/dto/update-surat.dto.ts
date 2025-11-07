import {
  IsString,
  IsOptional,
  IsUUID,
  IsDateString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateSuratDto {
  @IsOptional()
  @IsString({ message: 'Perihal harus berupa string' })
  @MaxLength(500, { message: 'Perihal maksimal 500 karakter' })
  @MinLength(5, { message: 'Perihal minimal 5 karakter' })
  perihal?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Tanggal surat harus format ISO date' })
  tanggal_surat?: string;

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