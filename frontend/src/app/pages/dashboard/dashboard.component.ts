import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container fade-in">
      <!-- Header with Quick Actions -->
      <div class="dashboard-header">
        <div class="welcome">
          <h1>Bienvenue, <span class="text-gradient">{{ userName }}</span></h1>
          <p>Voici un aperçu de votre infrastructure en temps réel.</p>
        </div>
        <div class="header-actions">
          <button class="btn-secondary" (click)="exportReport()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Rapport PDF
          </button>
          <button class="btn-primary" (click)="goToDeploy()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Nouveau projet
          </button>
        </div>
      </div>

      <!-- Live Performance Monitor -->
      <div class="performance-grid">
        <div class="perf-card glass-card">
          <div class="perf-info">
            <h3>CPU Load</h3>
            <div class="value">{{ cpuHistory[cpuHistory.length - 1] }}%</div>
          </div>
          <div class="perf-chart">
            <div class="chart-line" *ngFor="let h of cpuHistory" [style.height]="h + '%'"></div>
          </div>
        </div>
        <div class="perf-card glass-card">
          <div class="perf-info">
            <h3>Memory</h3>
            <div class="value">{{ (ramHistory[ramHistory.length - 1] / 100 * 4).toFixed(1) }} GB / 4 GB</div>
          </div>
          <div class="perf-chart">
            <div class="chart-line" *ngFor="let h of ramHistory" [style.height]="h + '%'"></div>
          </div>
        </div>
        <div class="perf-card glass-card">
          <div class="perf-info">
            <h3>Network</h3>
            <div class="value">{{ netHistory[netHistory.length - 1] }} MB/s</div>
          </div>
          <div class="perf-chart">
            <div class="chart-line" *ngFor="let h of netHistory" [style.height]="h + '%'"></div>
          </div>
        </div>
      </div>

      <div class="main-grid">
        <!-- Main Stats Table/List -->
        <div class="content-panel glass-card">
          <div class="panel-header">
            <h2>Instances Actives</h2>
            <div class="tabs">
              <button class="active">Tous</button>
              <button>Production</button>
              <button>Staging</button>
            </div>
          </div>
          <div class="instances-table">
            <div class="table-row header">
              <span>Nom</span>
              <span>Image</span>
              <span>Port</span>
              <span>Status</span>
              <span>Actions</span>
            </div>
            <div *ngIf="apps.length === 0" style="padding: 2rem; text-align: center; color: #94a3b8;">
              Aucune application déployée. <a style="color: var(--primary); cursor: pointer; font-weight: 700;" (click)="goToDeploy()">Déployer maintenant →</a>
            </div>
            <div class="table-row" *ngFor="let app of apps">
              <div class="app-name-cell">
                <div class="app-dot" [class.online]="app.status === 'running'"></div>
                <strong>{{ app.name }}</strong>
              </div>
              <span class="image-tag">{{ app.image }}</span>
              <span class="mono">{{ app.port }}</span>
              <div class="status-cell">
                <span class="pill" [class.running]="app.status === 'running'" [class.creating]="app.status === 'creating'">
                  {{ app.status === 'running' ? 'Actif' : app.status === 'creating' ? 'Démarrage...' : 'Arrêté' }}
                </span>
              </div>
              <div class="actions-cell">
                <button class="btn-icon" (click)="stopApp(app.id)" title="Arrêter" *ngIf="app.status === 'running'">🛑</button>
                <button class="btn-icon" (click)="restartApp(app.id)" title="Redémarrer" *ngIf="app.status !== 'creating'">🔄</button>
                <button class="btn-icon" (click)="deleteApp(app.id)" title="Supprimer">🗑️</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar Dashboard Content -->
        <div class="side-panel">
          <!-- Real-time Activity Logs -->
          <div class="activity-panel glass-card">
            <h3>Activité récente</h3>
            <div class="log-stream">
              <div class="log-item" *ngFor="let log of logs">
                <div class="log-time">{{ log.time }}</div>
                <div class="log-text">
                  <strong>{{ log.user }}</strong> {{ log.action }} <span>{{ log.target }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Mock Terminal Emulator -->
          <div class="terminal-panel">
            <div class="terminal-header">
              <div class="dots"><span></span><span></span><span></span></div>
              <span class="title">SSH: nexgen-cloud-cluster-01</span>
            </div>
            <div class="terminal-body">
              <div class="line"><span class="prompt">root&#64;nexgen:~$</span> docker ps</div>
              <div class="line output">CONTAINER ID   IMAGE          STATUS          PORTS</div>
              <div class="line output">a1b2c3d4e5f6   nginx:latest   Up 2 hours      0.0.0.0:80->80/tcp</div>
              <div class="line output">f9e8d7c6b5a4   postgres:15    Up 5 hours      0.0.0.0:5432->5432/tcp</div>
              <div class="line"><span class="prompt">root&#64;nexgen:~$</span> <span class="cursor">_</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container { display: flex; flex-direction: column; gap: 2rem; padding: 0.5rem; }
    
    .dashboard-header {
      display: flex; justify-content: space-between; align-items: center;
      .welcome { h1 { font-size: 2.2rem; font-weight: 800; margin-bottom: 0.5rem; } p { color: var(--text-muted); font-size: 1.1rem; } }
      .header-actions { display: flex; gap: 1rem; }
    }

    .btn-secondary {
      display: flex; align-items: center; gap: 0.5rem;
      padding: 0.75rem 1.5rem; border-radius: 12px;
      border: 1.5px solid rgba(0,0,0,0.08); background: white;
      font-weight: 700; color: #475569; cursor: pointer;
      transition: all 0.2s;
      &:hover { background: #f8fafc; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
    }

    .performance-grid {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem;
      .perf-card {
        padding: 1.5rem; display: flex; justify-content: space-between; align-items: center;
        h3 { font-size: 0.9rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
        .value { font-size: 1.5rem; font-weight: 800; color: #0f172a; margin-top: 0.5rem; }
        .perf-chart {
          display: flex; align-items: flex-end; gap: 3px; height: 50px;
          .chart-line { width: 4px; background: var(--primary); border-radius: 10px; opacity: 0.3; transition: height 0.5s ease; }
        }
      }
    }

    .main-grid {
      display: grid; grid-template-columns: 2fr 1fr; gap: 2rem;
      @media (max-width: 1200px) { grid-template-columns: 1fr; }
    }

    .content-panel {
      padding: 2rem;
      .panel-header {
        display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;
        h2 { font-size: 1.3rem; font-weight: 800; }
        .tabs {
          display: flex; background: #f1f5f9; padding: 0.25rem; border-radius: 10px;
          button {
            border: none; background: none; padding: 0.5rem 1rem; font-size: 0.85rem; font-weight: 700; color: #64748b; cursor: pointer; border-radius: 8px;
            &.active { background: white; color: var(--primary); box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
          }
        }
      }
    }

    .instances-table {
      .table-row {
        display: grid; grid-template-columns: 2fr 1.5fr 1fr 1fr 1fr; padding: 1.25rem 0; align-items: center; border-bottom: 1px solid #f1f5f9;
        &.header { color: #94a3b8; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1.5px solid #f1f5f9; }
        .app-name-cell {
          display: flex; align-items: center; gap: 0.75rem;
          .app-dot { width: 8px; height: 8px; border-radius: 50%; background: #e2e8f0; &.online { background: #10b981; box-shadow: 0 0 8px #10b981; } }
          strong { font-size: 0.95rem; color: #0f172a; }
        }
        .image-tag { font-size: 0.8rem; background: #f8fafc; padding: 0.25rem 0.6rem; border-radius: 6px; border: 1px solid #e2e8f0; color: #64748b; font-family: monospace; width: fit-content; }
        .mono { font-family: monospace; font-size: 0.85rem; color: #64748b; }
        .pill { 
          font-size: 0.75rem; font-weight: 700; padding: 0.25rem 0.6rem; border-radius: 100px; background: #f1f5f9; color: #64748b;
          &.running { background: rgba(16, 185, 129, 0.1); color: #059669; }
          &.creating { background: rgba(245, 158, 11, 0.1); color: #d97706; animation: pulse 1.5s ease-in-out infinite; }
        }
        .actions-cell { display: flex; gap: 0.5rem; .btn-icon { background: none; border: none; cursor: pointer; font-size: 1.1rem; opacity: 0.5; &:hover { opacity: 1; } } }
      }
    }

    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

    .side-panel { display: flex; flex-direction: column; gap: 2rem; }

    .activity-panel {
      padding: 1.5rem;
      h3 { font-size: 1rem; font-weight: 800; margin-bottom: 1.5rem; }
      .log-stream {
        display: flex; flex-direction: column; gap: 1.25rem;
        .log-item {
          display: flex; gap: 1rem; font-size: 0.85rem;
          .log-time { color: #cbd5e1; font-weight: 700; }
          .log-text { color: #64748b; strong { color: #1e293b; } span { color: var(--primary); font-weight: 600; } }
        }
      }
    }

    .terminal-panel {
      background: #1e293b; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.2);
      .terminal-header {
        background: #0f172a; padding: 0.75rem 1rem; display: flex; align-items: center; gap: 1rem;
        .dots { display: flex; gap: 6px; span { width: 10px; height: 10px; border-radius: 50%; &:nth-child(1) { background: #ff5f56; } &:nth-child(2) { background: #ffbd2e; } &:nth-child(3) { background: #27c93f; } } }
        .title { color: #94a3b8; font-size: 0.75rem; font-weight: 700; font-family: monospace; }
      }
      .terminal-body {
        padding: 1.5rem; font-family: 'Fira Code', 'Courier New', monospace; font-size: 0.85rem; height: 200px;
        .line { color: #fff; margin-bottom: 0.5rem; .prompt { color: #10b981; } &.output { color: #94a3b8; } .cursor { animation: blink 1s infinite; } }
      }
    }

    @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  userName = 'Administrateur';
  cpuHistory = [30, 45, 38, 52, 48, 42, 45, 50, 48, 42];
  ramHistory = [60, 62, 58, 65, 63, 60, 58, 62, 60, 58];
  netHistory = [20, 35, 25, 40, 30, 50, 45, 60, 55, 50];

  apps: any[] = [];
  logs = [
    { time: '14:20', user: 'Amine', action: 'a déployé', target: 'Auth-Service v2' },
    { time: '13:45', user: 'Sarah', action: 'a arrêté', target: 'Legacy CMS' },
    { time: '12:10', user: 'System', action: 'Auto-scaling', target: 'Cluster-01 (+2 nodes)' },
    { time: '10:30', user: 'Amine', action: 'a créé', target: 'Redis Cache' }
  ];

  private chartInterval: any;
  private pollInterval: any;

  constructor(
    private http: HttpClient,
    private router: Router,
    private toastService: ToastService
  ) {}

  getHeaders() {
    const s = localStorage.getItem('user_session');
    let token = '';
    if (s) {
      try { token = JSON.parse(s).token; } catch (e) {}
    }
    const authToken = localStorage.getItem('auth_token');
    if (authToken) token = authToken;
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  ngOnInit() {
    const s = localStorage.getItem('user_session');
    if (s) try { this.userName = JSON.parse(s).firstName || 'Utilisateur'; } catch (e) {}
    
    this.fetchApps();
    this.pollInterval = setInterval(() => this.fetchApps(), 5000);

    this.chartInterval = setInterval(() => {
      this.cpuHistory = [...this.cpuHistory.slice(1), Math.floor(Math.random() * 20) + 30];
      this.ramHistory = [...this.ramHistory.slice(1), Math.floor(Math.random() * 10) + 55];
      this.netHistory = [...this.netHistory.slice(1), Math.floor(Math.random() * 40) + 20];
    }, 2000);
  }

  ngOnDestroy() {
    if (this.chartInterval) clearInterval(this.chartInterval);
    if (this.pollInterval) clearInterval(this.pollInterval);
  }

  fetchApps() {
    this.http.get<any[]>(`${environment.apiUrl}/apps`, { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          this.apps = data.map(app => ({
            id: app.id,
            name: app.name,
            image: app.dockerImage,
            port: '80',
            status: app.status
          }));
        },
        error: (err) => console.error('Erreur lors de la récupération des apps', err)
      });
  }

  goToDeploy() {
    this.router.navigate(['/deploy']);
  }

  exportReport() {
    this.toastService.showInfo('Export', 'La génération du rapport PDF est en cours...');
    setTimeout(() => {
      this.toastService.showSuccess('Rapport prêt', 'Le rapport a été généré avec succès.');
    }, 2000);
  }

  stopApp(id: number) {
    this.http.post(`${environment.apiUrl}/apps/${id}/stop`, {}, { headers: this.getHeaders() })
      .subscribe({
        next: () => {
          this.toastService.showSuccess('Application arrêtée', "L'application a été arrêtée avec succès.");
          this.fetchApps();
        },
        error: () => this.toastService.showError('Erreur', "Impossible d'arrêter l'application.")
      });
  }

  restartApp(id: number) {
    this.http.post(`${environment.apiUrl}/apps/${id}/restart`, {}, { headers: this.getHeaders() })
      .subscribe({
        next: () => {
          this.toastService.showInfo('Redémarrage', "L'application redémarre...");
          this.fetchApps();
        },
        error: () => this.toastService.showError('Erreur', "Impossible de redémarrer l'application.")
      });
  }

  deleteApp(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette application ?')) {
      this.http.delete(`${environment.apiUrl}/apps/${id}`, { headers: this.getHeaders() })
        .subscribe({
          next: () => {
            this.toastService.showSuccess('Supprimée', "L'application a été supprimée.");
            this.fetchApps();
          },
          error: () => this.toastService.showError('Erreur', "Impossible de supprimer l'application.")
        });
    }
  }
}
