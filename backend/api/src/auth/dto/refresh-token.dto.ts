import { IsString, IsNotEmpty } from 'class-validator';
import { ValidationMessage } from 'src/common/enums/validation-msg.enum';

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty({
    message: ValidationMessage.REFRESH_EMPTY,
  })
  refreshToken: string;
}
