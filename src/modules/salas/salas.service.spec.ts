import { Test, TestingModule } from '@nestjs/testing';
import { SalasService } from './salas.service';

describe('SalasService', () => {
  let service: SalasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SalasService],
    }).compile();

    service = module.get<SalasService>(SalasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
