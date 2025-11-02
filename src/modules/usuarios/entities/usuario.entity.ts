import { 
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, 
  OneToMany, ManyToOne, JoinColumn, OneToOne 
} from 'typeorm';
import { Departamento } from '../../departamento/entities/departamento.entity';
import { Formulario } from '../../formularios/entities/formulario.entity';
import { Oficina } from '../../oficinas/entities/oficina.entity';
import { EmpleadoCargo } from '../../empleado-cargos/entities/empleado-cargo.entity';

@Entity({ name: 'usuarios' })
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  rut: string;

  @Column()
  nombre: string;

  @Column()
  apellidos: string;

  @Column({ unique: true })
  correo: string;

  @Column({ select: false }) 
  contrasena: string;

  @Column({ default: true })
  estado: boolean;

  @Column({ nullable: true })
  telefono: string;

  @Column({ nullable: true })
  anexo: string;

  @Column({ nullable: true })
  foto_url: string;

  @Column({ nullable: true })
  url_horario: string;

  @CreateDateColumn()
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
