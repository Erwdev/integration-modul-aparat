import { IsEnum, IsOptional, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { EventTopic, EventStatus, SourceModule } from '../enums';

/**
 * DTO untuk filter events
 */
export class FilterEventsDto {
  @IsEnum(EventTopic)
  @IsOptional()
  topic?: EventTopic;

  @IsEnum(EventStatus)
  @IsOptional()
  status?: EventStatus;

  @IsEnum(SourceModule)
  @IsOptional()
  source_module?: SourceModule;

  @IsDateString()
  @IsOptional()
  start_date?: string;

  @IsDateString()
  @IsOptional()
  end_date?: string;

  @Type(() => Number)
  @IsOptional()
  page?: number = 1;

  @Type(() => Number)
  @IsOptional()
  limit?: number = 20;
}