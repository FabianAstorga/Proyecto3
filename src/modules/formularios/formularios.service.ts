import { Injectable } from '@nestjs/common';
import { CreateFormularioDto } from './dto/create-formulario.dto';
import { UpdateFormularioDto } from './dto/update-formulario.dto';

@Injectable()
export class FormulariosService {
  create(createFormularioDto: CreateFormularioDto) {
    return 'This action adds a new formulario';
  }

  findAll() {
    return `This action returns all formularios`;
  }

  findOne(id: number) {
    return `This action returns a #${id} formulario`;
  }

  update(id: number, updateFormularioDto: UpdateFormularioDto) {
    return `This action updates a #${id} formulario`;
  }

  remove(id: number) {
    return `This action removes a #${id} formulario`;
  }
}
