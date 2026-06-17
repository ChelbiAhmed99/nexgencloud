import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Domain, VerificationStatus } from '../entities/domain.entity';
import { DnsRecord, DnsRecordType } from '../entities/dns-record.entity';
import * as crypto from 'crypto';

@Injectable()
export class DnsService {
  private readonly logger = new Logger(DnsService.name);

  constructor(
    @InjectRepository(Domain)
    private readonly domainRepository: Repository<Domain>,
    @InjectRepository(DnsRecord)
    private readonly dnsRecordRepository: Repository<DnsRecord>,
  ) {}

  // ========================
  // DOMAIN MANAGEMENT
  // ========================

  async addDomain(userId: number, url: string): Promise<Domain> {
    // Normalize URL
    const normalizedUrl = url.toLowerCase().replace(/^(https?:\/\/)/, '').replace(/\/$/, '');

    // Check if domain already exists
    const existing = await this.domainRepository.findOne({
      where: { url: normalizedUrl },
    });
    if (existing) {
      throw new BadRequestException('Ce domaine est déjà enregistré sur la plateforme.');
    }

    // Generate verification token
    const verificationToken = `nexgen-verify-${crypto.randomBytes(16).toString('hex')}`;

    const domain = this.domainRepository.create({
      url: normalizedUrl,
      verificationToken,
      verificationStatus: VerificationStatus.PENDING,
      owner: { id: userId } as any,
    });

    const saved = await this.domainRepository.save(domain);
    this.logger.log(`[DNS] Domain "${normalizedUrl}" added by user ${userId} — token: ${verificationToken}`);

    // Auto-create default DNS records (SOA-like simulation)
    await this.createDefaultRecords(saved);

    return this.domainRepository.findOne({
      where: { id: saved.id },
      relations: ['owner', 'dnsRecords'],
    });
  }

  private async createDefaultRecords(domain: Domain): Promise<void> {
    const defaults: Partial<DnsRecord>[] = [
      {
        type: DnsRecordType.A,
        name: '@',
        value: '185.199.108.153',
        ttl: 3600,
        domain,
      },
      {
        type: DnsRecordType.NS,
        name: '@',
        value: 'ns1.nexgencloud.com',
        ttl: 86400,
        domain,
      },
      {
        type: DnsRecordType.NS,
        name: '@',
        value: 'ns2.nexgencloud.com',
        ttl: 86400,
        domain,
      },
      {
        type: DnsRecordType.TXT,
        name: '@',
        value: domain.verificationToken,
        ttl: 300,
        domain,
      },
    ];

    for (const record of defaults) {
      await this.dnsRecordRepository.save(this.dnsRecordRepository.create(record));
    }
    this.logger.log(`[DNS] Default records created for domain ${domain.url}`);
  }

  async getUserDomains(userId: number): Promise<Domain[]> {
    return this.domainRepository.find({
      where: { owner: { id: userId } },
      relations: ['dnsRecords'],
      order: { createdAt: 'DESC' },
    });
  }

  async verifyDomain(domainId: number, userId: number): Promise<Domain> {
    const domain = await this.domainRepository.findOne({
      where: { id: domainId, owner: { id: userId } },
    });
    if (!domain) {
      throw new NotFoundException('Domaine introuvable.');
    }

    // Simulated verification (in production, would query DNS TXT records)
    this.logger.log(`[DNS] Simulating TXT record verification for ${domain.url}...`);

    // Simulate a delay and always verify successfully for PFE
    domain.verificationStatus = VerificationStatus.VERIFIED;
    const saved = await this.domainRepository.save(domain);
    this.logger.log(`[DNS] Domain "${domain.url}" verified successfully (simulated).`);

    return saved;
  }

  async deleteDomain(domainId: number, userId: number): Promise<void> {
    const domain = await this.domainRepository.findOne({
      where: { id: domainId, owner: { id: userId } },
    });
    if (!domain) {
      throw new NotFoundException('Domaine introuvable.');
    }

    await this.domainRepository.remove(domain);
    this.logger.log(`[DNS] Domain "${domain.url}" deleted by user ${userId}.`);
  }

