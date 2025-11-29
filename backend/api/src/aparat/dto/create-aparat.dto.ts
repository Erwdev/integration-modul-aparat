import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString, Length, IsInt } from 'class-validator';
import { StatusAparat } from '../enums/status-aparat.enum';
import { Jabatan } from '../enums/jabatan.enum';

export class CreateAparatDto {
  @IsOptional() @IsInt() nomorUrut?: number;

  @IsNotEmpty() @IsString() nama: string;

  @IsNotEmpty() @Length(16,16) nik: string;

  @IsOptional() @IsString() nip?: string;

  @IsNotEmpty() jenisKelamin: 'L'|'P';

  @IsNotEmpty() @IsString() tempatLahir: string;

  @IsNotEmpty() @IsDateString() tanggalLahir: string;

  @IsOptional() @IsString() agama?: string;

  @IsOptional() @IsString() pangkatGolongan?: string;

  @IsNotEmpty() @IsEnum(Jabatan) jabatan: Jabatan | string;

  @IsOptional() @IsString() pendidikanTerakhir?: string;

  // ✅ Field SK yang VALID (String)
  @IsOptional() @IsString() skPengangkatanNomor?: string;
  @IsOptional() @IsString() skPengangkatanTanggal?: string;

  @IsOptional() @IsString() skPemberhentianNomor?: string;
  @IsOptional() @IsString() skPemberhentianTanggal?: string;

  @IsOptional() @IsString() keterangan?: string;

  @IsOptional() @IsString() tandaTanganUrl?: string;

  @IsOptional() @IsEnum(StatusAparat) status?: StatusAparat;
}