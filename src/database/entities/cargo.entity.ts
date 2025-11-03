// src/roles/entities/role.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { EmpleadoCargo } from './empleado-cargo.entity';

@Entity('charge')
export class Cargo {
  @PrimaryGeneratedColumn()
  id_Cargo: number;

  @Column({ unique: true })
  rol: string; // Ejemplo: 'Profesor', 'Jefe de Dpto.', 'Secretario'

  @Column()
  especialidad: string;

  @OneToMany(() => EmpleadoCargo, (prog) => prog.cargo)
  asignaciones: EmpleadoCargo[];
}
