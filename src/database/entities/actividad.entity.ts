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
  //modifique id
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

  @Column({ type: 'boolean', default: true })
  estado: boolean;

  @Column({ type: 'boolean', default: true })
  es_repetitiva: boolean;
  // Relación: Actividad "pertenece a" Formulario
  @ManyToOne(() => Informe, (informe) => informe.actividades, {
    onDelete: 'CASCADE',
  })
  informe: Informe;
}
