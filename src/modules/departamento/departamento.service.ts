import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDepartamentoDto } from './dto/create-departamento.dto';
import { UpdateDepartamentoDto } from './dto/update-departamento.dto';
import { Departamento } from './entities/departamento.entity';

@Injectable()
export class DepartamentoService {
  constructor(
    @InjectRepository(Departamento)
    private readonly departamentoRepository: Repository<Departamento>,
  ) {}

  create(createDepartamentoDto: CreateDepartamentoDto) {
    const nuevoDepto = this.departamentoRepository.create(createDepartamentoDto);
    return this.departamentoRepository.save(nuevoDepto);
  }

  findAll() {
    return this.departamentoRepository.find();
  }

  async findOne(id: number) {
    const depto = await this.departamentoRepository.findOneBy({ id });
    if (!depto) {
      throw new NotFoundException(`Departamento con id ${id} no encontrado.`);
    }
    return depto;
  }

  async update(id: number, updateDepartamentoDto: UpdateDepartamentoDto) {
    const depto = await this.findOne(id);
    this.departamentoRepository.merge(depto, updateDepartamentoDto);
    return this.departamentoRepository.save(depto);
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.departamentoRepository.delete(id);
  }
}
