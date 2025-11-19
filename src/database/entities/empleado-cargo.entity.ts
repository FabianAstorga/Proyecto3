import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Cargo } from './cargo.entity';
import { Usuario } from './usuario.entity';

@Entity('empleado_cargo')
export class EmpleadoCargo {
  @PrimaryGeneratedColumn()
  id: number; 

  @Column({ type: 'date' })
  fecha_inicio: Date;

  @Column({ type: 'date', nullable: true })
  fecha_fin: Date;

  // --- Relaciones ---
  @ManyToOne(() => Usuario, (usuario) => usuario.asignaciones, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @ManyToOne(() => Cargo, (cargo) => cargo.empleados, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cargo_id' })
  cargo: Cargo;
}
