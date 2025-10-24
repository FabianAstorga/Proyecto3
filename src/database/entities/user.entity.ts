
import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column } from 'typeorm';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn({ type: 'int' })
  user_id!: number;

  @Column({ type: 'varchar', length: 100 })
  email!: string;

  @Column({ type: 'varchar', length: 50 })
  firstName!: string;

  @Column({ type: 'varchar', length: 50 })
  lastName!: string;

  @Column({ type: 'varchar', length: 255, select: false })
  password!: string;

  @Column({
    type: 'enum',
    enum: ['client', 'courier', 'admin'],
    default: 'client',
  })
  role!: string;

  @Column({ type: 'varchar', length: 20 })
  phone!: string;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

}