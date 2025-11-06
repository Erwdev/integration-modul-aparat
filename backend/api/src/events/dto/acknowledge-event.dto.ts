import { IsEnum, IsNotEmpty, IsObject, IsOptional, IsString, IsUUID, Length } from "class-validator";
import { ProcessingStatus, SourceModule} from "../enums";

export class AcknowledgeEventDto {
    @IsUUID('4', {message: 'Event ID harus UUID valid (v4'})
    @IsNotEmpty({message: 'Event ID tidak boleh kosong'})
    event_id: string;

    @IsEnum(SourceModule, {message: 'Consumer harus salah satu agenda ekspedisi dan aparat'})
    @IsNotEmpty({message: 'Consumer tidak boleh kosong'})
    consumer: SourceModule;

    @IsEnum(ProcessingStatus, {
        message: 'Processing status harus salah satu dari enum ProcessingStatus'
    })
    @IsNotEmpty({message: 'Processing status tidak boleh kosong'})
    processing_status: ProcessingStatus;

    @IsString({message: 'Keterangan harus berupa string'})
    @Length(1,1000,{message: 'Error message maksimal 1000 karakter'})
    @IsOptional()
    error_message?: string;
}