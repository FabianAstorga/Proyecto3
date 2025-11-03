import { Injectable } from '@nestjs/common';
import { CreateActividadDto } from './dto/create-actividade.dto';
import { UpdateActividadeDto } from './dto/update-actividade.dto';

@Injectable()
export class ActividadesService {
  create(createActividadeDto: CreateActividadDto) {
    return 'This action adds a new actividade';
  }

  findAll() {
    return `This action returns all actividades`;
  }

  findOne(id: number) {
    return `This action returns a #${id} actividade`;
  }

  update(id: number, updateActividadeDto: UpdateActividadeDto) {
    return `This action updates a #${id} actividade`;
  }

  remove(id: number) {
    return `This action removes a #${id} actividade`;
  }
}
