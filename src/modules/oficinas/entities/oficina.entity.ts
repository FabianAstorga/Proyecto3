import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Entity({ name: 'oficinas' })
export class Oficina {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ nullable: true })
  url_mapa: string;

  @Column({ unique: true })
  codigo: string;

  @Column()
  ubicacion: string;

  // Relación inversa: Una oficina es ocupada por un usuario
  @OneToOne(() => Usuario, (usuario) => usuario.oficina)
  usuario: Usuario;
}