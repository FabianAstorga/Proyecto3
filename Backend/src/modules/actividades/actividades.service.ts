import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateActividadDto, ModoCreacion } from './dto/create-actividad.dto';
import { UpdateActividadDto } from './dto/update-actividad.dto';
import { Actividad } from 'src/database/entities/actividad.entity';
import { InformesService } from '../informes/informes.service';

@Injectable()
export class ActividadService {
  constructor(
    @InjectRepository(Actividad)
    private readonly actividadRepository: Repository<Actividad>,
    private readonly informesService: InformesService, 
  ) {}

  /**
   * Crea actividades según el modo especificado
   * @param dto - Datos de la actividad
   * @param usuarioId - ID del usuario autenticado (extraído del JWT)
   */
  async create(dto: CreateActividadDto, usuarioId: number) {
    switch (dto.modo) {
      case ModoCreacion.SIMPLE:
        return this.crearSimple(dto, usuarioId);
      
      case ModoCreacion.FECHAS_ESPECIFICAS:
        return this.crearConFechasEspecificas(dto, usuarioId);
      
      case ModoCreacion.REPETICION_SEMANAL:
        return this.crearConRepeticionSemanal(dto, usuarioId);
      
      default:
        throw new BadRequestException('Modo de creación no válido.');
    }
  }

  // --- Modo 1: Simple ---
  private async crearSimple(dto: CreateActividadDto, usuarioId: number) {
    if (!dto.fecha) {
      throw new BadRequestException('Se requiere fecha para el modo simple.');
    }

    const fecha = new Date(dto.fecha);

    //Obtener o crear informe automáticamente
    const informe = await this.informesService.obtenerOCrearInforme(usuarioId, fecha);

    const actividad = this.actividadRepository.create({
      titulo: dto.titulo,
      tipo: dto.tipo,
      estado: dto.estado,
      descripcion: dto.descripcion,
      fecha: fecha,
      informe_id: informe.id_informe, // Asigna el informe automáticamente
      esRepetitiva: false,
    });

    return this.actividadRepository.save(actividad);
  }

  // --- Modo 2: Fechas específicas ---
  private async crearConFechasEspecificas(dto: CreateActividadDto, usuarioId: number) {
    if (!dto.fechas_especificas || dto.fechas_especificas.length === 0) {
      throw new BadRequestException('Se requieren fechas_especificas para este modo.');
    }

    const actividades: Actividad[] = [];

    for (const f of dto.fechas_especificas) {
      const fecha = new Date(f.fecha);

      const informe = await this.informesService.obtenerOCrearInforme(usuarioId, fecha);

      const actividad = this.actividadRepository.create({
        titulo: dto.titulo,
        tipo: dto.tipo,
        estado: dto.estado,
        descripcion: dto.descripcion,
        fecha: fecha,
        informe_id: informe.id_informe,
        esRepetitiva: false,
      });

      actividades.push(actividad);
    }

    return this.actividadRepository.save(actividades);
  }

  // --- Modo 3: Repetición semanal ---
  private async crearConRepeticionSemanal(dto: CreateActividadDto, usuarioId: number) {
    if (!dto.fecha_desde || !dto.fecha_hasta || !dto.dias_semana || dto.dias_semana.length === 0) {
      throw new BadRequestException(
        'Se requieren fecha_desde, fecha_hasta y dias_semana para este modo.',
      );
    }

    const fechasGeneradas = this.generarFechasPorDiasSemana(
      dto.fecha_desde,
      dto.fecha_hasta,
      dto.dias_semana,
    );

    if (fechasGeneradas.length === 0) {
      throw new BadRequestException('No se generaron fechas con los días seleccionados.');
    }

    const actividades: Actividad[] = [];

    for (const fecha of fechasGeneradas) {
      const informe = await this.informesService.obtenerOCrearInforme(usuarioId, fecha);

      const actividad = this.actividadRepository.create({
        titulo: dto.titulo,
        tipo: dto.tipo,
        estado: dto.estado,
        descripcion: dto.descripcion,
        fecha: fecha,
        informe_id: informe.id_informe,
        esRepetitiva: true,
      });

      actividades.push(actividad);
    }

    return this.actividadRepository.save(actividades);
  }

  private generarFechasPorDiasSemana(
    desde: string,
    hasta: string,
    diasSeleccionados: string[],
  ): Date[] {
    const mapaDias: { [key: string]: number } = {
      'Domingo': 0,
      'Lunes': 1,
      'Martes': 2,
      'Miércoles': 3,
      'Jueves': 4,
      'Viernes': 5,
      'Sábado': 6,
    };

    const diasNumeros = diasSeleccionados
      .map((d) => mapaDias[d])
      .filter((n) => n !== undefined);

    if (diasNumeros.length === 0) {
      return [];
    }

    const inicio = new Date(desde);
    const fin = new Date(hasta);
    const fechas: Date[] = [];

    for (let d = new Date(inicio); d <= fin; d.setDate(d.getDate() + 1)) {
      if (diasNumeros.includes(d.getDay())) {
        fechas.push(new Date(d));
      }
    }

    return fechas;
  }

  findAll() {
    return this.actividadRepository.find({ relations: ['informe'] });
  }

  findOne(id: number) {
    return this.actividadRepository.findOne({
      where: { id_actividad: id },
      relations: ['informe'],
    });
  }

  async update(id: number, dto: UpdateActividadDto) {
    await this.actividadRepository.update(id, dto);
    return this.findOne(id);
  }

  remove(id: number) {
    return this.actividadRepository.delete(id);
  }
}