import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { TipoActividad } from '../../database/entities/tipo-actividad.entity';
import { CreateTipoActividadDto } from './dto/create-tipo-actividad.dto';
import { UpdateTipoActividadDto } from './dto/update-tipo-actividad.dto';
import { QueryTiposActividadDto } from './dto/query-tipos-actividad.dto';

@Injectable()
export class TiposActividadService {
  constructor(
    @InjectRepository(TipoActividad)
    private readonly repo: Repository<TipoActividad>,
  ) {}

  async findAll(query: QueryTiposActividadDto) {
    const where: FindOptionsWhere<TipoActividad> = {};
    if (query.activo === 'true') where.activo = true;
    if (query.activo === 'false') where.activo = false;

    return this.repo.find({
      where,
      order: { orden: 'ASC', nombre: 'ASC' },
    });
  }

  async findOne(id: number) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Tipo de actividad no encontrado');
    return item;
  }

  async create(dto: CreateTipoActividadDto) {
    const entity = this.repo.create({
      ...dto,
      orden: dto.orden ?? 0,
      activo: dto.activo ?? true,
      requiereDetalle: dto.requiereDetalle ?? false,
    });
    return this.repo.save(entity);
  }

  async update(id: number, dto: UpdateTipoActividadDto) {
    const item = await this.findOne(id);
    Object.assign(item, dto);
    return this.repo.save(item);
  }

  async disable(id: number) {
    const item = await this.findOne(id);
    item.activo = false;
    return this.repo.save(item);
  }

  async remove(id: number) {
    const item = await this.findOne(id);
    await this.repo.remove(item);
    return { ok: true };
  }
}
