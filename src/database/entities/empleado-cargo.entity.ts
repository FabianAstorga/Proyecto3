import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Cargo } from './cargo.entity';
import { Usuario } from './usuario.entity';

@Entity('employee-charge')
export class EmpleadoCargo {
  @PrimaryGeneratedColumn()
  id: number; // Clave primaria simple para la relación

  @Column()
  fecha_inicio: Date;

  @Column({ nullable: true })
  fecha_fin: Date;

  // --- Relaciones ---
  @ManyToOne(() => Usuario, (usuario) => usuario.asignaciones)
  @JoinColumn({ name: 'usuarioId' })
  usuario: Usuario;

  @ManyToOne(() => Cargo, (cargo) => cargo.asignaciones)
  @JoinColumn({ name: 'cargoId' })
  cargo: Cargo;
}
