import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateActividadDto } from './dto/create-actividad.dto';
import { UpdateActividadDto } from './dto/update-actividad.dto';
import { Actividad } from 'src/database/entities/actividad.entity';

@Injectable()
export class ActividadService {
  constructor(
    @InjectRepository(Actividad)
    private readonly actividadRepository: Repository<Actividad>,
  ) {}

  async create(dto: CreateActividadDto) {
    const actividad = this.actividadRepository.create(dto);
    return this.actividadRepository.save(actividad);
  }

  findAll() {
    return this.actividadRepository.find({ relations: ['informe'] });
  }

  findOne(id: number) {
    return this.actividadRepository.findOne({
      //corregido?
      where: { id_actividad: id }, // Correcto para buscar por una clave no llamada 'id'
      relations: ['informe'],
    });
  }

  async update(id: number, dto: UpdateActividadDto) {
    await this.actividadRepository.update(id, dto);
    return this.findOne(id);
  }

  remove(id: number) {
    return this.actividadRepository.delete(id);
  }
}
