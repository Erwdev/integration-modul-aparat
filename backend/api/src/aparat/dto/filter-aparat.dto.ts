import { IsOptional, IsString } from 'class-validator';

export class FilterAparatDto {
  @IsOptional() @IsString() search?: string; // ✅ Tambahkan ini
  @IsOptional() @IsString() jabatan?: string;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsString() nama?: string;

  // paging
  @IsOptional() page?: number;
  @IsOptional() limit?: number;

  // sorting
  @IsOptional() sortBy?: string;
  @IsOptional() sortOrder?: 'ASC'|'DESC'; // ✅ Tambahkan ini
}