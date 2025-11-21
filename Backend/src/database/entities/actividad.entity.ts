/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Informe } from './informe.entity';
import { Usuario } from './usuario.entity';

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

  // Para el checklist
  @Column({ type: 'boolean', default: false })
  estado: boolean;

  @Column({ type: 'boolean', default: false})
  esRepetitiva: boolean;

  @ManyToOne(() => Usuario, (usuario) => usuario.actividades, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'usuario_id' }) // crea la columna usuario_id en la tabla
  usuario: Usuario;
  // Relación: Actividad "pertenece a" Formulario
  @ManyToOne(() => Informe, (informe) => informe.actividades, {
    onDelete: 'CASCADE',
  })
  informe: Informe;
}
