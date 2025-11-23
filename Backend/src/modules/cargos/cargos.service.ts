import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Cargo } from "src/database/entities/cargo.entity";
import { CreateCargoDto } from "./dto/create-cargo.dto";
import { UpdateCargoDto } from "./dto/update-cargo.dto";

@Injectable()
export class CargosService {
  constructor(
    @InjectRepository(Cargo)
    private readonly repository: Repository<Cargo>
  ) {}

  async create(dto: CreateCargoDto): Promise<Cargo> {
    const nuevo = this.repository.create(dto); // DTO ya tiene los campos del cargo
    return this.repository.save(nuevo);
  }

  async findAll(): Promise<Cargo[]> {
    return this.repository.find();
  }

  async findOne(id: number): Promise<Cargo> {
    const cargo = await this.repository.findOne({ where: { id_cargo: id } });
    if (!cargo) throw new NotFoundException(`Cargo #${id} no encontrado`);
    return cargo;
  }

  async update(id: number, dto: UpdateCargoDto): Promise<Cargo> {
    const cargo = await this.findOne(id);
    Object.assign(cargo, dto);
    return this.repository.save(cargo);
  }

  async remove(id: number): Promise<void> {
    const cargo = await this.findOne(id);
    await this.repository.remove(cargo);
  }
}
