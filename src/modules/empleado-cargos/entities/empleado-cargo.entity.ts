import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { Cargo } from '../../cargos/entities/cargo.entity';

@Entity({ name: 'empleado_cargo' })
export class EmpleadoCargo {
  @PrimaryGeneratedColumn()
  id: number; // Clave primaria simple para la relación

  @Column()
  fecha_inicio: Date;

  @Column({ nullable: true })
  fecha_fin: Date;

  // --- Claves foráneas ---
  @Column()
  usuarioId: number;

  @Column()
  cargoId: number;

  // --- Relaciones ---
  @ManyToOne(() => Usuario, (usuario) => usuario.asignaciones)
  @JoinColumn({ name: 'usuarioId' })
  usuario: Usuario;

  @ManyToOne(() => Cargo, (cargo) => cargo.asignaciones)
  @JoinColumn({ name: 'cargoId' })
  cargo: Cargo;
}
