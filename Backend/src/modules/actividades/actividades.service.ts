import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateActividadDto, ModoCreacion } from "./dto/create-actividad.dto";
import { UpdateActividadDto } from "./dto/update-actividad.dto";
import { Actividad } from "src/database/entities/actividad.entity";
import { Usuario } from "src/database/entities/usuario.entity";
import { TipoActividad } from "src/database/entities/tipo-actividad.entity";
import { InformesService } from "../informes/informes.service";

@Injectable()
export class ActividadService {
  constructor(
    @InjectRepository(Actividad)
    private readonly actividadRepository: Repository<Actividad>,

    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,

    @InjectRepository(TipoActividad)
    private readonly tipoActividadRepository: Repository<TipoActividad>,

    private readonly informesService: InformesService,
  ) {}

  async create(dto: CreateActividadDto, userId: number) {
    switch (dto.modo) {
      case ModoCreacion.SIMPLE:
        return this.crearSimple(dto, userId);

      case ModoCreacion.FECHAS_ESPECIFICAS:
        return this.crearConFechasEspecificas(dto, userId);

      case ModoCreacion.REPETICION_SEMANAL:
        return this.crearConRepeticionSemanal(dto, userId);

      default:
        throw new BadRequestException("Modo de creación no válido.");
    }
  }

