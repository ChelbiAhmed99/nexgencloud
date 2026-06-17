import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DnsService, Domain, DnsRecord, DomainStats, PropagationServer } from '../../services/dns.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-dns',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dns.component.html',
  styleUrl: './dns.component.scss'
})
export class DnsComponent implements OnInit {
  domains: Domain[] = [];
  selectedDomain: Domain | null = null;
  records: DnsRecord[] = [];
  filteredRecords: DnsRecord[] = [];
  domainStats: DomainStats | null = null;
  propagationServers: PropagationServer[] = [];
  isLoading = true;
  activeFilter = 'ALL';
  showAddDomain = false;
  showRecordModal = false;
  showBulkImport = false;
  showPropagation = false;
  isEditMode = false;
  editRecordId: number | null = null;
  isPropagationLoading = false;
  newDomainUrl = '';
  bulkImportText = '';
  recordForm = { type: 'A' as any, name: '@', value: '', ttl: 3600, priority: 10 };
  recordTypes = ['A','AAAA','CNAME','MX','TXT','NS','SRV'];
  filterTypes = ['ALL','A','AAAA','CNAME','MX','TXT','NS','SRV'];

  constructor(private dnsService: DnsService, private toastService: ToastService) {}

  ngOnInit() { this.loadDomains(); }

  // ========================
  // TOAST
  // ========================

  showToast(message: string, type: 'success' | 'error' | 'info' = 'success') {
    if (type === 'success') this.toastService.showSuccess('DNS', message);
    if (type === 'error') this.toastService.showError('Erreur DNS', message);
    if (type === 'info') this.toastService.showInfo('Info DNS', message);
  }

  // ========================
  // DOMAINS
  // ========================

  loadDomains() {
    this.isLoading = true;
    this.dnsService.getDomains().subscribe({
      next: (d) => {
        this.domains = d;
        this.isLoading = false;
        if (d.length > 0 && !this.selectedDomain) this.selectDomain(d[0]);
      },
      error: () => { this.isLoading = false; this.showToast('Erreur lors du chargement des domaines.', 'error'); }
    });
  }

  selectDomain(d: Domain) {
    this.selectedDomain = d;
    this.loadRecords(d.id);
    this.loadStats(d.id);
    this.propagationServers = [];
    this.showPropagation = false;
  }

  loadRecords(domainId: number) {
    this.dnsService.getDnsRecords(domainId).subscribe({
      next: (r) => { this.records = r; this.applyFilter(); },
      error: () => { this.showToast('Erreur lors du chargement des enregistrements.', 'error'); }
    });
  }

  loadStats(domainId: number) {
    this.dnsService.getDomainStats(domainId).subscribe({
      next: (s) => { this.domainStats = s; },
      error: () => {}
    });
  }

  applyFilter() {
    this.filteredRecords = this.activeFilter === 'ALL' ? [...this.records] : this.records.filter(r => r.type === this.activeFilter);
  }

  setFilter(f: string) { this.activeFilter = f; this.applyFilter(); }

  addDomain() {
    if (!this.newDomainUrl.trim()) return;
    this.dnsService.addDomain(this.newDomainUrl.trim()).subscribe({
      next: () => { this.newDomainUrl = ''; this.showAddDomain = false; this.loadDomains(); this.showToast('Domaine ajouté avec succès !'); },
      error: (err) => { this.showToast(err.error?.message || 'Erreur lors de l\'ajout du domaine.', 'error'); }
    });
  }

  verifyDomain(id: number) {
    this.dnsService.verifyDomain(id).subscribe({
      next: () => { this.loadDomains(); this.showToast('Domaine vérifié avec succès !'); },
      error: () => { this.showToast('Erreur lors de la vérification.', 'error'); }
    });
  }

  deleteDomain(id: number) {
    if (!confirm('Supprimer ce domaine et tous ses enregistrements ?')) return;
    this.dnsService.deleteDomain(id).subscribe({
      next: () => {
        if (this.selectedDomain?.id === id) { this.selectedDomain = null; this.domainStats = null; }
        this.loadDomains();
        this.showToast('Domaine supprimé.');
      },
      error: () => { this.showToast('Erreur lors de la suppression.', 'error'); }
    });
  }

  // ========================
  // RECORDS
  // ========================

  openAddRecord() {
    this.isEditMode = false; this.editRecordId = null;
    this.recordForm = { type: 'A' as any, name: '@', value: '', ttl: 3600, priority: 10 };
    this.showRecordModal = true;
  }

  openEditRecord(r: DnsRecord) {
    this.isEditMode = true; this.editRecordId = r.id;
    this.recordForm = { type: r.type, name: r.name, value: r.value, ttl: r.ttl, priority: r.priority || 10 };
    this.showRecordModal = true;
  }

