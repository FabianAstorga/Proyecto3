import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Informe } from 'src/database/entities/informe.entity';

@Injectable()
export class InformesService {
  constructor(
    @InjectRepository(Informe)
    private readonly informeRepository: Repository<Informe>,
  ) {}

  /**
   * Obtiene o crea un informe para un usuario en un periodo específico
   * @param usuarioId - ID del usuario
   * @param fecha - Fecha de la actividad (se extrae el periodo)
   * @returns Informe existente o recién creado
   */
  async obtenerOCrearInforme(usuarioId: number, fecha: Date): Promise<Informe> {
    // Extraer periodo en formato "Noviembre 2025"
    const periodo = this.extraerPeriodo(fecha);

    // Buscar si ya existe un informe para ese usuario y periodo
    let informe = await this.informeRepository.findOne({
      where: {
        usuario_id: usuarioId,
        periodo: periodo,
      },
    });

    // Si no existe, crearlo
    if (!informe) {
      informe = this.informeRepository.create({
        periodo: periodo,
        usuario_id: usuarioId,
        estado: 'pendiente',
        //fechaEnvio: null, 
        // Se llenará cuando el usuario envíe el informe
      });

      informe = await this.informeRepository.save(informe);
    }

    return informe;
  }

  /**
   * Extrae el periodo en formato legible desde una fecha
   * @param fecha - Fecha de la actividad
   * @returns String en formato "Mes Año" (ej: "Noviembre 2025")
   */
  private extraerPeriodo(fecha: Date): string {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const mes = meses[fecha.getMonth()];
    const año = fecha.getFullYear();

    return `${mes} ${año}`;
  }

  // Obtener todos los informes de un usuario
  findByUsuario(usuarioId: number) {
    return this.informeRepository.find({
      where: { usuario_id: usuarioId },
      relations: ['actividades'],
      order: { id_informe: 'DESC' },
    });
  }

  // Obtener un informe específico con sus actividades
  findOne(id: number) {
    return this.informeRepository.findOne({
      where: { id_informe: id },
      relations: ['actividades', 'usuario'],
    });
  }

  // Marcar informe como enviado
  async marcarComoEnviado(id: number) {
    await this.informeRepository.update(id, {
      fechaEnvio: new Date(),
    });
    return this.findOne(id);
  }
}
