import { Test, TestingModule } from '@nestjs/testing';
import { ActividadController } from './actividades.controller';
import { ActividadService } from './actividades.service';

describe('ActividadesController', () => {
  let controller: ActividadController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActividadController],
      providers: [ActividadService],
    }).compile();

    controller = module.get<ActividadController>(ActividadController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
