import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { EmpleadoCargo } from './empleado-cargo.entity';
import { Informe } from './informe.entity';
import { Horario } from './horario.entity';
import { Actividad } from './actividad.entity';


@Entity('usuario')
export class Usuario {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({
  type: 'enum',
  enum: ['funcionario', 'secretaria', 'administrador'],
  default: 'funcionario',
  })
  rol: string;

  @Column({ type: 'varchar', length: 50 })
  nombre: string;

  @Column({ type: 'varchar', length: 50 })
  apellido: string;

  @Column({ type: 'varchar', length: 100 })
  correo: string;

  @Column({ type: 'varchar', length: 255, select: false })
  contrasena: string;

  @Column({ type: 'boolean', default: true })
  estado: boolean;

  @Column({ type: 'varchar', length: 20 })
  telefono: string;

  @Column({ nullable: true })
  foto_url: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha_creacion: Date;

  // Relaciones
  @OneToMany(() => EmpleadoCargo, (ec) => ec.usuario)
  cargos: EmpleadoCargo[];

  @OneToMany(() => Informe, (i) => i.usuario)
  informes: Informe[];

  @OneToMany(() => Horario, horario => horario.usuario)
  horarios: Horario[];

  @OneToMany(() => Actividad, (actividad) => actividad.usuario)
  actividades: Actividad[];


}
