import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('quotas')
export class Quota {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 1024 }) // in MB
  storageLimit: number;

  @Column({ default: 5 })
  instanceLimit: number;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;
}
