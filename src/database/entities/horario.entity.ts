import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Usuario } from './usuario.entity';

@Entity('horario')
export class Horario {
  @PrimaryGeneratedColumn()
  id_horario: number;

  @Column({ type: 'date' })
  fecha: Date;

  @Column({ type: 'time' })
  horaInicio: string;

  @Column({ type: 'time' })
  horaFin: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ default: 'activo' })
  estado: string;

  @CreateDateColumn()
  fecha_asignacion: Date;

  @ManyToOne(() => Usuario, (usuario) => usuario.horarios, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'asignado_por' })
  asignado_por: Usuario;
}
