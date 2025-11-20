// src/roles/entities/role.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn } from 'typeorm';
import { EmpleadoCargo } from './empleado-cargo.entity';

@Entity('cargo')
export class Cargo {
  @PrimaryGeneratedColumn()
  id_cargo: number;

  @Column({ unique: true })
  ocupacion: string; // Ejemplo: 'Profesor', 'Jefe de Dpto.', 'Secretario'

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ type: 'boolean', default: true })
  esActivo: boolean;

  @OneToMany(() => EmpleadoCargo, (ec) => ec.cargo)
  empleados: EmpleadoCargo[];
}
