import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Sala } from './sala.entity';
import { Usuario } from './usuario.entity';

@Entity('department')
export class Departamento {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  facultad: string;

  @Column({ default: true })
  esActivo: boolean;

  @Column({ type: 'varchar', length: 10 })
  carrera: string;

  // Relación: Departamento "tiene" Usuarios
  @OneToMany(() => Usuario, (usuario) => usuario.departamento)
  usuarios: Usuario[];

  // Relación: Departamento "tiene" Salas
  @OneToMany(() => Sala, (sala) => sala.departamento)
  salas: Sala[];
}
