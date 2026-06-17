import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  OneToMany,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { App } from './app.entity';
import { User } from './user.entity';
import { DnsRecord } from './dns-record.entity';

export enum VerificationStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  FAILED = 'FAILED',
}

@Entity('domains')
export class Domain {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  url: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({
    type: 'enum',
    enum: VerificationStatus,
    default: VerificationStatus.PENDING,
  })
  verificationStatus: VerificationStatus;

  @Column({ nullable: true })
  verificationToken: string;

  @OneToOne(() => App, { nullable: true })
  @JoinColumn()
  app: App;

  @ManyToOne(() => User, { eager: true, nullable: true })
  owner: User;

  @OneToMany(() => DnsRecord, (record) => record.domain, {
    cascade: true,
  })
  dnsRecords: DnsRecord[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
