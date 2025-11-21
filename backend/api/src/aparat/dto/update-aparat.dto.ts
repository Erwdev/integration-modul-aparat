import { PartialType } from '@nestjs/swagger';
import { CreateAparatDto } from './create-aparat.dto';
import { IsOptional, IsString, IsEnum, IsDateString } from 'class-validator'; // ❌ HAPUS IsInt
import { StatusAparat } from '../enums/status-aparat.enum';
import { Jabatan } from '../enums/jabatan.enum';

export class UpdateAparatDto extends PartialType(CreateAparatDto) {
  
  @IsOptional() @IsString() skPengangkatanNomor?: string;
  @IsOptional() @IsString() skPengangkatanTanggal?: string;

  @IsOptional() @IsString() skPemberhentianNomor?: string;
  @IsOptional() @IsString() skPemberhentianTanggal?: string;

  @IsOptional() @IsString() nama?: string;
  @IsOptional() @IsString() nik?: string;
  @IsOptional() @IsString() nip?: string;
  @IsOptional() jenisKelamin?: 'L'|'P';
  @IsOptional() @IsString() tempatLahir?: string;
  @IsOptional() @IsDateString() tanggalLahir?: string;
  @IsOptional() @IsString() agama?: string;
  @IsOptional() @IsString() pangkatGolongan?: string;
  @IsOptional() jabatan?: Jabatan | string;
  @IsOptional() @IsString() pendidikanTerakhir?: string;
  @IsOptional() @IsString() keterangan?: string;
  @IsOptional() @IsEnum(StatusAparat) status?: StatusAparat;
}