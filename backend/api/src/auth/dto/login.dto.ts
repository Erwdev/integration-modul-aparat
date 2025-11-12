import { IsString, IsNotEmpty, MinLength, IsEmail, MaxLength, Matches } from 'class-validator';
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

export class RegisterDto {
  @IsEmail({}, { message: 'Email tidak valid' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  email: string;

  @IsString({ message: 'Nama harus berupa teks' })
  @MinLength(3, { message: 'Nama minimal 3 karakter' })
  @MaxLength(50, { message: 'Nama maksimal 50 karakter' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  username: string;

  @IsString({ message: 'Password harus berupa teks' })
  @MinLength(8, { message: 'Password minimal 8 karakter' })
  @MaxLength(64, { message: 'Password maksimal 64 karakter' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message: 'Password harus mengandung huruf besar, huruf kecil, dan angka',
  })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'Nama lengkap tidak boleh kosong' })
  @MinLength(3, { message: 'Nama lengkap minimal 3 karakter' })
  nama_lengkap: string;
}

export class LogoutDto {
  @IsString()
  @IsNotEmpty({ message: ValidationMessage.TOKEN_REQUIRED })
  token: string;
}

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty({ message: 'Password lama tidak boleh kosong' })
  oldPassword: string;

  @IsString()
  @IsNotEmpty( {message: ValidationMessage.PASSWORD_REQUIRED})
  @MinLength(6, {message: ValidationMessage.PASSWORD_MIN})
  newPassword: string

  @IsString()
  @IsNotEmpty({ message: 'Konfirmasi password tidak boleh kosong' })
  confirmPassword: string;

}