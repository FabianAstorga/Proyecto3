import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { EmpleadoCargo } from '../../database/entities/empleado-cargo.entity';

@Entity('charge')
export class Cargo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  rol: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  // Relación: Un cargo puede estar en muchas asignaciones (empleado-cargos)
  @OneToMany(() => EmpleadoCargo, (prog) => prog.cargo)
  asignaciones: EmpleadoCargo[];
}
