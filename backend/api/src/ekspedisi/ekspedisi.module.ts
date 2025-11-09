import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ekspedisi } from './entities/ekspedisi.entity';
import { EkspedisiService } from './ekspedisi.service';
import { EkspedisiController } from './ekspedisi.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Ekspedisi])],
  controllers: [EkspedisiController],
  providers: [EkspedisiService],
  exports: [EkspedisiService],
})
export class EkspedisiModule {}
