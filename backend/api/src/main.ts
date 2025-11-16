import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { RateLimitMiddleware } from './common/middleware/rate-limit.middleware';
import { AuditLoggerMiddleware } from './common/middleware/audit-logger.middleware';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'debug', 'log', 'verbose'],
  });
  const configService = app.get(ConfigService);
  app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
    crossOriginEmbedderPolicy: false
  }))
  // app.useGlobalFilters(new AllExceptionsFilter)

  // ✅ Global ValidationPipe (supaya DTO auto-validasi)
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
    .setDescription(
      'API Documentation untuk manajemen Aparat Desa, Surat, dan Ekspedisi',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth', // This name here is important for matching up with @ApiBearerAuth() in your controllers!
    )
    .addApiKey(
      {
        type: 'apiKey',
        name: 'X-API-KEY',
        in: 'header',
        description: 'API Key for external integrations',
      },
      'api-key',
    )
    .addTag('auth', 'Authentication & Authorization')
    .addTag('aparat', 'Manajemen Aparat Desa')
    .addTag('surat', 'Manajemen Surat')
    .addTag('ekspedisi', 'Manajemen Ekspedisi Surat')
    .addTag('events', 'Event Bus & Integration Events')
    .addTag('users', 'User Management')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // Keep auth token after page refresh
      docExpansion: 'none', // Collapse all endpoints by default
      filter: true, // Enable search
      showRequestDuration: true,
    },
  });

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
  console.log(`📖 Swagger docs available at: http://localhost:${port}/api/docs`);
  console.log(
    `📖 Environment: ${configService.get('NODE_ENV', 'development')}`,
  );
}

void bootstrap();