  saveRecord() {
    if (!this.selectedDomain) return;
    const data: any = { ...this.recordForm };
    if (!['MX','SRV'].includes(data.type)) delete data.priority;

    if (this.isEditMode && this.editRecordId) {
      this.dnsService.updateDnsRecord(this.editRecordId, data).subscribe({
        next: () => { this.showRecordModal = false; this.loadRecords(this.selectedDomain!.id); this.loadStats(this.selectedDomain!.id); this.showToast('Enregistrement modifié.'); },
        error: (err) => { this.showToast(err.error?.message || 'Erreur lors de la modification.', 'error'); }
      });
    } else {
      this.dnsService.addDnsRecord(this.selectedDomain.id, data).subscribe({
        next: () => { this.showRecordModal = false; this.loadRecords(this.selectedDomain!.id); this.loadStats(this.selectedDomain!.id); this.showToast('Enregistrement créé.'); },
        error: (err) => { this.showToast(err.error?.message || 'Erreur lors de la création.', 'error'); }
      });
    }
  }

  deleteRecord(id: number) {
    if (!confirm('Supprimer cet enregistrement DNS ?')) return;
    this.dnsService.deleteDnsRecord(id).subscribe({
      next: () => {
        if (this.selectedDomain) { this.loadRecords(this.selectedDomain.id); this.loadStats(this.selectedDomain.id); }
        this.showToast('Enregistrement supprimé.');
      },
      error: () => { this.showToast('Erreur lors de la suppression.', 'error'); }
    });
  }

  toggleRecord(id: number) {
    this.dnsService.toggleDnsRecord(id).subscribe({
      next: () => {
        if (this.selectedDomain) { this.loadRecords(this.selectedDomain.id); this.loadStats(this.selectedDomain.id); }
      },
      error: () => { this.showToast('Erreur lors du basculement.', 'error'); }
    });
  }

  // ========================
  // ADVANCED FEATURES
  // ========================

  exportZone() {
    if (!this.selectedDomain) return;
    this.dnsService.exportZone(this.selectedDomain.id).subscribe({
      next: (res) => {
        const blob = new Blob([res.zone], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.selectedDomain!.url}.zone`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.showToast('Fichier zone exporté avec succès !');
      },
      error: () => { this.showToast('Erreur lors de l\'export.', 'error'); }
    });
  }

  openBulkImport() {
    this.bulkImportText = '';
    this.showBulkImport = true;
  }

  executeBulkImport() {
    if (!this.selectedDomain || !this.bulkImportText.trim()) return;

    try {
      const records = JSON.parse(this.bulkImportText);
      if (!Array.isArray(records)) {
        this.showToast('Format invalide. Fournir un tableau JSON.', 'error');
        return;
      }

      this.dnsService.bulkImportRecords(this.selectedDomain.id, records).subscribe({
        next: (res) => {
          this.showBulkImport = false;
          this.loadRecords(this.selectedDomain!.id);
          this.loadStats(this.selectedDomain!.id);
          let msg = `${res.imported} enregistrement(s) importé(s).`;
          if (res.errors.length > 0) {
            msg += ` ${res.errors.length} erreur(s).`;
          }
          this.showToast(msg, res.errors.length > 0 ? 'info' : 'success');
        },
        error: (err) => { this.showToast(err.error?.message || 'Erreur lors de l\'import.', 'error'); }
      });
    } catch (e) {
      this.showToast('JSON invalide. Vérifiez le format.', 'error');
    }
  }

  checkPropagation() {
    if (!this.selectedDomain) return;
    this.isPropagationLoading = true;
    this.showPropagation = true;
    this.propagationServers = [];

    this.dnsService.checkPropagation(this.selectedDomain.id).subscribe({
      next: (res) => {
        this.propagationServers = res.servers;
        this.isPropagationLoading = false;
      },
      error: () => {
        this.isPropagationLoading = false;
        this.showToast('Erreur lors de la vérification de propagation.', 'error');
      }
    });
  }

  getPropagationPercent(): number {
    if (this.propagationServers.length === 0) return 0;
    const propagated = this.propagationServers.filter(s => s.status === 'PROPAGATED').length;
    return Math.round((propagated / this.propagationServers.length) * 100);
  }

  // ========================
  // HELPERS
  // ========================

  needsPriority(): boolean { return ['MX','SRV'].includes(this.recordForm.type); }

  getStatusClass(s: string): string {
    return s === 'VERIFIED' ? 'verified' : s === 'FAILED' ? 'failed' : 'pending';
  }

  getStatusLabel(s: string): string {
    return s === 'VERIFIED' ? 'Vérifié' : s === 'FAILED' ? 'Échoué' : 'En attente';
  }

  getTypeColor(t: string): string {
    const m: any = { A:'#4f46e5', AAAA:'#7c3aed', CNAME:'#0891b2', MX:'#059669', TXT:'#d97706', NS:'#dc2626', SRV:'#be185d' };
    return m[t] || '#64748b';
  }

  getBulkImportPlaceholder(): string {
    return `[
  { "type": "A", "name": "www", "value": "192.168.1.1", "ttl": 3600 },
  { "type": "CNAME", "name": "blog", "value": "blog.example.com", "ttl": 3600 },
  { "type": "MX", "name": "@", "value": "mail.example.com", "ttl": 3600, "priority": 10 }
]`;
  }
}
