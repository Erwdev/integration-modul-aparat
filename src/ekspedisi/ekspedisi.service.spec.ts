import { Test, TestingModule } from '@nestjs/testing';
import { EkspedisiService } from './ekspedisi.service';

describe('EkspedisiService', () => {
  let service: EkspedisiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EkspedisiService],
    }).compile();

    service = module.get<EkspedisiService>(EkspedisiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
