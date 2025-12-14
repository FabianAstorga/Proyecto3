import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindOptionsWhere, Repository } from 'typeorm';
import { Feriado } from '../../database/entities/feriado.entity';
import { CreateFeriadoDto } from './dto/create-feriado.dto';
import { UpdateFeriadoDto } from './dto/update-feriado.dto';
import { QueryFeriadosDto } from './dto/query-feriados.dto';

@Injectable()
export class FeriadosService {
  constructor(
    @InjectRepository(Feriado)
    private readonly repo: Repository<Feriado>,
  ) {}

  async findAll(query: QueryFeriadosDto) {
    const where: FindOptionsWhere<Feriado> = {};

    // rango por fecha
    if (query.from && query.to) {
      where.fecha = Between(query.from, query.to) as any;
    } else if (query.from || query.to) {
      throw new BadRequestException('Debes enviar both query params: from y to');
    }

    if (query.regionCodigo) where.regionCodigo = query.regionCodigo;
    if (query.tipo) where.tipo = query.tipo as any;

    if (query.activo === 'true') where.activo = true;
    if (query.activo === 'false') where.activo = false;

    return this.repo.find({
      where,
      order: { fecha: 'ASC' },
    });
  }

  async findOne(id: number) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Feriado no encontrado');
    return item;
  }

  async create(dto: CreateFeriadoDto) {
    // regla mínima: si tipo es nacional, regionCodigo debería ser null
    if (dto.tipo === 'nacional' && dto.regionCodigo) {
      throw new BadRequestException('Un feriado nacional no debe tener regionCodigo');
    }

    const entity = this.repo.create({
      ...dto,
      activo: dto.activo ?? true,
    });
    return this.repo.save(entity);
  }

  async update(id: number, dto: UpdateFeriadoDto) {
    const item = await this.findOne(id);

    if (dto.tipo === 'nacional' && dto.regionCodigo) {
      throw new BadRequestException('Un feriado nacional no debe tener regionCodigo');
    }

    Object.assign(item, dto);
    return this.repo.save(item);
  }

  async softDisable(id: number) {
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
