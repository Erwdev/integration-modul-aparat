import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString, Length } from 'class-validator';
import { StatusAparat } from '../enums/status-aparat.enum';
import { Jabatan } from '../enums/jabatan.enum';

export class CreateAparatDto {
  @IsNotEmpty() @IsString() nama: string;

  @IsNotEmpty() @Length(16,16) nik: string;

  @IsOptional() @IsString() nip?: string;

  @IsNotEmpty() jenis_kelamin: 'L'|'P';

  @IsNotEmpty() @IsString() tempat_lahir: string;

  @IsNotEmpty() @IsDateString() tanggal_lahir: string;

  @IsOptional() @IsString() agama?: string;

  @IsOptional() @IsString() pangkat_golongan?: string;

  @IsNotEmpty() @IsEnum(Jabatan) jabatan: Jabatan | string;

  @IsOptional() pendidikan_terakhir?: string;

  @IsOptional() nomor_tanggal_keputusan_pengangkatan?: string;

  @IsOptional() nomor_tanggal_keputusan_pemberhentian?: string;

  @IsOptional() keterangan?: string;

  @IsOptional() tanda_tangan_url?: string;

  @IsOptional() @IsEnum(StatusAparat) status?: StatusAparat;


}
