import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Departamento } from '../../departamento/entities/departamento.entity';

@Entity({ name: 'salas' })
export class Sala {
  @PrimaryGeneratedColumn()
  id: number;
  
  @Column({ unique: true })
  codigo: string;

  @Column()
  nombre: string;
  
  @Column()
  ubicacion: string;

  // Relación: Sala "pertenece" a Departamento
  @ManyToOne(() => Departamento, (departamento) => departamento.salas)
  @JoinColumn({ name: 'departamento_id' })
  departamento: Departamento;
}