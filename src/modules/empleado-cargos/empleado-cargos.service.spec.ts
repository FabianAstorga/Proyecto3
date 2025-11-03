import { Test, TestingModule } from '@nestjs/testing';
import { EmpleadoCargosService } from './empleado-cargos.service';

describe('EmpleadoCargosService', () => {
  let service: EmpleadoCargosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmpleadoCargosService],
    }).compile();

    service = module.get<EmpleadoCargosService>(EmpleadoCargosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
