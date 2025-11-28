// src/database/entities/evento-global.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('evento_global')
export class EventoGlobal {
  @PrimaryGeneratedColumn()
  id: number;

  // Fecha concreta del evento (ej: 2025-03-10)
  @Column({ type: 'date' })
  fecha: Date;

  // Código del bloque, ej: "(1 - 2)", "(3 - 4)"
  @Column({ type: 'varchar', length: 20 })
  blockCode: string;

  // Título visible del evento
  @Column({ type: 'varchar', length: 255 })
  titulo: string;

  // Descripción opcional (nota)
  @Column({ type: 'varchar', length: 255, nullable: true })
  descripcion: string | null;
}
