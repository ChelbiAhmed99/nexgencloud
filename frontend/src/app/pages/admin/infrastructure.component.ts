import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-infrastructure',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header fade-in">
      <h1 class="text-gradient">Infrastructure Cluster</h1>
      <p>Surveillance et gestion des nœuds physiques et virtuels.</p>
    </div>

    <div class="nodes-grid fade-in">
      <div class="node-card glass-card" *ngFor="let node of nodes">
        <div class="node-header">
          <div class="status-indicator" [class.online]="node.status === 'online'"></div>
          <h3>{{ node.name }}</h3>
          <span class="ip">{{ node.ip }}</span>
        </div>
        
        <div class="metrics">
          <div class="metric">
            <div class="m-label">CPU</div>
            <div class="m-bar"><div class="m-fill" [style.width]="node.cpu + '%'"></div></div>
            <div class="m-value">{{ node.cpu }}%</div>
          </div>
          <div class="metric">
            <div class="m-label">RAM</div>
            <div class="m-bar"><div class="m-fill purple" [style.width]="node.ram + '%'"></div></div>
            <div class="m-value">{{ node.ram }}%</div>
          </div>
        </div>

        <div class="node-footer">
          <div class="info">
            <span>{{ node.containers }} conteneurs</span>
            <span>Uptime: {{ node.uptime }}</span>
          </div>
          <button class="btn-small glass-card">Détails</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header { margin-bottom: 2.5rem; h1 { font-size: 2.2rem; font-weight: 800; } p { color: #64748b; } }
    .nodes-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 2rem; }
    .node-card {
      padding: 1.75rem;
      .node-header {
        display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem;
        .status-indicator { width: 10px; height: 10px; border-radius: 50%; background: #ef4444; &.online { background: #10b981; box-shadow: 0 0 10px #10b981; } }
        h3 { font-size: 1.1rem; font-weight: 700; flex: 1; }
        .ip { font-family: monospace; font-size: 0.8rem; color: #94a3b8; }
      }
      .metrics {
        display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.5rem;
        .metric {
          display: grid; grid-template-columns: 40px 1fr 40px; align-items: center; gap: 1rem;
          .m-label { font-size: 0.75rem; font-weight: 800; color: #64748b; }
          .m-bar { height: 6px; background: #f1f5f9; border-radius: 10px; overflow: hidden; .m-fill { height: 100%; background: var(--primary); &.purple { background: #8b5cf6; } } }
          .m-value { font-size: 0.75rem; font-weight: 700; text-align: right; color: #1e293b; }
        }
      }
      .node-footer {
        display: flex; justify-content: space-between; align-items: center; padding-top: 1.25rem; border-top: 1px solid #f1f5f9;
        .info { display: flex; flex-direction: column; span { font-size: 0.75rem; color: #94a3b8; font-weight: 600; } }
        .btn-small { border: none; padding: 0.5rem 1rem; border-radius: 10px; font-size: 0.8rem; font-weight: 700; color: var(--primary); cursor: pointer; }
      }
    }
  `]
})
export class InfrastructureComponent implements OnInit, OnDestroy {
  nodes: any[] = [];
  interval: any;

  constructor(private http: HttpClient) {}

  getHeaders() {
    const s = localStorage.getItem('user_session');
    let token = '';
    if (s) {
      try { token = JSON.parse(s).token; } catch (e) {}
    }
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  ngOnInit() {
    this.fetchNodes();
    this.interval = setInterval(() => this.fetchNodes(), 3000); // Poll every 3s
  }

  ngOnDestroy() {
    if (this.interval) clearInterval(this.interval);
  }

  fetchNodes() {
    this.http.get<any[]>(`${environment.apiUrl}/admin/infrastructure`, { headers: this.getHeaders() })
      .subscribe({
        next: (data) => this.nodes = data,
        error: (err) => console.error('Erreur chargement infra', err)
      });
  }
}
