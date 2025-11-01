import {
  Controller,
  Post,
  Body,
  
  Headers,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  async refresh(
    @Headers('authorization') authHeader?: string,
    @Body() body?: RefreshTokenDto,
  ): Promise<AuthResponseDto> {
    const tokenFromHeader = authHeader?.startsWith('Bearer ')
      ? authHeader.substring(7)
      : undefined;

    const refreshToken = tokenFromHeader ?? body?.refreshToken;

    if (!refreshToken) {
      throw new BadRequestException('Refresh token tidak ditemukan');
    }

    return this.authService.refresh({ refreshToken });
  }
}
