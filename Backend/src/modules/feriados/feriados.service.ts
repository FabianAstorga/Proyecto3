import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

  // -------------------------
  // LISTAR
  // -------------------------
  async findAll(query: QueryFeriadosDto) {
    const where: FindOptionsWhere<Feriado> = {};

    // rango por fecha
    if (query.from && query.to) {
      where.fecha = Between(query.from, query.to) as any;
    } else if (query.from || query.to) {
      throw new BadRequestException(
        'Debes enviar ambos query params: from y to',
      );
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

  // -------------------------
  // OBTENER UNO
  // -------------------------
  async findOne(id: number) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Feriado no encontrado');
    return item;
  }

  // -------------------------
  // CREAR
  // -------------------------
  async create(dto: CreateFeriadoDto) {
    // regla: nacional no lleva región
    if (dto.tipo === 'nacional' && dto.regionCodigo) {
      throw new BadRequestException(
        'Un feriado nacional no debe tener regionCodigo',
      );
    }

    const entity = this.repo.create({
      fecha: dto.fecha,
      nombre: dto.nombre ?? null,
      tipo: dto.tipo,
      regionCodigo:
        dto.tipo === 'nacional' ? null : dto.regionCodigo ?? null,
      activo: dto.activo ?? true,
    });

    return this.repo.save(entity);
  }

  // -------------------------
  // ACTUALIZAR
  // -------------------------
  async update(id: number, dto: UpdateFeriadoDto) {
    const item = await this.findOne(id);

    // valores finales considerando partial update
    const tipoFinal = dto.tipo ?? item.tipo;
    const regionFinal =
      dto.regionCodigo !== undefined
        ? dto.regionCodigo
        : item.regionCodigo;

    if (tipoFinal === 'nacional' && regionFinal) {
      throw new BadRequestException(
        'Un feriado nacional no debe tener regionCodigo',
      );
    }

    if (dto.fecha !== undefined) item.fecha = dto.fecha;
    if (dto.nombre !== undefined) item.nombre = dto.nombre ?? null;
    if (dto.tipo !== undefined) item.tipo = dto.tipo;
    if (dto.activo !== undefined) item.activo = dto.activo;

    // si pasa a nacional, limpiamos región
    if (dto.tipo === 'nacional') {
      item.regionCodigo = null;
    } else if (dto.regionCodigo !== undefined) {
      item.regionCodigo = dto.regionCodigo ?? null;
    }

    return this.repo.save(item);
  }

  // -------------------------
  // DESACTIVAR (SOFT)
  // -------------------------
  async softDisable(id: number) {
    const item = await this.findOne(id);
    item.activo = false;
    return this.repo.save(item);
  }

  // -------------------------
  // ELIMINAR
  // -------------------------
  async remove(id: number) {
    const item = await this.findOne(id);
    await this.repo.remove(item);
    return { ok: true };
  }
}
