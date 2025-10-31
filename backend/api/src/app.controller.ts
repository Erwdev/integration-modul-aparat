import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';
import { APP_CONSTANTS } from './constants/app.constants';

interface HealthResponse {
  status: string;
  service: string;
  timestamp: string;
  uptime: number;
}

interface RootResponse {
  message: string;
  version: string;
  status: string;
  environment: string;
}

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  getRoot(): RootResponse {
    return {
      message:
        this.configService.get<string>('APP_NAME') || APP_CONSTANTS.APP_NAME,
      version:
        this.configService.get<string>('APP_VERSION') ||
        APP_CONSTANTS.APP_VERSION,
      status: APP_CONSTANTS.STATUS.ACTIVE,
      environment: this.configService.get<string>('NODE_ENV') || 'development',
    };
  }

  @Get('health')
  getHealth(): HealthResponse {
    return {
      status: 'ok',
      service: 'Aparat-backend',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
    };
  }
}
