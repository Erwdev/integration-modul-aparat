import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { RateLimitMiddleware } from './common/middleware/rate-limit.middleware';
import { AuditLoggerMiddleware } from './common/middleware/audit-logger.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'debug', 'log', 'verbose'],
  });
  const configService = app.get(ConfigService);

  // ✅ Global ValidationPipe (supaya DTO auto-validasi)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ✅ Aktifkan middleware global kamu
const rateLimiter = new RateLimitMiddleware();
const auditLogger = new AuditLoggerMiddleware();

app.use(rateLimiter.use.bind(rateLimiter));
app.use(auditLogger.use.bind(auditLogger));


  // ✅ Aktifkan CORS (kalau frontend nanti perlu akses)
  app.enableCors({
    origin: configService.get<string>('CORS_ORIGIN', 'http://localhost:5173'),
    credentials: true,
  });

  const port = configService.get<number>('PORT', 3000);
  const host = configService.get<string>('HOST', 'localhost');

  await app.listen(port);
  console.log(`🚀 Application is running on: http://${host}:${port}`);
  console.log(`📖 Environment: ${configService.get('NODE_ENV', 'development')}`);
}

void bootstrap();
