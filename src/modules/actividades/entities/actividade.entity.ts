import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Formulario } from '../../formularios/entities/formulario.entity';

@Entity({ name: 'actividades' })
export class Actividad {
  @PrimaryGeneratedColumn()
  id: number;
  
  @Column({ type: 'text' })
  descripcion: string;

  @Column()
  fecha: Date;

  @Column()
  tipo_actividad: string;

  // Relación: Actividad "pertenece a" Formulario
  @ManyToOne(() => Formulario, (formulario) => formulario.actividades)
  @JoinColumn({ name: 'formulario_id' })
  formulario: Formulario;
}