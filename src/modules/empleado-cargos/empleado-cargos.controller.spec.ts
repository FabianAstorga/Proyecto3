import { Test, TestingModule } from '@nestjs/testing';
import { EmpleadoCargoController } from './empleado-cargos.controller';
import { EmpleadoCargoService } from './empleado-cargos.service';

describe('EmpleadoCargoController', () => {
  let controller: EmpleadoCargoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmpleadoCargoController],
      providers: [EmpleadoCargoService],
    }).compile();

    controller = module.get<EmpleadoCargoController>(EmpleadoCargoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
