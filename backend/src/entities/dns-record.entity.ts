import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Domain } from './domain.entity';

export enum DnsRecordType {
  A = 'A',
  AAAA = 'AAAA',
  CNAME = 'CNAME',
  MX = 'MX',
  TXT = 'TXT',
  NS = 'NS',
  SRV = 'SRV',
}

@Entity('dns_records')
export class DnsRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: DnsRecordType,
  })
  type: DnsRecordType;

  @Column()
  name: string;

  @Column()
  value: string;

  @Column({ default: 3600 })
  ttl: number;

  @Column({ nullable: true })
  priority: number;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => Domain, (domain) => domain.dnsRecords, {
    onDelete: 'CASCADE',
  })
  domain: Domain;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
