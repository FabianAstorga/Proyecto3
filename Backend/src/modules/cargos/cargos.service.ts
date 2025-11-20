import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCargoDto } from './dto/create-cargo.dto';
import { UpdateCargoDto } from './dto/update-cargo.dto';
import { Cargo } from 'src/database/entities/cargo.entity';

@Injectable()
export class CargosService {
  constructor(
    @InjectRepository(Cargo)
    private readonly cargoRepository: Repository<Cargo>,
  ) {}

  async create(dto: CreateCargoDto) {
    const existente = await this.cargoRepository.findOne({
      where: { ocupacion: dto.ocupacion },
    });
    if (existente)
      throw new ConflictException(`El cargo ${dto.ocupacion} ya existe.`);
    const cargo = this.cargoRepository.create(dto);
    return this.cargoRepository.save(cargo);
  }

  findAll() {
    return this.cargoRepository.find();
  }

  async findOne(id: number) {
    const cargo = await this.cargoRepository.findOne({
      where: { id_cargo: id },
    });
    if (!cargo)
      throw new NotFoundException(`Cargo con ID ${id} no encontrado.`);
    return cargo;
  }

  async update(id: number, dto: UpdateCargoDto) {
    const cargo = await this.findOne(id);
    Object.assign(cargo, dto);
    return this.cargoRepository.save(cargo);
  }

  async remove(id: number) {
    const cargo = await this.findOne(id);
    return this.cargoRepository.remove(cargo);
  }
}
