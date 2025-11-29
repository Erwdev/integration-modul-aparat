import { IsEnum, IsOptional, IsDateString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { EventTopic, EventStatus, SourceModule } from '../enums';

export class FilterEventsDto {
  @IsOptional()
  @IsEnum(EventTopic)
  topic?: EventTopic;

  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;

  @IsOptional()
  @IsEnum(SourceModule)
  source_module?: SourceModule;

  @IsOptional()
  @IsDateString()
  start_date?: string; // Filter mulai tanggal

  @IsOptional()
  @IsDateString()
  end_date?: string;   // Filter sampai tanggal

  @IsOptional()
  @IsDateString()
  since?: string;      // Filter khusus untuk polling (sejak kapan)

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}