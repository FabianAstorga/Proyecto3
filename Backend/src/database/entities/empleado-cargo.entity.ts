import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm";
import { Usuario } from "./usuario.entity";
import { Cargo } from "./cargo.entity";

@Entity("empleado_cargo")
export class EmpleadoCargo {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Usuario, (usuario) => usuario.cargos, { eager: true })
  @JoinColumn({ name: "id_usuario" })
  usuario: Usuario;

  @ManyToOne(() => Cargo, (cargo) => cargo.empleados, { eager: true })
  @JoinColumn({ name: "id_cargo" })
  cargo: Cargo;

  // Aquí puedes agregar campos adicionales si quieres, por ejemplo:
  // fecha_inicio, fecha_fin, activo, etc.
}
