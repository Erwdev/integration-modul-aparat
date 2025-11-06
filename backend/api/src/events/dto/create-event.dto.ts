import { IsEnum, IsNotEmpty, IsObject, IsOptional, IsString, Length } from "class-validator";
import { EventTopic, SourceModule} from "../enums";

export class CreateEventDto {
    @IsEnum(EventTopic, {message: 'Topix harus salah satu dari enum EventTopic'})
    @IsNotEmpty({message: 'Topic tidak boleh kosong'})
    topic: EventTopic;

    @IsEnum(SourceModule, {message: 'Source module harus salah satu dari enum SourceModule'})
    @IsNotEmpty({message: 'Source module tidak boleh kosong'})
    source_module: SourceModule;

    @IsString({ message: 'Idempotency key harus berupa string' })
    @Length(1, 255, { message: 'Idempotency key harus antara 1 dan 255 karakter' })
    idempotency_key: string;
}