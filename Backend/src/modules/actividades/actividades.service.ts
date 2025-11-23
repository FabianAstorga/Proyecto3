import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateActividadDto } from "./dto/create-actividad.dto";
import { UpdateActividadDto } from "./dto/update-actividad.dto";
import { Actividad } from "src/database/entities/actividad.entity";
import { Usuario } from "src/database/entities/usuario.entity";

@Injectable()
export class ActividadService {
  constructor(
    @InjectRepository(Actividad)
    private readonly actividadRepository: Repository<Actividad>,

    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>
  ) {}

  // 👇 ahora recibe también el id del usuario (desde el token)
  async create(dto: CreateActividadDto, userId: number) {
    const usuario = await this.usuarioRepository.findOne({
      where: { id: userId },
    });

    if (!usuario) {
      throw new NotFoundException("Usuario no encontrado para la actividad");
    }

    const actividad = this.actividadRepository.create({
      ...dto,
      usuario, // relación ManyToOne -> se guardará usuario_id
    });

    return this.actividadRepository.save(actividad);
  }

  findAll() {
    return this.actividadRepository.find({
      relations: ["informe", "usuario"],
    });
  }

  findOne(id: number) {
    return this.actividadRepository.findOne({
      where: { id_actividad: id },
      relations: ["informe", "usuario"],
    });
  }
  /*
  async update(id: number, dto: UpdateActividadDto) {
    await this.actividadRepository.update(id, dto);
    return this.findOne(id);
  } */

  remove(id: number) {
    return this.actividadRepository.delete(id);
  }
}
