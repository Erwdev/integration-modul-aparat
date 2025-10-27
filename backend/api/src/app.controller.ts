import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';
import { APP_CONSTANTS } from './constants/app.constants';

// @Controller()
// export class AppController {
//   constructor(private readonly appService: AppService) {}

//   @Get()
//   getRoot(): object{
//     return{ 
//       message: 'Aparat Backend API - Sprint 1',
//       version: '1.0.0',
//       status: 'active',
//     };
//   }

//   @Get('health')
//   getHealth(): object{
//     return{
//       status: 'ok',
//       timestamp: new Date().toString(),
//       service: 'aparat-backend',
//       uptime: process.uptime(),
//     };
//   }
// }

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService,
  ){}

  @Get()
  getRoot(): object {
    return{ 
      message: this.configService.get('APP_NAME', APP_CONSTANTS.APP_NAME),
      version: this.configService.get('APP_VERSION', APP_CONSTANTS.APP_VERSION),
      status: APP_CONSTANTS.STATUS.ACTIVE,
      environment: this.configService.get('NODE_ENV', 'development'),
    };
  }

  @Get('health')
  getHealth(): object {
    return  {
      status: 'ok',
      service: 'Aparat-backend',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    }
  }

}
