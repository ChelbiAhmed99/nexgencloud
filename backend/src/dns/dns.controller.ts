import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Req,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { DnsService } from './dns.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DnsRecordType } from '../entities/dns-record.entity';

@ApiTags('dns')
@Controller('dns')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DnsController {
  constructor(private readonly dnsService: DnsService) {}

  // ========================
  // DOMAIN ENDPOINTS
  // ========================

  @Post('domains')
  @ApiOperation({ summary: 'Add a new domain' })
  @ApiResponse({ status: 201, description: 'Domain added successfully.' })
  @ApiResponse({ status: 400, description: 'Domain already exists.' })
  async addDomain(@Req() req, @Body() body: { url: string }) {
    return this.dnsService.addDomain(req.user.id, body.url);
  }

  @Get('domains')
  @ApiOperation({ summary: 'Get all domains for the authenticated user' })
  @ApiResponse({ status: 200, description: 'List of domains.' })
  async getUserDomains(@Req() req) {
    return this.dnsService.getUserDomains(req.user.id);
  }

  @Post('domains/:id/verify')
  @HttpCode(200)
  @ApiOperation({ summary: 'Verify domain ownership via DNS TXT record' })
  @ApiResponse({ status: 200, description: 'Domain verified.' })
  async verifyDomain(@Req() req, @Param('id') id: string) {
    return this.dnsService.verifyDomain(Number(id), req.user.id);
  }

  @Delete('domains/:id')
  @ApiOperation({ summary: 'Delete a domain and all its records' })
  @ApiResponse({ status: 200, description: 'Domain deleted.' })
  async deleteDomain(@Req() req, @Param('id') id: string) {
    return this.dnsService.deleteDomain(Number(id), req.user.id);
  }

  // ========================
  // DNS RECORD ENDPOINTS
  // ========================

  @Get('domains/:id/records')
  @ApiOperation({ summary: 'Get all DNS records for a domain' })
  @ApiResponse({ status: 200, description: 'List of DNS records.' })
  async getDnsRecords(@Req() req, @Param('id') id: string) {
    return this.dnsService.getDnsRecords(Number(id), req.user.id);
  }

  @Post('domains/:id/records')
  @ApiOperation({ summary: 'Add a DNS record to a domain' })
  @ApiResponse({ status: 201, description: 'DNS record created.' })
  @ApiResponse({ status: 400, description: 'Invalid record data.' })
  async addDnsRecord(
    @Req() req,
    @Param('id') id: string,
    @Body()
    body: {
      type: DnsRecordType;
      name: string;
      value: string;
      ttl?: number;
      priority?: number;
    },
  ) {
    return this.dnsService.addDnsRecord(Number(id), req.user.id, body);
  }

  @Put('records/:id')
  @ApiOperation({ summary: 'Update a DNS record' })
  @ApiResponse({ status: 200, description: 'DNS record updated.' })
  async updateDnsRecord(
    @Req() req,
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      value?: string;
      ttl?: number;
      priority?: number;
    },
  ) {
    return this.dnsService.updateDnsRecord(Number(id), req.user.id, body);
  }

  @Delete('records/:id')
  @ApiOperation({ summary: 'Delete a DNS record' })
  @ApiResponse({ status: 200, description: 'DNS record deleted.' })
  async deleteDnsRecord(@Req() req, @Param('id') id: string) {
    return this.dnsService.deleteDnsRecord(Number(id), req.user.id);
  }

  @Patch('records/:id/toggle')
  @ApiOperation({ summary: 'Toggle a DNS record active/inactive' })
  @ApiResponse({ status: 200, description: 'DNS record toggled.' })
  async toggleDnsRecord(@Req() req, @Param('id') id: string) {
    return this.dnsService.toggleDnsRecord(Number(id), req.user.id);
  }

  // ========================
  // ADVANCED FEATURES
  // ========================

  @Get('domains/:id/export')
  @ApiOperation({ summary: 'Export domain zone file in BIND format' })
  @ApiResponse({ status: 200, description: 'Zone file content returned as text.' })
  async exportZone(@Req() req, @Param('id') id: string) {
    const zone = await this.dnsService.exportZone(Number(id), req.user.id);
    return { zone };
  }

  @Post('domains/:id/records/bulk')
  @ApiOperation({ summary: 'Bulk import DNS records' })
  @ApiResponse({ status: 201, description: 'Bulk import results.' })
  @ApiResponse({ status: 400, description: 'Invalid records data.' })
  async bulkImportRecords(
    @Req() req,
    @Param('id') id: string,
    @Body() body: { records: { type: string; name: string; value: string; ttl?: number; priority?: number }[] },
  ) {
    return this.dnsService.bulkImportRecords(Number(id), req.user.id, body.records as any);
  }

  @Get('domains/:id/propagation')
  @ApiOperation({ summary: 'Check DNS propagation status across global nameservers' })
  @ApiResponse({ status: 200, description: 'Propagation status for each nameserver.' })
  async checkPropagation(@Req() req, @Param('id') id: string) {
    return this.dnsService.checkPropagation(Number(id), req.user.id);
  }

  @Get('domains/:id/stats')
  @ApiOperation({ summary: 'Get domain statistics and record breakdown' })
  @ApiResponse({ status: 200, description: 'Domain statistics.' })
  async getDomainStats(@Req() req, @Param('id') id: string) {
    return this.dnsService.getDomainStats(Number(id), req.user.id);
  }
}
