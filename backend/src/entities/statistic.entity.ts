import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { App } from './app.entity';

@Entity('statistics')
export class Statistic {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('float')
  cpuUsage: number;

  @Column('float')
  ramUsage: number;

  @Column('float')
  bandwidth: number;

  @CreateDateColumn()
  timestamp: Date;

  @ManyToOne(() => App, (app) => app.id)
  app: App;
}
