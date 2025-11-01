import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ValidationMessage } from '../../common/enums/validation-msg.enum';
import { Transform } from 'class-transformer'; // Fix: gunakan relative path

export class LoginDto {
  @Transform(({ value }) => (typeof value === 'string' ? value?.trim() : value))
  @IsString()
  @IsNotEmpty({ message: ValidationMessage.USERNAME_REQUIRED })
  username: string;
  // added transform to handle cases where the username is empty string

  @Transform(({ value }) => (typeof value === 'string' ? value?.trim() : value))
  @IsString()
  @IsNotEmpty({ message: ValidationMessage.PASSWORD_REQUIRED })
  @MinLength(6, { message: ValidationMessage.PASSWORD_MIN })
  password: string;
}
