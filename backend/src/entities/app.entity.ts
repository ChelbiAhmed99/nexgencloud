import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';

export enum AppStatus {
  CREATING = 'creating',
  RUNNING = 'running',
  STOPPED = 'stopped',
  ERROR = 'error',
}

@Entity('apps')
export class App {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  dockerImage: string;

  @Column({ unique: true })
  containerName: string;

  @Column({
    type: 'enum',
    enum: AppStatus,
    default: AppStatus.CREATING,
  })
  status: AppStatus;

  @Column({ nullable: true })
  customDomain: string;

  @ManyToOne(() => User, (user) => user.id, { eager: true })
  owner: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
