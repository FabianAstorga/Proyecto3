import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Usuario } from './usuario.entity';
import { Actividad } from './actividade.entity';

@Entity('form')
export class Formulario {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  fec_creacion: Date;

  @Column({ nullable: true })
  fec_envio: Date;

  @Column()
  estado: string; // (ej: 'borrador', 'enviado', 'aprobado')

  // Relación: Formulario "registrado por" Usuario
  @ManyToOne(() => Usuario, (usuario) => usuario.formularios)
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  // Relación: Formulario "tiene" Actividades
  @OneToMany(() => Actividad, (actividad) => actividad.formulario)
  actividades: Actividad[];
}
