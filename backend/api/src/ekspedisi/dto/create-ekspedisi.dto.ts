import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEkspedisiDto {
  @ApiProperty({
    description: 'UUID surat yang akan dikirim',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @IsNotEmpty({ message: 'Surat ID tidak boleh kosong' })
  @IsUUID('4', { message: 'Surat ID harus UUID valid' })
  surat_id: string;

  @ApiProperty({
    description: 'Nomor resi pengiriman (unique)',
    example: 'RESI-2024-001',
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'Nomor resi tidak boleh kosong' })
  @IsString({ message: 'Nomor resi harus berupa string' })
  @MaxLength(100, { message: 'Nomor resi maksimal 100 karakter' })
  nomor_resi: string;

  @ApiProperty({
    description: 'Nama kurir/jasa pengiriman',
    example: 'JNE Express',
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'Kurir tidak boleh kosong' })
  @IsString({ message: 'Kurir harus berupa string' })
  @MaxLength(255, { message: 'Kurir maksimal 255 karakter' })
  kurir: string;

  @ApiProperty({
    description: 'Alamat tujuan pengiriman lengkap',
    example: 'Jl. Merdeka No. 123, Jakarta Pusat, DKI Jakarta 10110',
    maxLength: 1000,
  })
  @IsNotEmpty({ message: 'Tujuan tidak boleh kosong' })
  @IsString({ message: 'Tujuan harus berupa string' })
  @MaxLength(1000, { message: 'Tujuan maksimal 1000 karakter' })
  tujuan: string;
}