import { Usuario } from './usuario.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('horario')
export class Horario {
  @PrimaryGeneratedColumn()
  id_agenda: number;

  @Column({ type: 'varchar', length: 255 })
  bloque: string;

  @Column({ type: 'date' })
  fecha: Date;

  @Column({ type: 'datetime' })
  horaInicio: Date;

  @Column({ type: 'datetime', nullable: true })
  horaFin: Date | null;

  @Column({ type: 'boolean', default: true })
  esDisponible: boolean;

  // 🔹 NUEVOS CAMPOS
  @Column({ type: 'varchar', length: 255, nullable: true })
  titulo: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  sala: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  descripcion: string | null;

  @ManyToOne(() => Usuario, (usuario) => usuario.horarios)
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;
}
