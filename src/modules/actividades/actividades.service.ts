import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateActividadDto } from './dto/create-actividad.dto';
import { UpdateActividadDto } from './dto/update-actividad.dto';
import { Actividad } from 'src/database/entities/actividad.entity';
import { Informe } from 'src/database/entities/informe.entity';

@Injectable()
export class ActividadesService {

  constructor(
    @InjectRepository(Actividad)
    private readonly actividadRepository: Repository<Actividad>,
  ) {}

 
  create(createActividadDto: CreateActividadDto) { 
    
    const { id_informe, ...restOfDto } = createActividadDto;


    const nuevaActividad = this.actividadRepository.create({
      ...restOfDto, 
      informe: { id_informe: id_informe } as Informe 
    });

    return this.actividadRepository.save(nuevaActividad);
  }

  findAll() {
    return this.actividadRepository.find();
  }

  async findOne(id: number) {
    const actividad = await this.actividadRepository.findOneBy({ id_actividad: id });
    if (!actividad) {
      throw new NotFoundException(`Actividad con id ${id} no encontrada.`);
    }
    return actividad;
  }


  async update(id: number, updateActividadDto: UpdateActividadDto) {
   
    const { informe_id, ...restOfDto } = updateActividadDto;
    
    const actividad = await this.findOne(id);
    this.actividadRepository.merge(actividad, restOfDto);

    if (informe_id) {
      actividad.informe = { id_informe: informe_id } as Informe;
    }

    return this.actividadRepository.save(actividad);
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.actividadRepository.delete(id);
  }
}
