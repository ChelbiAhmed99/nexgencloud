import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ToastService } from '../../services/toast.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header fade-in">
      <h1 class="text-gradient">Paramètres du Compte</h1>
      <p>Gérez vos préférences, votre sécurité et vos notifications.</p>
    </div>

    <div class="settings-grid fade-in">
      <div class="settings-nav glass-card">
        <button class="nav-item" [class.active]="activeTab === 'profile'" (click)="activeTab = 'profile'">Profil</button>
        <button class="nav-item" [class.active]="activeTab === 'security'" (click)="activeTab = 'security'">Sécurité</button>
        <button class="nav-item" [class.active]="activeTab === 'billing'" (click)="activeTab = 'billing'">Facturation</button>
        <button class="nav-item" [class.active]="activeTab === 'notifications'" (click)="activeTab = 'notifications'">Notifications</button>
      </div>

      <div class="settings-content glass-card">
        <!-- PROFIL TAB -->
        <section class="settings-section" *ngIf="activeTab === 'profile'">
          <h2>Profil Public</h2>
          <div class="profile-header">
            <div class="avatar-large">{{ getInitials() }}</div>
            <div class="avatar-actions">
              <button class="btn-primary">Changer l'avatar</button>
              <button class="btn-text">Supprimer</button>
            </div>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label>Prénom</label>
              <input type="text" [(ngModel)]="profile.firstName" class="premium-input">
            </div>
            <div class="form-group">
              <label>Nom</label>
              <input type="text" [(ngModel)]="profile.lastName" class="premium-input">
            </div>
          </div>
          
          <div class="form-group">
            <label>Email (lecture seule)</label>
            <input type="email" [value]="profile.email" disabled class="premium-input disabled-input">
          </div>

          <div class="actions">
            <button class="btn-primary" (click)="saveProfile()" [disabled]="isSaving">
              {{ isSaving ? 'Sauvegarde...' : 'Sauvegarder les modifications' }}
            </button>
          </div>
        </section>

        <!-- SECURITY TAB -->
        <section class="settings-section" *ngIf="activeTab === 'security'">
          <h2>Sécurité et Authentification</h2>

          <!-- 2FA Section -->
          <div class="form-group">
            <label>Authentification à Deux Facteurs (2FA)</label>
            <p style="color:#64748b; font-size: 0.9rem; margin-bottom: 1rem;">Protégez votre compte avec une couche de sécurité supplémentaire.</p>
            <button class="btn-primary">Configurer la 2FA</button>
          </div>

          <!-- Password Section -->
          <div class="form-group" style="margin-top: 2rem; padding-top: 2rem; border-top: 1px solid #f1f5f9;">
            <label>Mot de passe</label>
            <button class="btn-secondary" style="margin-top: 0.5rem; padding: 0.75rem 1.5rem; border-radius: 12px; border: 1.5px solid rgba(0,0,0,0.1); background: white; cursor: pointer; font-weight: 600;">Changer le mot de passe</button>
          </div>

          <!-- Connected Accounts Section -->
          <div class="connected-accounts" style="margin-top: 2rem; padding-top: 2rem; border-top: 1px solid #f1f5f9;">
            <label>Comptes Connectés</label>
            <p style="color:#64748b; font-size: 0.9rem; margin-bottom: 1.5rem;">Gérez les fournisseurs d'identité liés à votre compte.</p>

            <div class="provider-list">
              <!-- Google -->
              <div class="provider-card" [class.connected]="connectedAccounts.google">
                <div class="provider-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                </div>
                <div class="provider-info">
                  <strong>Google</strong>
                  <span *ngIf="connectedAccounts.google" class="connected-label">✓ Connecté</span>
                  <span *ngIf="!connectedAccounts.google" class="disconnected-label">Non connecté</span>
                </div>
                <button class="provider-action" [class.disconnect]="connectedAccounts.google"
                        (click)="connectedAccounts.google ? null : linkProvider('google')">
                  {{ connectedAccounts.google ? 'Lié' : 'Connecter' }}
                </button>
              </div>

              <!-- GitHub -->
              <div class="provider-card" [class.connected]="connectedAccounts.github">
                <div class="provider-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="#1e293b"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.34-3.369-1.34-.454-1.152-1.11-1.458-1.11-1.458-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>
                </div>
                <div class="provider-info">
                  <strong>GitHub</strong>
                  <span *ngIf="connectedAccounts.github" class="connected-label">✓ Connecté</span>
                  <span *ngIf="!connectedAccounts.github" class="disconnected-label">Non connecté</span>
                </div>
                <button class="provider-action" [class.disconnect]="connectedAccounts.github"
                        (click)="connectedAccounts.github ? null : linkProvider('github')">
                  {{ connectedAccounts.github ? 'Lié' : 'Connecter' }}
                </button>
              </div>

              <!-- Microsoft -->
              <div class="provider-card" [class.connected]="connectedAccounts.microsoft">
                <div class="provider-icon">
                  <svg width="24" height="24" viewBox="0 0 23 23"><path fill="#f35325" d="M1 1h10v10H1z"/><path fill="#81bc06" d="M12 1h10v10H12z"/><path fill="#05a6f0" d="M1 12h10v10H1z"/><path fill="#ffba08" d="M12 12h10v10H12z"/></svg>
                </div>
                <div class="provider-info">
                  <strong>Microsoft</strong>
                  <span *ngIf="connectedAccounts.microsoft" class="connected-label">✓ Connecté</span>
                  <span *ngIf="!connectedAccounts.microsoft" class="disconnected-label">Non connecté</span>
                </div>
                <button class="provider-action" [class.disconnect]="connectedAccounts.microsoft"
                        (click)="connectedAccounts.microsoft ? null : linkProvider('microsoft')">
                  {{ connectedAccounts.microsoft ? 'Lié' : 'Connecter' }}
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- OTHER TABS -->
        <section class="settings-section" *ngIf="activeTab === 'billing' || activeTab === 'notifications'">
          <h2>{{ activeTab === 'billing' ? 'Facturation' : 'Notifications' }}</h2>
          <p style="color:#64748b; font-size: 0.9rem;">Cette section est en cours de construction.</p>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .page-header { margin-bottom: 2.5rem; h1 { font-size: 2.2rem; font-weight: 800; } p { color: #64748b; } }
    .settings-grid { display: grid; grid-template-columns: 250px 1fr; gap: 2rem; @media (max-width: 900px) { grid-template-columns: 1fr; } }
    
    .settings-nav {
      padding: 1rem; height: fit-content; display: flex; flex-direction: column; gap: 0.5rem;
      .nav-item {
        border: none; background: none; padding: 1rem 1.25rem; text-align: left; font-weight: 700; color: #64748b; border-radius: 14px; cursor: pointer; transition: all 0.2s;
        &:hover { background: #f8fafc; color: var(--primary); }
        &.active { background: rgba(79, 70, 229, 0.05); color: var(--primary); }
      }
    }

    .settings-content {
      padding: 3rem;
      h2 { font-size: 1.5rem; font-weight: 800; margin-bottom: 2.5rem; }
      .profile-header {
        display: flex; align-items: center; gap: 2rem; margin-bottom: 3rem;
        .avatar-large { width: 100px; height: 100px; background: var(--gradient-primary); border-radius: 30px; display: flex; align-items: center; justify-content: center; color: white; font-size: 2.5rem; font-weight: 800; }
        .avatar-actions { display: flex; gap: 1rem; align-items: center; }
      }
      .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem; }
      .form-group {
        margin-bottom: 1.5rem;
        label { display: block; font-size: 0.9rem; font-weight: 700; color: #1e293b; margin-bottom: 0.75rem; }
        .premium-input { width: 100%; padding: 0.85rem 1.25rem; background: #f8fafc; border: 1.5px solid rgba(0,0,0,0.03); border-radius: 12px; font-size: 1rem; font-weight: 500; outline: none; transition: all 0.2s; &:focus { border-color: var(--primary); background: white; box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.08); } }
      }
      .actions { margin-top: 3rem; padding-top: 2rem; border-top: 1px solid #f1f5f9; display: flex; justify-content: flex-end; }
      .disabled-input { background: #f1f5f9 !important; color: #94a3b8; cursor: not-allowed; }
    }

    .btn-text { background: none; border: none; color: #ef4444; font-weight: 700; cursor: pointer; &:hover { text-decoration: underline; } }

    // Connected Accounts
    .connected-accounts {
      label { display: block; font-size: 0.9rem; font-weight: 700; color: #1e293b; margin-bottom: 0.75rem; }
    }

    .provider-list {
      display: flex; flex-direction: column; gap: 0.75rem;
    }

    .provider-card {
      display: flex; align-items: center; gap: 1rem;
      padding: 1.25rem 1.5rem; border-radius: 16px;
      background: #f8fafc; border: 1.5px solid rgba(0,0,0,0.04);
      transition: all 0.25s;
      &:hover { background: #f1f5f9; }
      &.connected { border-color: rgba(16,185,129,0.2); background: rgba(16,185,129,0.03); }
    }

    .provider-icon {
      width: 44px; height: 44px; border-radius: 12px; background: white;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 2px 6px rgba(0,0,0,0.04); flex-shrink: 0;
    }

    .provider-info {
      flex: 1; display: flex; flex-direction: column;
      strong { font-size: 0.95rem; color: #1e293b; }
      .connected-label { font-size: 0.8rem; color: #10b981; font-weight: 700; }
      .disconnected-label { font-size: 0.8rem; color: #94a3b8; font-weight: 600; }
    }

    .provider-action {
      padding: 0.5rem 1.25rem; border-radius: 10px; border: 1.5px solid rgba(79,70,229,0.2);
      background: rgba(79,70,229,0.05); color: #4f46e5; font-weight: 700; font-size: 0.85rem;
      cursor: pointer; transition: all 0.2s;
      &:hover { background: rgba(79,70,229,0.1); transform: translateY(-1px); }
      &.disconnect {
        border-color: rgba(16,185,129,0.2); background: rgba(16,185,129,0.05);
        color: #10b981; cursor: default;
        &:hover { transform: none; }
      }
    }
  `]
})
export class SettingsComponent implements OnInit {
  activeTab = 'profile';
  profile = { firstName: '', lastName: '', email: '' };
  isSaving = false;
  connectedAccounts = { google: false, github: false, microsoft: false };

  constructor(private http: HttpClient, private toastService: ToastService) {}

  private getAuthHeaders(): HttpHeaders {
    let token = localStorage.getItem('auth_token') || '';
    if (!token) {
      const s = localStorage.getItem('user_session');
      if (s) try { token = JSON.parse(s).token || ''; } catch (e) {}
    }
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  ngOnInit() {
    // Load profile
    this.http.get<any>(`${environment.apiUrl}/users/profile`, { headers: this.getAuthHeaders() })
      .subscribe({
        next: (res) => this.profile = res,
        error: (err) => console.error('Erreur chargement profil', err)
      });

    // Load connected accounts from /auth/me
    this.http.get<any>(`${environment.apiUrl}/auth/me`, { headers: this.getAuthHeaders() })
      .subscribe({
        next: (res) => {
          this.connectedAccounts = {
            google: !!res.googleId,
            github: !!res.githubId,
            microsoft: !!res.microsoftId,
          };
        },
        error: () => {}
      });
  }

  getInitials() {
    return ((this.profile.firstName?.[0] || '') + (this.profile.lastName?.[0] || '')).toUpperCase() || 'U';
  }

  saveProfile() {
    this.isSaving = true;
    this.http.put(`${environment.apiUrl}/users/profile`, {
      firstName: this.profile.firstName,
      lastName: this.profile.lastName
    }, { headers: this.getAuthHeaders() }).subscribe({
      next: (res: any) => {
        this.profile = res;
        this.toastService.showSuccess('Profil à jour', 'Vos modifications ont été enregistrées.');
        // Update local storage name if needed
        const s = localStorage.getItem('user_session');
        if (s) {
          try {
            let session = JSON.parse(s);
            session.firstName = res.firstName;
            localStorage.setItem('user_session', JSON.stringify(session));
          } catch(e) {}
        }
        this.isSaving = false;
      },
      error: () => {
        this.toastService.showError('Erreur', 'Erreur lors de la mise à jour.');
        this.isSaving = false;
      }
    });
  }

  linkProvider(provider: string) {
    // Redirect to OAuth flow — after returning, the account will be linked
    window.location.href = `${environment.apiUrl}/auth/${provider}`;
  }
}
