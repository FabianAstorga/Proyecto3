import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Usuario } from './usuario.entity';
import { Actividad } from './actividad.entity';

@Entity('informe')
export class Informe {
  @PrimaryGeneratedColumn()
  id_informe: number;

  @Column({ length: 20 })
  periodo: string;

  @Column({ type: 'date', nullable: true })
  fechaEnvio: Date;

  @Column({ type: 'date', nullable: true })
  fechaRevision: Date;

  @Column({ 
    type: 'enum',
    enum: ['pendiente', 'enviado', 'revisado', 'aprobado', 'rechazado'],
    default: 'pendiente'
  })
  estado: string;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  // olumna explícita para la clave foránea
  @Column({ type: 'int' })
  usuario_id: number;

  @ManyToOne(() => Usuario, (usuario) => usuario.informes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @OneToMany(() => Actividad, (actividad) => actividad.informe)
  actividades: Actividad[];
}