import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, Length } from 'class-validator';
import { ProcessingStatus, SourceModule } from '../enums';

/**
 * DTO untuk acknowledge event
 */
export class AcknowledgeEventDto {
  @IsUUID('4', { message: 'Event ID harus UUID yang valid' })
  @IsNotEmpty({ message: 'Event ID tidak boleh kosong' })
  event_id: string;

  @IsEnum(SourceModule, { 
    message: 'Consumer module harus: agenda, ekspedisi, atau aparat' 
  })
  @IsNotEmpty({ message: 'Consumer module tidak boleh kosong' })
  consumer_module: SourceModule;

  @IsEnum(ProcessingStatus, { 
    message: 'Processing status harus: success atau failed' 
  })
  @IsNotEmpty({ message: 'Processing status tidak boleh kosong' })
  processing_status: ProcessingStatus;

  @IsString({ message: 'Error message harus berupa string' })
  @Length(1, 1000, { message: 'Error message maksimal 1000 karakter' })
  @IsOptional()
  error_message?: string;
}