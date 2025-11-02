import { Test, TestingModule } from '@nestjs/testing';
import { SalasController } from './salas.controller';
import { SalasService } from './salas.service';

describe('SalasController', () => {
  let controller: SalasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SalasController],
      providers: [SalasService],
    }).compile();

    controller = module.get<SalasController>(SalasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
