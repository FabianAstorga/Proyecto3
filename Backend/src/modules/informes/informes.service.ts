import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Informe } from 'src/database/entities/informe.entity';
import { Usuario } from 'src/database/entities/usuario.entity';

@Injectable()
export class InformesService {
  constructor(
    @InjectRepository(Informe)
    private readonly informeRepository: Repository<Informe>,
    
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async obtenerOCrearInforme(usuarioId: number, fecha: Date): Promise<Informe> {
    const periodo = this.extraerPeriodo(fecha);

    // Buscar informe con relación al usuario
    let informe = await this.informeRepository.findOne({
      where: {
        usuario: { id: usuarioId },
        periodo: periodo,
      },
    });

    if (!informe) {
      const usuario = await this.usuarioRepository.findOne({
        where: { id: usuarioId },
      });

      // 👇 Validar que el usuario existe
      if (!usuario) {
        throw new NotFoundException(`Usuario con ID ${usuarioId} no encontrado`);
      }

      informe = this.informeRepository.create({
        periodo: periodo,
        usuario: usuario, // 👈 Ahora TypeScript sabe que no es null
        estado: 'pendiente',
      });

      informe = await this.informeRepository.save(informe);
    }

    return informe;
  }

  private extraerPeriodo(fecha: Date): string {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const mes = meses[fecha.getMonth()];
    const año = fecha.getFullYear();

    return `${mes} ${año}`;
  }

  findByUsuario(usuarioId: number) {
    return this.informeRepository.find({
      where: { usuario: { id: usuarioId } },
      relations: ['actividades'],
      order: { id_informe: 'DESC' },
    });
  }

  findOne(id: number) {
    return this.informeRepository.findOne({
      where: { id_informe: id },
      relations: ['actividades', 'usuario'],
    });
  }

  async marcarComoEnviado(id: number) {
    await this.informeRepository.update(id, {
      fechaEnvio: new Date(),
      estado: 'enviado',
    });
    return this.findOne(id);
  }
}
