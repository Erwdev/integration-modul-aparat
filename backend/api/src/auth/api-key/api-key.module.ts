import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiKeyService } from './api-key.service';
import { ApiKeyController } from './api-key.controller';
import { ApiKey } from './api-key.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ApiKey])], // ✅ ini wajib ada!
  controllers: [ApiKeyController],
  providers: [ApiKeyService],
  exports: [ApiKeyService], // ✅ opsional tapi berguna kalau modul lain butuh akses
})
export class ApiKeyModule {}