  // ========================
  // DNS RECORD MANAGEMENT
  // ========================

  async getDnsRecords(domainId: number, userId: number): Promise<DnsRecord[]> {
    const domain = await this.domainRepository.findOne({
      where: { id: domainId, owner: { id: userId } },
    });
    if (!domain) {
      throw new NotFoundException('Domaine introuvable ou non autorisé.');
    }

    return this.dnsRecordRepository.find({
      where: { domain: { id: domainId } },
      order: { type: 'ASC', name: 'ASC' },
    });
  }

  async addDnsRecord(
    domainId: number,
    userId: number,
    data: { type: DnsRecordType; name: string; value: string; ttl?: number; priority?: number },
  ): Promise<DnsRecord> {
    const domain = await this.domainRepository.findOne({
      where: { id: domainId, owner: { id: userId } },
    });
    if (!domain) {
      throw new NotFoundException('Domaine introuvable ou non autorisé.');
    }

    // Validate record data
    this.validateDnsRecord(data);

    const record = this.dnsRecordRepository.create({
      type: data.type,
      name: data.name || '@',
      value: data.value,
      ttl: data.ttl || 3600,
      priority: data.priority || null,
      domain,
    });

    const saved = await this.dnsRecordRepository.save(record);
    this.logger.log(`[DNS] Record ${data.type} "${data.name}" added to ${domain.url}`);
    return saved;
  }

  async updateDnsRecord(
    recordId: number,
    userId: number,
    data: { name?: string; value?: string; ttl?: number; priority?: number },
  ): Promise<DnsRecord> {
    const record = await this.dnsRecordRepository.findOne({
      where: { id: recordId },
      relations: ['domain', 'domain.owner'],
    });
    if (!record) {
      throw new NotFoundException('Enregistrement DNS introuvable.');
    }
    if (record.domain.owner.id !== userId) {
      throw new ForbiddenException('Accès non autorisé à cet enregistrement.');
    }

    if (data.name !== undefined) record.name = data.name;
    if (data.value !== undefined) record.value = data.value;
    if (data.ttl !== undefined) record.ttl = data.ttl;
    if (data.priority !== undefined) record.priority = data.priority;

    const saved = await this.dnsRecordRepository.save(record);
    this.logger.log(`[DNS] Record ${record.type} #${recordId} updated.`);
    return saved;
  }

  async deleteDnsRecord(recordId: number, userId: number): Promise<void> {
    const record = await this.dnsRecordRepository.findOne({
      where: { id: recordId },
      relations: ['domain', 'domain.owner'],
    });
    if (!record) {
      throw new NotFoundException('Enregistrement DNS introuvable.');
    }
    if (record.domain.owner.id !== userId) {
      throw new ForbiddenException('Accès non autorisé à cet enregistrement.');
    }

    await this.dnsRecordRepository.remove(record);
    this.logger.log(`[DNS] Record ${record.type} #${recordId} deleted.`);
  }

  async toggleDnsRecord(recordId: number, userId: number): Promise<DnsRecord> {
    const record = await this.dnsRecordRepository.findOne({
      where: { id: recordId },
      relations: ['domain', 'domain.owner'],
    });
    if (!record) {
      throw new NotFoundException('Enregistrement DNS introuvable.');
    }
    if (record.domain.owner.id !== userId) {
      throw new ForbiddenException('Accès non autorisé à cet enregistrement.');
    }

    record.isActive = !record.isActive;
    const saved = await this.dnsRecordRepository.save(record);
    this.logger.log(`[DNS] Record #${recordId} toggled to ${record.isActive ? 'ACTIVE' : 'INACTIVE'}.`);
    return saved;
  }

  // ========================
  // ZONE EXPORT (BIND FORMAT)
  // ========================

