// src/roles/entities/role.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { EmpleadoCargo } from "./empleado-cargo.entity";

@Entity("cargo")
export class Cargo {
  @PrimaryGeneratedColumn()
  id_cargo: number;

  @Column({ unique: true })
  ocupacion: string;

  @Column({ type: "text" })
  descripcion: string;

  @OneToMany(() => EmpleadoCargo, (ec) => ec.cargo)
  empleados: EmpleadoCargo[];
}
