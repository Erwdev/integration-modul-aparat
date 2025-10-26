import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getRoot(): object{
    return{ 
      message: 'Aparat Backend API - Sprint 1',
      version: '1.0.0',
      status: 'active',
    };
  }

  @Get('health')
  getHealth(): object{
    return{
      status: 'ok',
      timestamp: new Date().toString(),
      service: 'aparat-backend',
      uptime: process.uptime(),
    };
  }
  // getHello(): string {
  //   return this.appService.getHello();
  // }
}
