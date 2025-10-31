import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);
//   const configService = app.get(ConfigService);

//   const port = configService.get<number>('PORT', 3000);
//   const host = configService.get<string>('HOST', 'localhost')

//   await app.listen(port);
//   console.log(`Application is running on: http://${host}:${port}`);
// }
// bootstrap();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.enableCors({
    origin: configService.get<string>('CORS_ORIGIN', 'http://localhost:5173'),
    credentials: true, //allow cookies
  });

  const port = configService.get<number>('PORT', 3000);
  const host = configService.get<string>('HOST', 'localhost');

  await app.listen(port);
  console.log(`Application is running on: http://${host}:${port}`);
  console.log(
    `📖 Environment: ${configService.get('NODE_ENV', 'development')}`,
  );
}
void bootstrap();
