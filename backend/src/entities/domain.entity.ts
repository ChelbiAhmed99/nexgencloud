import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { App } from './app.entity';

@Entity('domains')
export class Domain {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  url: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToOne(() => App, { nullable: true })
  @JoinColumn()
  app: App;
}
