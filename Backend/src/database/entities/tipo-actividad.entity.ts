import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('tipos_actividad')
@Index(['nombre'], { unique: true })
export class TipoActividad {
  @PrimaryGeneratedColumn()
  id: number;

  /** Nombre visible: Taller, Seminario, etc */
  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  /** Orden de aparición en el frontend */
  @Column({ type: 'int', default: 0 })
  orden: number;

  /** Permite ocultar sin borrar */
  @Column({ type: 'boolean', default: true })
  activo: boolean;

  /** Indica si requiere texto libre (equivale a "Otro") */
  @Column({ type: 'boolean', default: false })
  requiereDetalle: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
