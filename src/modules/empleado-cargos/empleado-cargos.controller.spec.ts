import { Test, TestingModule } from '@nestjs/testing';
import { EmpleadoCargosController } from './empleado-cargos.controller';
import { EmpleadoCargosService } from './empleado-cargos.service';

describe('EmpleadoCargosController', () => {
  let controller: EmpleadoCargosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmpleadoCargosController],
      providers: [EmpleadoCargosService],
    }).compile();

    controller = module.get<EmpleadoCargosController>(EmpleadoCargosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
