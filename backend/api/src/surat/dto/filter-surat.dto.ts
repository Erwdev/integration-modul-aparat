import {
  IsEnum,
  IsOptional,
  IsDateString,
  IsString,
  IsInt,
  Min,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
// Impor enum dari lokasi baru
import { JenisSurat } from '../enums/jenis-surat.enum';
import { StatusSurat } from '../enums/status-surat.enum';

export class QuerySuratDto {
  @IsOptional()
  @IsEnum(JenisSurat, { message: 'Jenis harus MASUK atau KELUAR' })
  jenis?: JenisSurat;

  @IsOptional()
  @IsEnum(StatusSurat, {
    message: 'Status harus: DRAFT, TERKIRIM, DITERIMA, atau SELESAI',
  })
  status?: StatusSurat;

  @IsOptional()
  @IsDateString({}, { message: 'Tanggal dari harus format ISO date' })
  tanggal_dari?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Tanggal sampai harus format ISO date' })
  tanggal_sampai?: string;

  @IsOptional()
  @IsString({ message: 'Search query harus berupa string' })
  search?: string;

  // Pagination
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Page harus berupa angka' })
  @Min(1, { message: 'Page minimal 1' })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit harus berupa angka' })
  @Min(1, { message: 'Limit minimal 1' })
  limit?: number = 20;

  // Sorting
  @IsOptional()
  @IsIn(['tanggal_surat', 'created_at', 'nomor_surat'], {
    message: 'Sort by harus: tanggal_surat, created_at, atau nomor_surat',
  })
  sort_by?: string = 'created_at';

  @IsOptional()
  @IsIn(['asc', 'desc'], { message: 'Order harus asc atau desc' })
  order?: 'asc' | 'desc' = 'desc';
}