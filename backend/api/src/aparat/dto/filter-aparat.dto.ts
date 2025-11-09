import { IsOptional, IsString } from 'class-validator';

export class FilterAparatDto {
  @IsOptional() @IsString() jabatan?: string; // comma-separated list
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsString() nama?: string;

  // paging
  @IsOptional() page?: number;
  @IsOptional() limit?: number;

  // sorting
  @IsOptional() sortBy?: string; // e.g. nama or updated_at
  @IsOptional() order?: 'ASC'|'DESC';
}
