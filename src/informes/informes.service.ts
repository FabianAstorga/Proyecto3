import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateInformeDto } from './dto/create-informe.dto';
import { UpdateInformeDto } from './dto/update-informe.dto';
import { Informe } from 'src/database/entities/informe.entity'; 
import { Usuario } from 'src/database/entities/usuario.entity'; 

@Injectable()
export class InformesService {
  constructor(
    @InjectRepository(Informe)
    private readonly informeRepository: Repository<Informe>,
  ) {}

  create(createInformeDto: CreateInformeDto) {
    const { usuarioId, ...restOfDto } = createInformeDto;

    const nuevoInforme = this.informeRepository.create({
      ...restOfDto,
      usuario: { id: usuarioId } as Usuario, 
    });
    return this.informeRepository.save(nuevoInforme);
  }

  findAll() {
    return this.informeRepository.find({ relations: ['usuario', 'actividades'] });
  }

  async findOne(id: number) {
    const informe = await this.informeRepository.findOne({
      where: { id_informe: id },
      relations: ['usuario', 'actividades'], 
    });
    if (!informe) {
      throw new NotFoundException(`Informe con id ${id} no encontrado.`);
    }
    return informe;
  }
  
  async update(id: number, updateInformeDto: UpdateInformeDto) {
    const { usuarioId, ...restOfDto } = updateInformeDto;
    const informe = await this.findOne(id);
    
    this.informeRepository.merge(informe, restOfDto);

    if (usuarioId) {
      informe.usuario = { id: usuarioId } as Usuario;
    }
    return this.informeRepository.save(informe);
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.informeRepository.delete(id);
  }
}
