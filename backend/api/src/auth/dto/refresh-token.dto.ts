import { IsString, ValidateIf, IsOptional } from 'class-validator';
import { ValidationMessage } from '../../common/enums/validation-msg.enum';

export class RefreshTokenDto {
  @ValidateIf((o) => o.refreshToken !== undefined) // Only validate if provided
  @IsString({
    message: ValidationMessage.REFRESH_EMPTY,
  })
  @IsOptional()
  refreshToken: string;
}
