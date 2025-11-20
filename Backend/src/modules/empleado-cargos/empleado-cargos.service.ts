import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEmpleadoCargoDto } from './dto/create-empleado-cargo.dto';
import { UpdateEmpleadoCargoDto } from './dto/update-empleado-cargo.dto';
import { EmpleadoCargo } from 'src/database/entities/empleado-cargo.entity';

@Injectable()
export class EmpleadoCargoService {
  constructor(
    @InjectRepository(EmpleadoCargo)
    private readonly repository: Repository<EmpleadoCargo>,
  ) {}

  async create(dto: CreateEmpleadoCargoDto): Promise<EmpleadoCargo> {
    const nuevo = this.repository.create(dto);
    return this.repository.save(nuevo);
  }

  async findAll(): Promise<EmpleadoCargo[]> {
    return this.repository.find({ relations: ['usuario', 'cargo'] });
  }

  async findOne(id: number): Promise<EmpleadoCargo> {
    const encontrado = await this.repository.findOne({
      where: { id },
      relations: ['usuario', 'cargo'],
    });
    if (!encontrado)
      throw new NotFoundException(`EmpleadoCargo #${id} no encontrado`);
    return encontrado;
  }

  async update(
    id: number,
    dto: UpdateEmpleadoCargoDto,
  ): Promise<EmpleadoCargo> {
    const registro = await this.findOne(id);
    Object.assign(registro, dto);
    return this.repository.save(registro);
  }

  async remove(id: number): Promise<void> {
    const registro = await this.findOne(id);
    await this.repository.remove(registro);
  }
}
