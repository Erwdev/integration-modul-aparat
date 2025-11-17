import { NestFactory } from '@nestjs/core';
import { SeedersModule } from './seeder.module';
import { DatabaseSeeder } from './seeds';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Seeder CLI');

  try {
    logger.log('🚀 Creating seeder application...');
    
    const app = await NestFactory.createApplicationContext(SeedersModule, {
      logger: ['error', 'warn', 'log'],
    });

    const seeder = app.get(DatabaseSeeder);
    const command = process.argv[2];

    switch (command) {
      case 'seed':
        logger.log('📦 Running seeders...');
        await seeder.seedAll();
        break;

      case 'rollback':
        logger.log('🔄 Rolling back seeders...');
        await seeder.rollbackAll();
        break;

      default:
        logger.error('❌ Invalid command. Use: npm run seed or npm run seed:rollback');
        process.exit(1);
    }

    await app.close();
    logger.log('✅ Seeder completed successfully');
    process.exit(0);

  } catch (error) {
    logger.error('❌ Seeder failed:', error);
    process.exit(1);
  }
}

bootstrap();