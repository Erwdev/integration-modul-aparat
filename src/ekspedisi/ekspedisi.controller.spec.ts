import { Test, TestingModule } from '@nestjs/testing';
import { EkspedisiController } from './ekspedisi.controller';

describe('EkspedisiController', () => {
  let controller: EkspedisiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EkspedisiController],
    }).compile();

    controller = module.get<EkspedisiController>(EkspedisiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
