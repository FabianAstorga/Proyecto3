import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Informe } from './informe.entity'; 

@Entity('actividad') 
export class Actividad {
  @PrimaryGeneratedColumn()
  id_actividad: number;  

  @Column({ type: 'varchar', length: 50 })
  titulo: string; 

  @Column({ type: 'varchar', length: 255 })
  descripcion: string; 

  @Column({ type: 'date' })
  fecha: Date; 

  @Column({ type: 'varchar', length: 100 })
  tipo: string; 

  @Column({ type: 'tinyint', default: 1 })
  estado: boolean;

  @Column({ type: 'tinyint', default: 1 })
  es_repetitiva: boolean; 

 

  @ManyToOne(() => Informe, (informe) => informe.actividades)

  @JoinColumn({ name: 'informeIdInforme' }) 
  informe: Informe;
  
}