  async exportZone(domainId: number, userId: number): Promise<string> {
    const domain = await this.domainRepository.findOne({
      where: { id: domainId, owner: { id: userId } },
    });
    if (!domain) {
      throw new NotFoundException('Domaine introuvable ou non autorisé.');
    }

    const records = await this.dnsRecordRepository.find({
      where: { domain: { id: domainId }, isActive: true },
      order: { type: 'ASC', name: 'ASC' },
    });

    const now = new Date();
    const serial = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}01`;

    let zone = '';
    zone += `; ============================================\n`;
    zone += `; Zone file for ${domain.url}\n`;
    zone += `; Exported by NexGenCloud on ${now.toISOString()}\n`;
    zone += `; ============================================\n\n`;
    zone += `$ORIGIN ${domain.url}.\n`;
    zone += `$TTL 3600\n\n`;
    zone += `; SOA Record\n`;
    zone += `@  IN  SOA  ns1.nexgencloud.com. admin.${domain.url}. (\n`;
    zone += `         ${serial}  ; Serial\n`;
    zone += `         7200       ; Refresh (2h)\n`;
    zone += `         3600       ; Retry (1h)\n`;
    zone += `         1209600    ; Expire (2w)\n`;
    zone += `         86400      ; Minimum TTL (1d)\n`;
    zone += `)\n\n`;

    for (const r of records) {
      const name = r.name === '@' ? domain.url + '.' : r.name;
      if (r.type === DnsRecordType.MX || r.type === DnsRecordType.SRV) {
        zone += `${name.padEnd(30)} ${r.ttl}\tIN\t${r.type}\t${r.priority || 10}\t${r.value}\n`;
      } else {
        zone += `${name.padEnd(30)} ${r.ttl}\tIN\t${r.type}\t${r.value}\n`;
      }
    }

    this.logger.log(`[DNS] Zone file exported for ${domain.url}`);
    return zone;
  }

  // ========================
  // BULK IMPORT
  // ========================

  async bulkImportRecords(
    domainId: number,
    userId: number,
    records: { type: DnsRecordType; name: string; value: string; ttl?: number; priority?: number }[],
  ): Promise<{ imported: number; errors: string[] }> {
    const domain = await this.domainRepository.findOne({
      where: { id: domainId, owner: { id: userId } },
    });
    if (!domain) {
      throw new NotFoundException('Domaine introuvable ou non autorisé.');
    }

    if (!records || records.length === 0) {
      throw new BadRequestException('Aucun enregistrement fourni.');
    }

    if (records.length > 50) {
      throw new BadRequestException('Maximum 50 enregistrements par import.');
    }

    let imported = 0;
    const errors: string[] = [];

    for (let i = 0; i < records.length; i++) {
      const data = records[i];
      try {
        this.validateDnsRecord(data);
        const record = this.dnsRecordRepository.create({
          type: data.type,
          name: data.name || '@',
          value: data.value,
          ttl: data.ttl || 3600,
          priority: data.priority || null,
          domain,
        });
        await this.dnsRecordRepository.save(record);
        imported++;
      } catch (error) {
        errors.push(`Ligne ${i + 1}: ${error.message || 'Erreur inconnue'}`);
      }
    }

    this.logger.log(`[DNS] Bulk import for ${domain.url}: ${imported} imported, ${errors.length} errors`);
    return { imported, errors };
  }

  // ========================
  // PROPAGATION SIMULATION
  // ========================

  async checkPropagation(domainId: number, userId: number): Promise<{
    domain: string;
    checkedAt: string;
    servers: { name: string; location: string; status: string; responseTime: number; resolvedValue: string }[];
  }> {
    const domain = await this.domainRepository.findOne({
      where: { id: domainId, owner: { id: userId } },
    });
    if (!domain) {
      throw new NotFoundException('Domaine introuvable ou non autorisé.');
    }

    const aRecord = await this.dnsRecordRepository.findOne({
      where: { domain: { id: domainId }, type: DnsRecordType.A, isActive: true },
    });

    const resolvedValue = aRecord?.value || '185.199.108.153';

    // Simulate DNS propagation across global nameservers
    const nameservers = [
      { name: 'ns1.google.com', location: 'Mountain View, US' },
      { name: 'ns1.cloudflare.com', location: 'San Francisco, US' },
      { name: 'ns1.ovh.net', location: 'Paris, FR' },
      { name: 'dns1.registrar-servers.com', location: 'Frankfurt, DE' },
      { name: 'a.nic.fr', location: 'Paris, FR' },
      { name: 'ns1.digitalocean.com', location: 'New York, US' },
      { name: 'dns.quad9.net', location: 'Zurich, CH' },
      { name: 'resolver1.opendns.com', location: 'San Jose, US' },
    ];

    const isVerified = domain.verificationStatus === 'VERIFIED';

    const servers = nameservers.map((ns) => {
      const propagated = isVerified ? Math.random() > 0.15 : Math.random() > 0.6;
      return {
        name: ns.name,
        location: ns.location,
        status: propagated ? 'PROPAGATED' : 'PENDING',
        responseTime: Math.floor(Math.random() * 150) + 10,
        resolvedValue: propagated ? resolvedValue : '',
      };
    });

    this.logger.log(`[DNS] Propagation check for ${domain.url}: ${servers.filter(s => s.status === 'PROPAGATED').length}/${servers.length} propagated`);

    return {
      domain: domain.url,
      checkedAt: new Date().toISOString(),
      servers,
    };
  }

  // ========================
  // DOMAIN STATISTICS
  // ========================

  async getDomainStats(domainId: number, userId: number): Promise<{
    totalRecords: number;
    activeRecords: number;
    inactiveRecords: number;
    byType: { type: string; count: number }[];
    lastModified: string | null;
    verificationStatus: string;
  }> {
    const domain = await this.domainRepository.findOne({
      where: { id: domainId, owner: { id: userId } },
    });
    if (!domain) {
      throw new NotFoundException('Domaine introuvable ou non autorisé.');
    }

    const records = await this.dnsRecordRepository.find({
      where: { domain: { id: domainId } },
      order: { updatedAt: 'DESC' },
    });

    const activeRecords = records.filter((r) => r.isActive).length;
    const inactiveRecords = records.filter((r) => !r.isActive).length;

    // Count by type
    const typeCounts: Record<string, number> = {};
    for (const r of records) {
      typeCounts[r.type] = (typeCounts[r.type] || 0) + 1;
    }
    const byType = Object.entries(typeCounts).map(([type, count]) => ({ type, count }));

    const lastModified = records.length > 0 ? records[0].updatedAt.toISOString() : null;

    return {
      totalRecords: records.length,
      activeRecords,
      inactiveRecords,
      byType,
      lastModified,
      verificationStatus: domain.verificationStatus,
    };
  }

  // ========================
  // VALIDATION
  // ========================

  private validateDnsRecord(data: { type: DnsRecordType; name: string; value: string; priority?: number }): void {
    if (!data.type || !data.value) {
      throw new BadRequestException('Le type et la valeur sont requis.');
    }

    switch (data.type) {
      case DnsRecordType.A:
        if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(data.value)) {
          throw new BadRequestException('Adresse IPv4 invalide pour un enregistrement de type A.');
        }
        break;
      case DnsRecordType.AAAA:
        if (!/^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/.test(data.value) &&
            !/^(([0-9a-fA-F]{1,4}:)*)?::([0-9a-fA-F]{1,4}:)*[0-9a-fA-F]{1,4}$/.test(data.value)) {
          throw new BadRequestException('Adresse IPv6 invalide pour un enregistrement de type AAAA.');
        }
        break;
      case DnsRecordType.CNAME:
      case DnsRecordType.NS:
        if (!/^[a-zA-Z0-9]([a-zA-Z0-9-]*\.)*[a-zA-Z0-9]+\.[a-zA-Z]{2,}$/.test(data.value)) {
          throw new BadRequestException('Nom d\'hôte invalide (ex: host.example.com).');
        }
        break;
      case DnsRecordType.MX:
        if (data.priority === undefined || data.priority === null) {
          throw new BadRequestException('La priorité est requise pour un enregistrement MX.');
        }
        break;
      case DnsRecordType.TXT:
        if (data.value.length > 512) {
          throw new BadRequestException('La valeur TXT ne peut pas dépasser 512 caractères.');
        }
        break;
      case DnsRecordType.SRV:
        if (data.priority === undefined || data.priority === null) {
          throw new BadRequestException('La priorité est requise pour un enregistrement SRV.');
        }
        break;
    }
  }
}
