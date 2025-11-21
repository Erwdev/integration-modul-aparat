import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { RateLimitMiddleware } from './common/middleware/rate-limit.middleware';
import { AuditLoggerMiddleware } from './common/middleware/audit-logger.middleware';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
// import { AllExceptionsFilter } from './common/filters/all-exceptions.filter'; // ❌ HAPUS INI
import * as express from 'express';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'debug', 'log', 'verbose'],
  });

  app.use(
    '/uploads',
    express.static(path.join(process.cwd(), 'uploads')),
  );

  const configService = app.get(ConfigService);
  
  app.use(
    helmet({
      contentSecurityPolicy: false, 
      crossOriginEmbedderPolicy: false,
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Integration Modul Aparat API')
    .setDescription('API Documentation untuk manajemen Aparat Desa, Surat, dan Ekspedisi')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', name: 'JWT', description: 'Enter JWT token', in: 'header' },
      'JWT-auth',
    )
    .addApiKey({ type: 'apiKey', name: 'X-API-KEY', in: 'header', description: 'API Key' }, 'api-key')
    .addTag('auth', 'Authentication & Authorization')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
  });

  const rateLimiter = new RateLimitMiddleware(configService);
  const auditLogger = new AuditLoggerMiddleware();

  app.use(rateLimiter.use.bind(rateLimiter));
  app.use(auditLogger.use.bind(auditLogger));

  app.enableCors({
    origin: [
      'http://localhost:3001', 
      'http://127.0.0.1:3001',
      configService.get<string>('CORS_ORIGIN', 'http://localhost:3001')
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-KEY'],
    credentials: true,
  });

  const port = configService.get<number>('PORT', 3000);
  const host = configService.get<string>('HOST', '0.0.0.0');

  await app.listen(port, host);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📖 Swagger docs available at: http://localhost:${port}/api/docs`);
}

void bootstrap();