import { Test, TestingModule } from '@nestjs/testing';
import { InformesService } from './informes.service';

describe('InformesService', () => {
  let service: InformesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InformesService],
    }).compile();

    service = module.get<InformesService>(InformesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
