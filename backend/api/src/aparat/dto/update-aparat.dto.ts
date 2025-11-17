import { PartialType } from '@nestjs/mapped-types';
import { CreateAparatDto } from './create-aparat.dto';

export class UpdateAparatDto extends PartialType(CreateAparatDto) {}
