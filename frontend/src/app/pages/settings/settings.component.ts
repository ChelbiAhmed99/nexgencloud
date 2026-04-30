import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

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
          <div class="form-group">
            <label>Authentification à Deux Facteurs (2FA)</label>
            <p style="color:#64748b; font-size: 0.9rem; margin-bottom: 1rem;">Protégez votre compte avec une couche de sécurité supplémentaire.</p>
            <button class="btn-primary">Configurer la 2FA</button>
          </div>
          <div class="form-group" style="margin-top: 2rem; padding-top: 2rem; border-top: 1px solid #f1f5f9;">
            <label>Mot de passe</label>
            <button class="btn-secondary" style="margin-top: 0.5rem; padding: 0.75rem 1.5rem; border-radius: 12px; border: 1.5px solid rgba(0,0,0,0.1); background: white; cursor: pointer; font-weight: 600;">Changer le mot de passe</button>
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
  `]
})
export class SettingsComponent implements OnInit {
  activeTab = 'profile';
  profile = { firstName: '', lastName: '', email: '' };
  isSaving = false;

  constructor(private http: HttpClient) {}

  getHeaders() {
    const s = localStorage.getItem('user_session');
    let token = '';
    if (s) try { token = JSON.parse(s).token; } catch (e) {}
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  ngOnInit() {
    this.http.get<any>('http://localhost:3000/api/users/profile', { headers: this.getHeaders() })
      .subscribe({
        next: (res) => this.profile = res,
        error: (err) => console.error('Erreur chargement profil', err)
      });
  }

  getInitials() {
    return ((this.profile.firstName?.[0] || '') + (this.profile.lastName?.[0] || '')).toUpperCase() || 'U';
  }

  saveProfile() {
    this.isSaving = true;
    this.http.put('http://localhost:3000/api/users/profile', {
      firstName: this.profile.firstName,
      lastName: this.profile.lastName
    }, { headers: this.getHeaders() }).subscribe({
      next: (res: any) => {
        this.profile = res;
        alert('Profil mis à jour avec succès !');
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
        alert('Erreur lors de la mise à jour.');
        this.isSaving = false;
      }
    });
  }
}
