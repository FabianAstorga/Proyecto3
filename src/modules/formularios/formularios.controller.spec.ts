import { Test, TestingModule } from '@nestjs/testing';
import { FormulariosController } from './formularios.controller';
import { FormulariosService } from './formularios.service';

describe('FormulariosController', () => {
  let controller: FormulariosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FormulariosController],
      providers: [FormulariosService],
    }).compile();

    controller = module.get<FormulariosController>(FormulariosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
