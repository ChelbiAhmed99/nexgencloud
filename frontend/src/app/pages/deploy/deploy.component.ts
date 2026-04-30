import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-deploy',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="page-header fade-in">
      <div class="breadcrumb">
        <a routerLink="/applications">Applications</a>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
        <span class="current">Déployer</span>
      </div>
      <h1 class="text-gradient">Déployer une Application</h1>
    </div>

    <div class="wizard-wrapper fade-in">
      <div class="stepper glass-card">
        <div class="step active">
          <div class="step-num">1</div>
          <span>Image</span>
        </div>
        <div class="connector active"></div>
        <div class="step">
          <div class="step-num">2</div>
          <span>Config</span>
        </div>
        <div class="connector"></div>
        <div class="step">
          <div class="step-num">3</div>
          <span>Réseau</span>
        </div>
      </div>

      <div class="wizard-card glass-card">
        <div class="card-body">
          <section class="wizard-section">
            <div class="section-header">
              <h2>Source de l'application</h2>
              <p>Connectez votre registre Docker ou utilisez une image publique.</p>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label>Nom de l'instance</label>
                <div class="input-wrapper">
                  <input type="text" [(ngModel)]="appName" placeholder="Ex: my-app-production" class="premium-input">
                </div>
              </div>

              <div class="form-group">
                <label>Image Docker (Pull)</label>
                <div class="input-wrapper shell-input">
                  <span class="prefix">docker pull</span>
                  <input type="text" [(ngModel)]="dockerImage" placeholder="nginx:alpine" class="premium-input">
                </div>
              </div>
            </div>

            <div class="presets">
              <h3>Modèles rapides</h3>
              <div class="preset-grid">
                <div class="preset-card glass-card" [class.active]="dockerImage === 'nginx:alpine'" (click)="setPreset('nginx:alpine', 'Nginx-Server')">
                  <div class="p-icon blue">N</div>
                  <div class="p-info">
                    <strong>Nginx</strong>
                    <span>Serveur Web</span>
                  </div>
                </div>
                <div class="preset-card glass-card">
                  <div class="p-icon green">P</div>
                  <div class="p-info">
                    <strong>Postgres</strong>
                    <span>Base de données</span>
                  </div>
                </div>
                <div class="preset-card glass-card" [class.active]="dockerImage === 'redis:7'" (click)="setPreset('redis:7', 'Redis-Cache')">
                  <div class="p-icon orange">R</div>
                  <div class="p-info">
                    <strong>Redis</strong>
                    <span>Cache In-memory</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div class="card-footer">
          <button class="btn-text">Annuler</button>
          <button class="btn-primary" (click)="deploy()" [disabled]="isDeploying">
            {{ isDeploying ? 'Déploiement...' : 'Déployer maintenant' }}
            <svg *ngIf="!isDeploying" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      margin-bottom: 2.5rem;
      .breadcrumb {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--text-muted);
        margin-bottom: 0.75rem;
        a { color: var(--text-muted); text-decoration: none; &:hover { color: var(--primary); } }
        .current { color: var(--bg-dark); }
      }
      h1 { font-size: 2.2rem; font-weight: 800; }
    }

    .wizard-wrapper {
      max-width: 900px;
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .stepper {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.5rem 3rem;
      border-radius: 20px;
      .step {
        display: flex;
        align-items: center;
        gap: 1rem;
        font-weight: 700;
        color: var(--text-muted);
        font-size: 0.9rem;
        .step-num {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          background: rgba(0, 0, 0, 0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s;
        }
        &.active {
          color: var(--bg-dark);
          .step-num { background: var(--gradient-primary); color: white; box-shadow: 0 4px 10px rgba(99, 102, 241, 0.3); }
        }
      }
      .connector {
        flex: 1;
        height: 2px;
        background: rgba(0, 0, 0, 0.05);
        margin: 0 2rem;
        &.active { background: var(--primary); }
      }
    }

    .wizard-card {
      border-radius: 24px;
      overflow: hidden;
      .card-body { padding: 3rem; }
    }

    .section-header {
      margin-bottom: 2.5rem;
      h2 { font-size: 1.5rem; font-weight: 800; margin-bottom: 0.5rem; }
      p { color: var(--text-muted); font-weight: 500; }
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      margin-bottom: 3rem;
    }

    .form-group {
      label { display: block; font-size: 0.9rem; font-weight: 700; color: var(--bg-dark); margin-bottom: 0.75rem; }
      .premium-input {
        width: 100%;
        padding: 0.85rem 1.25rem;
        background: white;
        border: 1.5px solid rgba(0, 0, 0, 0.05);
        border-radius: 12px;
        font-size: 1rem;
        font-weight: 500;
        outline: none;
        transition: all 0.2s;
        &:focus { border-color: var(--primary); box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1); }
      }
      .shell-input {
        display: flex;
        background: white;
        border-radius: 12px;
        border: 1.5px solid rgba(0, 0, 0, 0.05);
        overflow: hidden;
        .prefix { background: #f8fafc; padding: 0 1rem; display: flex; align-items: center; color: var(--text-muted); font-family: monospace; font-weight: 600; border-right: 1.5px solid rgba(0, 0, 0, 0.05); font-size: 0.9rem; }
        .premium-input { border: none; border-radius: 0; }
      }
    }

    .presets {
      h3 { font-size: 0.85rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 1.25rem; }
      .preset-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1.25rem;
      }
      .preset-card {
        padding: 1.25rem;
        display: flex;
        align-items: center;
        gap: 1rem;
        cursor: pointer;
        transition: all 0.2s;
        border-color: transparent;
        .p-icon { 
          width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 800;
          &.blue { background: rgba(99, 102, 241, 0.1); color: #6366f1; }
          &.green { background: rgba(16, 185, 129, 0.1); color: #10b981; }
          &.orange { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
        }
        .p-info {
          display: flex;
          flex-direction: column;
          strong { font-size: 0.95rem; color: var(--bg-dark); }
          span { font-size: 0.75rem; color: var(--text-muted); font-weight: 600; }
        }
        &:hover { transform: translateY(-3px); border-color: rgba(99, 102, 241, 0.1); background: white; }
        &.active { border-color: var(--primary); background: white; box-shadow: 0 8px 20px rgba(99, 102, 241, 0.1); }
      }
    }

    .card-footer {
      padding: 2rem 3rem;
      background: rgba(0, 0, 0, 0.02);
      display: flex;
      justify-content: flex-end;
      gap: 1.5rem;
      .btn-text { background: none; border: none; color: var(--text-muted); font-weight: 700; cursor: pointer; &:hover { color: var(--bg-dark); } }
      .btn-primary { display: flex; align-items: center; gap: 0.75rem; }
    }
  `]
})
export class DeployComponent {
  appName = '';
  dockerImage = '';
  isDeploying = false;

  constructor(private http: HttpClient, private router: Router) {}

  setPreset(image: string, name: string) {
    this.dockerImage = image;
    this.appName = name + '-' + Math.floor(Math.random() * 1000);
  }

  deploy() {
    if(!this.appName || !this.dockerImage) {
      alert("Veuillez remplir le nom et l'image Docker.");
      return;
    }
    
    this.isDeploying = true;
    const s = localStorage.getItem('user_session');
    let token = s ? JSON.parse(s).token : '';
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.post('http://localhost:3000/api/apps/deploy', {
      name: this.appName,
      dockerImage: this.dockerImage
    }, { headers }).subscribe({
      next: () => {
        alert('Application déployée avec succès!');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        alert(err.error?.message || 'Erreur lors du déploiement');
        this.isDeploying = false;
      }
    });
  }
}
