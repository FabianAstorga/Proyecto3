/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Informe } from "./informe.entity";
import { Usuario } from "./usuario.entity";
import { TipoActividad } from "./tipo-actividad.entity";

@Entity("actividad")
export class Actividad {
  @PrimaryGeneratedColumn()
  id_actividad: number;

  // ❌ QUITADO: titulo

  @Column({ type: "varchar", length: 255 })
  descripcion: string;

  @Column({ type: "date" })
  fecha: Date;

  // ❌ QUITADO: tipo (string legacy)

  /** Normalizado: FK hacia tipo_actividad */
  @ManyToOne(() => TipoActividad, { eager: true, nullable: false })
  @JoinColumn({ name: "tipo_actividad_id" })
  tipoActividad: TipoActividad;

  /** Texto libre si el tipo lo requiere (por ejemplo: "Otro") */
  @Column({ type: "varchar", length: 150, nullable: true })
  tipoActividadDetalle?: string;

  @Column({
    type: "enum",
    enum: ["Pendiente", "En Progreso", "Realizada", "Cancelada"],
    default: "Pendiente",
  })
  estado: string;

  @Column({ type: "boolean", default: false })
  esRepetitiva: boolean;

  @ManyToOne(() => Usuario, (usuario) => usuario.actividades, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "usuario_id" })
  usuario: Usuario;

  @ManyToOne(() => Informe, (informe) => informe.actividades, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "informeIdInforme" })
  informe: Informe;
}
