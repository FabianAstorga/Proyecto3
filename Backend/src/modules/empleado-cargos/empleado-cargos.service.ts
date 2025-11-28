import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { EmpleadoCargo } from "src/database/entities/empleado-cargo.entity";
import { CreateEmpleadoCargoDto } from "./dto/create-empleado-cargo.dto";
import { UpdateEmpleadoCargoDto } from "./dto/update-empleado-cargo.dto";

@Injectable()
export class EmpleadoCargoService {
  constructor(
    @InjectRepository(EmpleadoCargo)
    private readonly repository: Repository<EmpleadoCargo>
  ) {}

  // Crear asignación cargo ↔ usuario
  async create(dto: CreateEmpleadoCargoDto): Promise<EmpleadoCargo> {
    const nuevo = this.repository.create({
      id_usuario: dto.id_usuario,
      id_cargo: dto.id_cargo,
    });

    const saved = await this.repository.save(nuevo);
    // devolvemos con relaciones cargadas
    return this.findOne(saved.id);
  }

  // Obtener todas las asignaciones
  async findAll(): Promise<EmpleadoCargo[]> {
    // las relaciones ya son eager, pero esto es seguro igual
    return this.repository.find();
  }

  // Obtener asignación por ID
  async findOne(id: number): Promise<EmpleadoCargo> {
    const registro = await this.repository.findOne({ where: { id } });

    if (!registro) {
      throw new NotFoundException(`EmpleadoCargo #${id} no encontrado`);
    }
    return registro;
  }

  // Actualizar asignación
  async update(
    id: number,
    dto: UpdateEmpleadoCargoDto
  ): Promise<EmpleadoCargo> {
    const partial: Partial<EmpleadoCargo> = {};

    if (dto.id_usuario !== undefined) {
      partial.id_usuario = dto.id_usuario;
    }
    if (dto.id_cargo !== undefined) {
      partial.id_cargo = dto.id_cargo;
    }

    // si no hay nada que actualizar, devolvemos el registro actual
    if (!Object.keys(partial).length) {
      return this.findOne(id);
    }

    await this.repository.update(id, partial);
    return this.findOne(id);
  }

  // Eliminar asignación
  async remove(id: number): Promise<void> {
    const registro = await this.findOne(id);
    await this.repository.remove(registro);
  }

  // Obtener todas las asignaciones de un usuario
  async findByUser(usuarioId: number): Promise<EmpleadoCargo[]> {
    return this.repository.find({
      where: { id_usuario: usuarioId },
    });
  }
}
