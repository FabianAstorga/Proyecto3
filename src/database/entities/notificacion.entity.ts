import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Usuario } from './usuario.entity';

@Entity('notificacion')
export class Notificacion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  tipo: string;

  @Column({ type: 'text' })
  mensaje: string;

  @Column({ default: false })
  leido: boolean;

  @CreateDateColumn()
  fechaEnvio: Date;

  @ManyToOne(() => Usuario, (usuario) => usuario.notificaciones, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;
}
