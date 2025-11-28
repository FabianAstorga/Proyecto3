import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
} from "typeorm";
import { Usuario } from "./usuario.entity";
import { Cargo } from "./cargo.entity";

@Entity("empleado_cargo")
export class EmpleadoCargo {
  @PrimaryGeneratedColumn()
  id: number;

  // columnas FK explícitas (coinciden con la tabla)
  @Column({ name: "id_usuario" })
  id_usuario: number;

  @Column({ name: "id_cargo" })
  id_cargo: number;

  @ManyToOne(() => Usuario, (usuario) => usuario.cargos, { eager: true })
  @JoinColumn({ name: "id_usuario" })
  usuario: Usuario;

  @ManyToOne(() => Cargo, (cargo) => cargo.empleados, { eager: true })
  @JoinColumn({ name: "id_cargo" })
  cargo: Cargo;
}
