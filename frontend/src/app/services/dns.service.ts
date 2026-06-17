import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment';

export interface Domain {
  id: number;
  url: string;
  isActive: boolean;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'FAILED';
  verificationToken: string;
  dnsRecords: DnsRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface DnsRecord {
  id: number;
  type: 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT' | 'NS' | 'SRV';
  name: string;
  value: string;
  ttl: number;
  priority: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DomainStats {
  totalRecords: number;
  activeRecords: number;
  inactiveRecords: number;
  byType: { type: string; count: number }[];
  lastModified: string | null;
  verificationStatus: string;
}

export interface PropagationResult {
  domain: string;
  checkedAt: string;
  servers: PropagationServer[];
}

export interface PropagationServer {
  name: string;
  location: string;
  status: 'PROPAGATED' | 'PENDING';
  responseTime: number;
  resolvedValue: string;
}

export interface BulkImportResult {
  imported: number;
  errors: string[];
}

@Injectable({
  providedIn: 'root'
})
export class DnsService {
  private apiUrl = `${environment.apiUrl}/dns`;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  private getHeaders(): HttpHeaders {
    let token = '';
    if (isPlatformBrowser(this.platformId)) {
      token = localStorage.getItem('auth_token') || '';
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // ========================
  // DOMAINS
  // ========================

  getDomains(): Observable<Domain[]> {
    return this.http.get<Domain[]>(`${this.apiUrl}/domains`, { headers: this.getHeaders() });
  }

  addDomain(url: string): Observable<Domain> {
    return this.http.post<Domain>(`${this.apiUrl}/domains`, { url }, { headers: this.getHeaders() });
  }

  verifyDomain(id: number): Observable<Domain> {
    return this.http.post<Domain>(`${this.apiUrl}/domains/${id}/verify`, {}, { headers: this.getHeaders() });
  }

  deleteDomain(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/domains/${id}`, { headers: this.getHeaders() });
  }

  // ========================
  // DNS RECORDS
  // ========================

  getDnsRecords(domainId: number): Observable<DnsRecord[]> {
    return this.http.get<DnsRecord[]>(`${this.apiUrl}/domains/${domainId}/records`, { headers: this.getHeaders() });
  }

  addDnsRecord(domainId: number, data: Partial<DnsRecord>): Observable<DnsRecord> {
    return this.http.post<DnsRecord>(`${this.apiUrl}/domains/${domainId}/records`, data, { headers: this.getHeaders() });
  }

  updateDnsRecord(recordId: number, data: Partial<DnsRecord>): Observable<DnsRecord> {
    return this.http.put<DnsRecord>(`${this.apiUrl}/records/${recordId}`, data, { headers: this.getHeaders() });
  }

  deleteDnsRecord(recordId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/records/${recordId}`, { headers: this.getHeaders() });
  }

  toggleDnsRecord(recordId: number): Observable<DnsRecord> {
    return this.http.patch<DnsRecord>(`${this.apiUrl}/records/${recordId}/toggle`, {}, { headers: this.getHeaders() });
  }

  // ========================
  // ADVANCED FEATURES
  // ========================

  exportZone(domainId: number): Observable<{ zone: string }> {
    return this.http.get<{ zone: string }>(`${this.apiUrl}/domains/${domainId}/export`, { headers: this.getHeaders() });
  }

  bulkImportRecords(domainId: number, records: Partial<DnsRecord>[]): Observable<BulkImportResult> {
    return this.http.post<BulkImportResult>(`${this.apiUrl}/domains/${domainId}/records/bulk`, { records }, { headers: this.getHeaders() });
  }

  checkPropagation(domainId: number): Observable<PropagationResult> {
    return this.http.get<PropagationResult>(`${this.apiUrl}/domains/${domainId}/propagation`, { headers: this.getHeaders() });
  }

  getDomainStats(domainId: number): Observable<DomainStats> {
    return this.http.get<DomainStats>(`${this.apiUrl}/domains/${domainId}/stats`, { headers: this.getHeaders() });
  }
}
