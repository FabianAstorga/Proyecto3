// Asumiendo que la entidad Usuario existe y se importa
import { Usuario } from './usuario.entity'; 
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('horario')
export class Horario {

  @PrimaryGeneratedColumn()
  id_agenda: number;

  @Column({ type: 'varchar', length: 255 })
  bloque: string;

  // Si solo necesitamos la fecha
  @Column({ type: 'date' })
  fecha: Date;

  // Asumiendo que necesitas la fecha y hora
  @Column({ type: 'timestamp' })
  horaInicio: Date; 

  @Column({ type: 'timestamp' })
  horaFin: Date;

  @Column({ type: 'boolean', default: true })
  esDisponible: boolean;

  // CLAVE FORÁNEA FALTANTE: Relación con el Usuario
  @ManyToOne(() => Usuario, usuario => usuario.horarios) // Define la relación
  @JoinColumn({ name: 'usuario_id' }) // Columna de la clave foránea en la tabla 'agenda'
  usuario: Usuario;
}