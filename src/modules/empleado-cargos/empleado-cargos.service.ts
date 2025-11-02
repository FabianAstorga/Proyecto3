import { Injectable } from '@nestjs/common';
import { CreateEmpleadoCargoDto } from './dto/create-empleado-cargo.dto';
import { UpdateEmpleadoCargoDto } from './dto/update-empleado-cargo.dto';

@Injectable()
export class EmpleadoCargosService {
  create(createEmpleadoCargoDto: CreateEmpleadoCargoDto) {
    return 'This action adds a new empleadoCargo';
  }

  findAll() {
    return `This action returns all empleadoCargos`;
  }

  findOne(id: number) {
    return `This action returns a #${id} empleadoCargo`;
  }

  update(id: number, updateEmpleadoCargoDto: UpdateEmpleadoCargoDto) {
    return `This action updates a #${id} empleadoCargo`;
  }

  remove(id: number) {
    return `This action removes a #${id} empleadoCargo`;
  }
}
