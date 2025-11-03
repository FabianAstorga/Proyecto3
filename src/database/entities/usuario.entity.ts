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
import { Departamento } from './departamento.entity';
import { Formulario } from './formulario.entity';
import { Oficina } from './oficina.entity';
import { EmpleadoCargo } from './empleado-cargo.entity';

@Entity('user')
export class Usuario {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ type: 'varchar', length: 50 })
  nombre: string;

  @Column({ type: 'varchar', length: 50 })
  apellido: string;

  @Column({ type: 'varchar', length: 100 })
  correo: string;

  @Column({ type: 'varchar', length: 8, select: false })
  contrasena: string;

  @Column({ type: 'boolean', default: true })
  estado: boolean;

  @Column({ type: 'varchar', length: 20 })
  telefono: string;

  @Column({ type: 'varchar', length: 10 })
  anexo: string;

  @Column({ nullable: true })
  foto_url: string;

  @Column({ nullable: true })
  url_horario: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha_creacion: Date;

  // Relación: Usuario "jefe" (boss)
  @ManyToOne(() => Usuario, (usuario) => usuario.empleados)
  @JoinColumn({ name: 'jefe_id' }) // Columna de clave foránea
  jefe: Usuario;

  // Relación: Usuario "empleados" (employ)
  @OneToMany(() => Usuario, (usuario) => usuario.jefe)
  empleados: Usuario[];

  // Relación: Usuario "pertenece" a Departamento
  @ManyToOne(() => Departamento, (departamento) => departamento.usuarios)
  @JoinColumn({ name: 'departamento_id' })
  departamento: Departamento;

  // Relación: Usuario "registra" Formularios
  @OneToMany(() => Formulario, (formulario) => formulario.usuario)
  formularios: Formulario[];

  // Relación: Usuario "tiene" Oficina
  @OneToOne(() => Oficina)
  @JoinColumn({ name: 'oficina_id' })
  oficina: Oficina;

  // Relación: Un usuario puede tener muchas asignaciones de cargo
  @OneToMany(() => EmpleadoCargo, (prog) => prog.usuario)
  asignaciones: EmpleadoCargo[];
}
