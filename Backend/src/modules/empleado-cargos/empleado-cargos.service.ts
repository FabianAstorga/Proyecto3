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
      usuario: { id: dto.id_usuario } as any, // solo ID
      cargo: { id: dto.id_cargo } as any, // solo ID
    });
    return this.repository.save(nuevo);
  }

  // Obtener todas las asignaciones
  async findAll(): Promise<EmpleadoCargo[]> {
    return this.repository.find({ relations: ["usuario", "cargo"] });
  }

  // Obtener asignación por ID
  async findOne(id: number): Promise<EmpleadoCargo> {
    const registro = await this.repository.findOne({
      where: { id },
      relations: ["usuario", "cargo"],
    });
    if (!registro)
      throw new NotFoundException(`EmpleadoCargo #${id} no encontrado`);
    return registro;
  }

  // Actualizar asignación
  async update(
    id: number,
    dto: UpdateEmpleadoCargoDto
  ): Promise<EmpleadoCargo> {
    const registro = await this.findOne(id);

    if (dto.id_usuario) registro.usuario = { id: dto.id_usuario } as any;
    if (dto.id_cargo) registro.cargo = { id: dto.id_cargo } as any;

    return this.repository.save(registro);
  }

  // Eliminar asignación
  async remove(id: number): Promise<void> {
    const registro = await this.findOne(id);
    await this.repository.remove(registro);
  }

  // Obtener todas las asignaciones de un usuario
  async findByUser(usuarioId: number): Promise<EmpleadoCargo[]> {
    return this.repository.find({
      where: { usuario: { id: usuarioId } },
      relations: ["usuario", "cargo"],
    });
  }
}
