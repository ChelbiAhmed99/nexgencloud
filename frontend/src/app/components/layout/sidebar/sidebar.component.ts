import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar fade-in" [class.collapsed]="isCollapsed">
      <div class="sidebar-header">
        <div class="logo">
          <div class="logo-icon">H</div>
          <span class="logo-text" *ngIf="!isCollapsed">Hosting<span class="text-gradient">Safe</span></span>
        </div>
        <button class="toggle-btn" (click)="toggle.emit()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M15 18l-6-6 6-6" *ngIf="!isCollapsed"></path>
            <path d="M9 18l6-6-6-6" *ngIf="isCollapsed"></path>
          </svg>
        </button>
      </div>

      <nav class="nav-links">
        <a routerLink="/dashboard" routerLinkActive="active" class="nav-item" title="Tableau de bord">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          <span class="nav-text" *ngIf="!isCollapsed">Tableau de bord</span>
        </a>
        
        <ng-container *ngIf="userRole === 'user'">
          <a routerLink="/applications" routerLinkActive="active" class="nav-item" title="Mes Applications">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            <span class="nav-text" *ngIf="!isCollapsed">Mes Applications</span>
          </a>
          <a routerLink="/deploy" routerLinkActive="active" class="nav-item" title="Déployer">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
            <span class="nav-text" *ngIf="!isCollapsed">Déployer</span>
          </a>
          <a routerLink="/dns" routerLinkActive="active" class="nav-item" title="Gestion DNS">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
            <span class="nav-text" *ngIf="!isCollapsed">Gestion DNS</span>
          </a>
        </ng-container>

        <ng-container *ngIf="userRole === 'admin'">
          <a routerLink="/admin/users" routerLinkActive="active" class="nav-item" title="Utilisateurs">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            <span class="nav-text" *ngIf="!isCollapsed">Utilisateurs</span>
          </a>
          <a routerLink="/admin/infrastructure" routerLinkActive="active" class="nav-item" title="Infrastructure">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></svg>
            <span class="nav-text" *ngIf="!isCollapsed">Infrastructure</span>
          </a>
        </ng-container>

        <a routerLink="/settings" routerLinkActive="active" class="nav-item" title="Paramètres">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
          <span class="nav-text" *ngIf="!isCollapsed">Paramètres</span>
        </a>
      </nav>

      <div class="sidebar-footer" *ngIf="!isCollapsed">
        <div class="user-quota glass-card" *ngIf="userRole === 'user'">
          <div class="label">Quota Conteneurs</div>
          <div class="progress-bar">
            <div class="progress" style="width: 60%"></div>
          </div>
          <div class="usage">3 / 5 Utilisés</div>
        </div>
        
        <div class="user-quota admin-badge glass-card" *ngIf="userRole === 'admin'">
          <div class="label">Super-Admin</div>
          <div class="usage">Accès root activé</div>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 280px; height: 100vh; background: #ffffff; display: flex; flex-direction: column; padding: 2rem 1.25rem;
      border-right: 1px solid rgba(0, 0, 0, 0.05); position: sticky; top: 0; z-index: 100;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      &.collapsed { width: 88px; padding: 2rem 1rem; .logo-text, .nav-text, .sidebar-footer { display: none; } .nav-item { justify-content: center; padding: 0.85rem; } .logo { padding: 0; justify-content: center; } .sidebar-header { flex-direction: column; gap: 1.5rem; } }
    }
    
    .sidebar-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 3.5rem; }

    .logo {
      display: flex; align-items: center; gap: 0.75rem;
      .logo-icon {
        width: 44px; height: 44px; background: var(--gradient-primary); border-radius: 14px;
        display: flex; align-items: center; justify-content: center; color: white;
        font-weight: 800; font-size: 1.4rem; box-shadow: 0 8px 16px rgba(79, 70, 229, 0.2);
      }
      .logo-text { font-family: 'Outfit', sans-serif; font-size: 1.4rem; font-weight: 700; color: #0f172a; white-space: nowrap; }
    }

    .toggle-btn {
      width: 32px; height: 32px; border-radius: 10px; border: 1px solid #f1f5f9; background: white;
      display: flex; align-items: center; justify-content: center; color: #94a3b8; cursor: pointer;
      transition: all 0.2s; &:hover { color: var(--primary); background: #f8fafc; border-color: #e2e8f0; }
    }

    .nav-links { flex: 1; display: flex; flex-direction: column; gap: 0.5rem; }
    .nav-item {
      display: flex; align-items: center; gap: 1rem; padding: 0.85rem 1.25rem; border-radius: 14px;
      color: var(--text-muted); font-weight: 600; text-decoration: none; transition: all 0.2s ease;
      .icon { width: 22px; height: 22px; flex-shrink: 0; }
      .nav-text { white-space: nowrap; font-size: 0.95rem; }
      &:hover { background: #f8fafc; color: var(--primary); }
      &.active { background: #f1f5f9; color: var(--primary); .icon { stroke-width: 2.5px; } }
    }

    .sidebar-footer { margin-top: auto; }
    .user-quota {
      padding: 1.25rem; border-radius: 18px; background: #f8fafc; border: 1px solid rgba(0,0,0,0.03);
      .label { font-size: 0.85rem; font-weight: 700; color: #475569; margin-bottom: 0.75rem; }
      .progress-bar { height: 8px; background: #e2e8f0; border-radius: 10px; margin-bottom: 0.5rem; overflow: hidden; .progress { height: 100%; background: var(--gradient-primary); border-radius: 10px; } }
      .usage { font-size: 0.75rem; text-align: right; color: #94a3b8; font-weight: 700; }
      &.admin-badge { background: rgba(79, 70, 229, 0.05); border-color: rgba(79, 70, 229, 0.1); .label { color: var(--primary); } .usage { color: var(--primary); text-align: left; } }
    }
  `]
})
export class SidebarComponent implements OnInit {
  @Input() isCollapsed = false;
  @Output() toggle = new EventEmitter<void>();
  userRole = 'user';

  ngOnInit() {
    const s = localStorage.getItem('user_session');
    if (s) try { this.userRole = JSON.parse(s).role || 'user'; } catch (e) {}
  }
}
