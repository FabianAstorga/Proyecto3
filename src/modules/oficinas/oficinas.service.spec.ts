import { Test, TestingModule } from '@nestjs/testing';
import { OficinasService } from './oficinas.service';

describe('OficinasService', () => {
  let service: OficinasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OficinasService],
    }).compile();

    service = module.get<OficinasService>(OficinasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
