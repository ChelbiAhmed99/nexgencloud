import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('infrastructure')
export class Infrastructure {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  serverId: string;

  @Column({
    type: 'enum',
    enum: ['HEALTHY', 'DEGRADED', 'OFFLINE'],
    default: 'HEALTHY',
  })
  healthState: string;

  @Column({ type: 'float', default: 0.0 })
  globalLoad: number;

  @UpdateDateColumn()
  updatedAt: Date;
}
