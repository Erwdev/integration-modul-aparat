import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ValidationMessage } from '../../common/enums/validation-msg.enum'; // Fix: gunakan relative path

export class LoginDto {
  @IsString()
  @IsNotEmpty({ message: ValidationMessage.USERNAME_REQUIRED })
  username: string;

  @IsString()
  @IsNotEmpty({ message: ValidationMessage.PASSWORD_REQUIRED })
  @MinLength(6, { message: ValidationMessage.PASSWORD_MIN })
  password: string;
}