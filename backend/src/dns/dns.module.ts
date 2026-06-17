import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DnsService } from './dns.service';
import { DnsController } from './dns.controller';
import { Domain } from '../entities/domain.entity';
import { DnsRecord } from '../entities/dns-record.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Domain, DnsRecord])],
  providers: [DnsService],
  controllers: [DnsController],
  exports: [DnsService],
})
export class DnsModule {}
