import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ToastService } from '../../services/toast.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-applications',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-header fade-in">
      <div class="title-section">
        <h1 class="text-gradient">Mes Applications</h1>
        <p>Gérez et surveillez vos conteneurs haute performance.</p>
      </div>
      <a routerLink="/deploy" class="btn-primary">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        Déployer une application
      </a>
    </div>

    <div class="apps-grid fade-in">
      <div *ngIf="apps.length === 0" class="empty-state glass-card">
        <p>Aucune application déployée.</p>
      </div>

      <div class="app-card glass-card" *ngFor="let app of apps">
        <div class="card-header">
          <div class="app-icon-wrapper" [ngClass]="getAppColor(app.dockerImage)">
            <div class="app-icon">{{ app.dockerImage.substring(0, 2).toUpperCase() }}</div>
          </div>
          <div class="header-info">
            <h3>{{ app.name }}</h3>
            <div class="status-pill" [ngClass]="app.status === 'running' ? 'online' : 'offline'">
              <span class="dot"></span>
              {{ app.status === 'running' ? 'En ligne' : 'Hors ligne' }}
            </div>
          </div>
          <button class="btn-icon-small glass-card" (click)="deleteApp(app.id)" title="Supprimer">
            🗑️
          </button>
        </div>
        
        <div class="card-body">
          <div class="url-badge glass-card" [class.disabled]="app.status !== 'running'">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
            {{ app.customDomain ? app.customDomain : app.name.toLowerCase() + '.nexgen-cloud.local' }}
          </div>
          <div class="meta-info">
            <div class="meta-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
              {{ app.dockerImage }}
            </div>
          </div>
        </div>

        <div class="card-footer">
          <button class="btn-outline-danger" *ngIf="app.status === 'running'" (click)="stopApp(app.id)">Arrêter</button>
          <button class="btn-outline-success" *ngIf="app.status !== 'running'" (click)="startApp(app.id)">Démarrer</button>
          <button class="btn-outline-primary" routerLink="/settings">Gérer</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2.5rem;
      h1 { font-size: 2.2rem; font-weight: 800; margin-bottom: 0.25rem; }
      p { color: var(--text-muted); font-size: 1.1rem; }
    }

    .apps-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
      gap: 2rem;
    }

    .app-card {
      padding: 1.75rem;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      .app-icon-wrapper {
        width: 56px;
        height: 56px;
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 800;
        font-size: 1.1rem;
        &.blue { background: rgba(99, 102, 241, 0.1); color: #6366f1; }
        &.purple { background: rgba(168, 85, 247, 0.1); color: #a855f7; }
      }
      .header-info {
        flex: 1;
        h3 { font-size: 1.2rem; font-weight: 700; color: var(--bg-dark); margin-bottom: 0.25rem; }
      }
    }

    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.25rem 0.75rem;
      border-radius: 100px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      .dot { width: 6px; height: 6px; border-radius: 50%; }
      &.online { 
        background: rgba(16, 185, 129, 0.1); color: #059669; 
        .dot { background: #10b981; box-shadow: 0 0 6px #10b981; }
      }
      &.offline { 
        background: rgba(241, 245, 249, 1); color: #64748b; 
        .dot { background: #94a3b8; }
      }
    }

    .btn-icon-small {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 10px;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      &:hover { color: var(--primary); background: white; }
    }

    .card-body {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      .url-badge {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem 1rem;
        font-size: 0.9rem;
        font-weight: 600;
        color: var(--primary);
        border-radius: 12px;
        &.disabled { color: var(--text-muted); opacity: 0.7; }
      }
      .meta-info {
        display: flex;
        gap: 1.5rem;
        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
          color: var(--text-muted);
          font-weight: 500;
        }
      }
    }

    .card-footer {
      display: flex;
      gap: 1rem;
      padding-top: 1.25rem;
      border-top: 1px solid rgba(0, 0, 0, 0.03);
      button { flex: 1; padding: 0.75rem; border-radius: 10px; font-weight: 700; font-size: 0.85rem; cursor: pointer; transition: all 0.2s; border: 1.5px solid transparent; }
      .btn-outline-danger { background: transparent; border-color: #fee2e2; color: #ef4444; &:hover { background: #ef4444; color: white; border-color: #ef4444; } }
      .btn-outline-success { background: transparent; border-color: #dcfce7; color: #10b981; &:hover { background: #10b981; color: white; border-color: #10b981; } }
      .btn-outline-primary { background: transparent; border-color: rgba(99, 102, 241, 0.2); color: var(--primary); &:hover { background: var(--primary); color: white; border-color: var(--primary); } }
    }
  `]
})
export class ApplicationsComponent implements OnInit, OnDestroy {
  apps: any[] = [];
  interval: any;

  constructor(private http: HttpClient, private toastService: ToastService) {}

  getHeaders() {
    const s = localStorage.getItem('user_session');
    let token = '';
    if (s) {
      try { token = JSON.parse(s).token; } catch (e) {}
    }
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  ngOnInit() {
    this.fetchApps();
    this.interval = setInterval(() => this.fetchApps(), 5000);
  }

  ngOnDestroy() {
    if (this.interval) clearInterval(this.interval);
  }

  fetchApps() {
    this.http.get<any[]>(`${environment.apiUrl}/apps`, { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          this.apps = data;
        },
        error: (err) => {
          console.error('Erreur lors de la récupération des apps', err);
          this.toastService.showError('Erreur', 'Impossible de récupérer vos applications.');
        }
      });
  }

  startApp(id: number) {
    this.http.post(`${environment.apiUrl}/apps/${id}/start`, {}, { headers: this.getHeaders() })
      .subscribe({
        next: () => {
          this.toastService.showSuccess('Succès', 'Application démarrée.');
          this.fetchApps();
        },
        error: (err) => this.toastService.showError('Erreur', "Impossible de démarrer l'application.")
      });
  }

  stopApp(id: number) {
    this.http.post(`${environment.apiUrl}/apps/${id}/stop`, {}, { headers: this.getHeaders() })
      .subscribe({
        next: () => {
          this.toastService.showSuccess('Succès', 'Application arrêtée.');
          this.fetchApps();
        },
        error: (err) => this.toastService.showError('Erreur', "Impossible d'arrêter l'application.")
      });
  }

  deleteApp(id: number) {
    if(confirm('Êtes-vous sûr de vouloir supprimer cette application ?')) {
      this.http.delete(`${environment.apiUrl}/apps/${id}`, { headers: this.getHeaders() })
        .subscribe({
          next: () => {
            this.toastService.showSuccess('Succès', 'Application supprimée.');
            this.fetchApps();
          },
          error: (err) => this.toastService.showError('Erreur', "Impossible de supprimer l'application.")
        });
    }
  }

  getAppColor(image: string): string {
    if (!image) return 'blue';
    if (image.includes('node') || image.includes('npm')) return 'purple';
    if (image.includes('python') || image.includes('django')) return 'blue';
    if (image.includes('php') || image.includes('wordpress')) return 'blue';
    return 'blue';
  }
}

