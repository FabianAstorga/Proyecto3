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

  @Column({ type: "varchar", length: 50 })
  titulo: string;

  @Column({ type: "varchar", length: 255 })
  descripcion: string;

  @Column({ type: "date" })
  fecha: Date;

  /**
   * LEGACY: mantener por compatibilidad con el código actual.
   * Luego puedes eliminar este campo cuando el front/back use tipoActividad.
   */
  @Column({ type: "varchar", length: 100 })
  tipo: string;

  /**
   * Normalizado: FK hacia tipos_actividad
   * eager:true trae el tipo junto con la actividad (útil para listar sin joins manuales).
   */
  @ManyToOne(() => TipoActividad, { eager: true, nullable: true })
  @JoinColumn({ name: "tipo_actividad_id" })
  tipoActividad?: TipoActividad;

  /** Texto libre si el tipo lo requiere (por ejemplo: "Otro") */
  @Column({ type: "varchar", length: 150, nullable: true })
  tipoActividadDetalle?: string;

  // Para el checklist
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
  informe: Informe;
}
