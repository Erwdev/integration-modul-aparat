import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UploadBuktiTerimaDto {
  @ApiProperty({
    description: 'Nama lengkap penerima surat',
    example: 'John Doe',
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'Nama penerima tidak boleh kosong' })
  @IsString({ message: 'Nama penerima harus berupa string' })
  @MaxLength(255, { message: 'Nama penerima maksimal 255 karakter' })
  namaPenerima: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'File bukti terima (JPG, PNG, PDF, max 5MB)',
  })
  file: any; // This is for Swagger only, actual validation in multer
}