import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header fade-in">
      <h1 class="text-gradient">Gestion des Utilisateurs</h1>
      <p>Supervisez les accès, les rôles et les quotas des membres de la plateforme.</p>
    </div>

    <div class="users-card glass-card fade-in">
      <div class="table-header">
        <div class="search-field">
          <input type="text" placeholder="Rechercher un utilisateur...">
        </div>
        <button class="btn-primary">+ Ajouter un utilisateur</button>
      </div>

      <div class="users-table">
        <div class="row header">
          <span>Utilisateur</span>
          <span>Rôle</span>
          <span>Usage Quota</span>
          <span>Dernière connexion</span>
          <span>Actions</span>
        </div>
        <div class="row" *ngFor="let user of users">
          <div class="user-cell">
            <div class="avatar-small" [style.background]="user.color">{{ user.name.charAt(0) }}</div>
            <div class="info">
              <span class="name">{{ user.name }}</span>
              <span class="email">{{ user.email }}</span>
            </div>
          </div>
          <span class="role-badge" [class.admin]="user.role === 'Admin'">{{ user.role }}</span>
          <div class="quota-cell">
            <div class="q-bar"><div class="q-fill" [style.width]="user.quota + '%'"></div></div>
            <span>{{ user.quota }}%</span>
          </div>
          <span class="date">{{ user.lastSeen }}</span>
          <div class="actions">
            <button class="btn-icon">✏️</button>
            <button class="btn-icon danger">🗑️</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header { margin-bottom: 2.5rem; h1 { font-size: 2.2rem; font-weight: 800; } p { color: #64748b; } }
    .users-card { padding: 2rem; }
    .table-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; .search-field { input { padding: 0.75rem 1.25rem; border-radius: 12px; border: 1px solid #e2e8f0; width: 300px; outline: none; &:focus { border-color: var(--primary); } } } }
    .users-table {
      .row {
        display: grid; grid-template-columns: 2fr 1fr 1.5fr 1.5fr 1fr; padding: 1.25rem 0; align-items: center; border-bottom: 1px solid #f1f5f9;
        &.header { color: #94a3b8; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1.5px solid #f1f5f9; }
        .user-cell { display: flex; align-items: center; gap: 1rem; .avatar-small { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 0.9rem; } .info { display: flex; flex-direction: column; .name { font-weight: 700; color: #1e293b; } .email { font-size: 0.8rem; color: #94a3b8; } } }
        .role-badge { font-size: 0.75rem; font-weight: 700; padding: 0.25rem 0.6rem; border-radius: 8px; background: #f1f5f9; color: #64748b; &.admin { background: rgba(79, 70, 229, 0.1); color: var(--primary); } }
        .quota-cell { display: flex; align-items: center; gap: 0.75rem; font-size: 0.8rem; font-weight: 700; .q-bar { flex: 1; height: 6px; background: #f1f5f9; border-radius: 10px; overflow: hidden; .q-fill { height: 100%; background: var(--primary); } } }
        .date { font-size: 0.85rem; color: #64748b; font-weight: 500; }
        .actions { display: flex; gap: 0.5rem; .btn-icon { background: none; border: none; cursor: pointer; font-size: 1rem; &.danger { color: #ef4444; } } }
      }
    }
  `]
})
export class UsersComponent implements OnInit {
  users: any[] = [];
  
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
    this.http.get<any[]>('http://localhost:3000/api/users', { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          this.users = data.map(user => {
            const name = (user.firstName || '') + ' ' + (user.lastName || '');
            return {
              id: user.id,
              name: name.trim() || 'Utilisateur ' + user.id,
              email: user.email,
              role: user.role === 'admin' ? 'Admin' : 'User',
              quota: Math.floor(Math.random() * 50) + 10, // Simulated since quota isn't fully implemented
              lastSeen: 'Actif',
              color: user.role === 'admin' ? '#4f46e5' : '#10b981'
            };
          });
        },
        error: (err) => console.error('Erreur chargement utilisateurs', err)
      });
  }
}
