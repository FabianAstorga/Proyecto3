import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export type TipoFeriado = 'nacional' | 'regional' | 'institucional';

@Entity('feriados')
@Index(['fecha', 'regionCodigo'], { unique: true })
export class Feriado {
  @PrimaryGeneratedColumn()
  id: number;

  /** Fecha del feriado (YYYY-MM-DD) */
  @Column({ type: 'date' })
  fecha: string;

  /** Nombre descriptivo */
  @Column({ type: 'varchar', length: 120, nullable: true })
nombre: string | null;

  /** Tipo de feriado */
  @Column({
    type: 'enum',
    enum: ['nacional', 'regional', 'institucional'],
    default: 'nacional',
  })
  tipo: TipoFeriado;

  /** Código región (ej: RM, XV). Null si es nacional */
  @Column({ type: 'varchar', length: 10, nullable: true })
regionCodigo: string | null;

  /** Permite desactivar sin borrar */
  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
