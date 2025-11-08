import { Module } from '@nestjs/common';
import { EkspedisiController } from './ekspedisi.controller';
import { EkspedisiService } from './ekspedisi.service';

@Module({
  controllers: [EkspedisiController],
  providers: [EkspedisiService]
})
export class EkspedisiModule {}