  private crearFechaLocal(fechaString: string): Date {
    const [year, month, day] = fechaString.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  private async resolverTipoYValidarDetalle(input: {
    tipo_actividad_id: number;
    tipoActividadDetalle?: string;
  }): Promise<{ tipo: TipoActividad; detalle?: string }> {
    const tipo = await this.tipoActividadRepository.findOne({
      // ⚠️ si tu PK no se llama "id", cámbialo aquí
      where: { id: input.tipo_actividad_id } as any,
    });

    if (!tipo) {
      throw new BadRequestException("Tipo de actividad no existe.");
    }

    // Si tu entity no tiene "activo", elimina este check o ajústalo
    if ((tipo as any).activo === 0) {
      throw new BadRequestException("Tipo de actividad está inactivo.");
    }

    const requiereDetalle = Boolean((tipo as any).requiereDetalle);

    if (requiereDetalle) {
      const det = (input.tipoActividadDetalle ?? "").trim();
      if (!det) {
        throw new BadRequestException("Este tipo de actividad requiere detalle.");
      }
      return { tipo, detalle: det };
    }

    // ✅ NO usar null
    return { tipo, detalle: undefined };
  }

  // --- Modo 1: Simple ---
  private async crearSimple(dto: CreateActividadDto, userId: number) {
    if (!dto.fecha) {
      throw new BadRequestException("Se requiere fecha para el modo simple.");
    }

    const usuario = await this.usuarioRepository.findOne({
      where: { id: userId },
    });

    if (!usuario) {
      throw new NotFoundException("Usuario no encontrado");
    }

    const { tipo, detalle } = await this.resolverTipoYValidarDetalle(dto);

    const fecha = this.crearFechaLocal(dto.fecha);
    const informe = await this.informesService.obtenerOCrearInforme(userId, fecha);

    const actividad = this.actividadRepository.create({
      descripcion: dto.descripcion,
      fecha,
      estado: dto.estado || "Pendiente",
      informe,
      usuario,
      esRepetitiva: false,
      tipoActividad: tipo,
      tipoActividadDetalle: detalle ?? undefined,
    });

    return this.actividadRepository.save(actividad);
  }

  // --- Modo 2: Fechas específicas ---
  private async crearConFechasEspecificas(dto: CreateActividadDto, userId: number) {
    if (!dto.fechas_especificas || dto.fechas_especificas.length === 0) {
      throw new BadRequestException("Se requieren fechas_especificas para este modo.");
    }

    const usuario = await this.usuarioRepository.findOne({
      where: { id: userId },
    });

    if (!usuario) {
      throw new NotFoundException("Usuario no encontrado");
    }

    const { tipo, detalle } = await this.resolverTipoYValidarDetalle(dto);

    const actividades: Actividad[] = [];

    for (const f of dto.fechas_especificas) {
      const fecha = this.crearFechaLocal(f.fecha);
      const informe = await this.informesService.obtenerOCrearInforme(userId, fecha);

      const actividad = this.actividadRepository.create({
        descripcion: dto.descripcion,
        fecha,
        estado: dto.estado || "Pendiente",
        informe,
        usuario,
        esRepetitiva: false,
        tipoActividad: tipo,
        tipoActividadDetalle: detalle ?? undefined,
      });

      actividades.push(actividad);
    }

    return this.actividadRepository.save(actividades);
  }

  // --- Modo 3: Repetición semanal ---
  private async crearConRepeticionSemanal(dto: CreateActividadDto, userId: number) {
    if (
      !dto.fecha_desde ||
      !dto.fecha_hasta ||
      !dto.dias_semana ||
      dto.dias_semana.length === 0
    ) {
      throw new BadRequestException(
        "Se requieren fecha_desde, fecha_hasta y dias_semana para este modo.",
      );
    }

    const usuario = await this.usuarioRepository.findOne({
      where: { id: userId },
    });

    if (!usuario) {
      throw new NotFoundException("Usuario no encontrado");
    }

    const { tipo, detalle } = await this.resolverTipoYValidarDetalle(dto);

    const fechasGeneradas = this.generarFechasPorDiasSemana(
      dto.fecha_desde,
      dto.fecha_hasta,
      dto.dias_semana,
    );

    if (fechasGeneradas.length === 0) {
      throw new BadRequestException("No se generaron fechas con los días seleccionados.");
    }

    const actividades: Actividad[] = [];

    for (const fecha of fechasGeneradas) {
      const informe = await this.informesService.obtenerOCrearInforme(userId, fecha);

      const actividad = this.actividadRepository.create({
        descripcion: dto.descripcion,
        fecha,
        estado: dto.estado || "Pendiente",
        informe,
        usuario,
        esRepetitiva: true,
        tipoActividad: tipo,
        tipoActividadDetalle: detalle ?? undefined,
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
      Domingo: 0,
      Lunes: 1,
      Martes: 2,
      Miércoles: 3,
      Jueves: 4,
      Viernes: 5,
      Sábado: 6,
    };

    const diasNumeros = diasSeleccionados
      .map((d) => mapaDias[d])
      .filter((n) => n !== undefined);

    if (diasNumeros.length === 0) return [];

    const inicio = this.crearFechaLocal(desde);
    const fin = this.crearFechaLocal(hasta);
    const fechas: Date[] = [];

    for (let d = new Date(inicio); d <= fin; d.setDate(d.getDate() + 1)) {
      if (diasNumeros.includes(d.getDay())) {
        fechas.push(new Date(d));
      }
    }
    return fechas;
  }

  findAll() {
  return this.actividadRepository.find({
    relations: ["informe", "usuario", "tipoActividad"],
  });
}


  findByUser(userId: number) {
  return this.actividadRepository.find({
    where: { usuario: { id: userId } },
    relations: ["informe", "usuario", "tipoActividad"],
    order: { fecha: "DESC" },
  });
}


  findOne(id: number) {
  return this.actividadRepository.findOne({
    where: { id_actividad: id },
    relations: ["informe", "usuario", "tipoActividad"],
  });
}


  async update(id: number, dto: UpdateActividadDto) {
    const actividad = await this.actividadRepository.findOne({
      where: { id_actividad: id },
      relations: ["informe", "usuario"],
    });

    if (!actividad) throw new NotFoundException("Actividad no encontrada");

    if (dto.tipo_actividad_id) {
      const { tipo, detalle } = await this.resolverTipoYValidarDetalle({
        tipo_actividad_id: dto.tipo_actividad_id,
        tipoActividadDetalle: dto.tipoActividadDetalle,
      });
      actividad.tipoActividad = tipo;
      actividad.tipoActividadDetalle = detalle ?? undefined;
    } else if (dto.tipoActividadDetalle !== undefined) {
      const requiereDetalle = Boolean((actividad.tipoActividad as any)?.requiereDetalle);

      if (requiereDetalle) {
        const det = (dto.tipoActividadDetalle ?? "").trim();
        if (!det) {
          throw new BadRequestException("Este tipo de actividad requiere detalle.");
        }
        actividad.tipoActividadDetalle = det;
      } else {
        // ✅ NO usar null
        actividad.tipoActividadDetalle = undefined;
      }
    }

    if (dto.descripcion !== undefined) actividad.descripcion = dto.descripcion;
    if (dto.fecha !== undefined) actividad.fecha = this.crearFechaLocal(dto.fecha);
    if (dto.estado !== undefined) actividad.estado = dto.estado;
    if (dto.esRepetitiva !== undefined) actividad.esRepetitiva = dto.esRepetitiva;

    return this.actividadRepository.save(actividad);
  }

  remove(id: number) {
    return this.actividadRepository.delete({ id_actividad: id } as any);
  }
}
