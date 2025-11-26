import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Horario } from '../../database/entities/horario.entity';
import { Usuario } from '../../database/entities/usuario.entity';
import { CreateHorarioDto } from './dto/create-horario.dto';

@Injectable()
export class HorariosService {
  constructor(
    @InjectRepository(Horario)
    private readonly horarioRepo: Repository<Horario>,
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
  ) {}

  async findByUsuario(usuarioId: number): Promise<Horario[]> {
    return this.horarioRepo.find({
      where: { usuario: { id: usuarioId } },
      relations: ['usuario'],
    });
  }

  async replaceForUsuario(
    usuarioId: number,
    items: CreateHorarioDto[],
  ): Promise<Horario[]> {
    const usuario = await this.usuarioRepo.findOne({ where: { id: usuarioId } });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    // Limpio los horarios actuales del usuario
    await this.horarioRepo.delete({ usuario: { id: usuarioId } as any });

    const toSave = items.map((dto) => {
      const h = new Horario();
      h.bloque = dto.bloque;
      h.fecha = new Date(dto.fecha);
      h.horaInicio = new Date(`${dto.fecha}T${dto.horaInicio}:00`);
      h.horaFin = dto.horaFin
        ? new Date(`${dto.fecha}T${dto.horaFin}:00`)
        : null;
      h.esDisponible = dto.esDisponible ?? true;
      h.titulo = dto.titulo ?? null;
      h.sala = dto.sala ?? null;
      h.descripcion = dto.descripcion ?? null;
      h.usuario = usuario;
      return h;
    });

    return this.horarioRepo.save(toSave);
  }
}
