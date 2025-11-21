/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Informe } from './informe.entity';

@Entity('actividad')
export class Actividad {
  @PrimaryGeneratedColumn()
  id_actividad: number;

  @Column({ type: 'varchar', length: 50 })
  titulo: string;

  @Column({ type: 'varchar', length: 255 })
  descripcion: string;

  @Column({ type: 'date' })
  fecha: Date;

  @Column({ type: 'varchar', length: 100 })
  tipo: string;

  @Column({ 
    type: 'enum',
    enum: ['Pendiente', 'En Progreso', 'Realizada', 'Cancelada'],
    default: 'Pendiente'
  })
  estado: string;

  @Column({ type: 'boolean', default: false })
  esRepetitiva: boolean;

  @Column({ type: 'int' })
  informe_id: number;

  // Relación: Actividad "pertenece a" Informe
  @ManyToOne(() => Informe, (informe) => informe.actividades, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'informe_id' })
  informe: Informe;
}
