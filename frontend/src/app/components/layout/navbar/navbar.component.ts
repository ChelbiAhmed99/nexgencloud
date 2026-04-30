import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="navbar fade-in">
      <div class="search-bar">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <input type="text" placeholder="Rechercher une application, un domaine...">
        <div class="shortcut">⌘K</div>
      </div>

      <div class="nav-actions">
        <div class="system-status">
          <div class="status-indicator"></div>
          <span>Système: <strong class="online">Opérationnel</strong></span>
        </div>

        <button class="icon-btn glass-card">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
          <span class="notification-dot"></span>
        </button>

        <div class="user-profile" (click)="logout()">
          <div class="profile-info">
            <span class="user-name">{{ userName }}</span>
            <span class="user-role">{{ userRole === 'admin' ? 'Administrateur' : 'Développeur' }}</span>
          </div>
          <div class="avatar" [style.background-image]="'url(https://ui-avatars.com/api/?name=' + userName + '&background=4f46e5&color=fff)'"></div>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .navbar {
      height: 80px;
      padding: 0 2.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    }
    .search-bar {
      width: 450px;
      height: 48px;
      display: flex;
      align-items: center;
      padding: 0 1.25rem;
      gap: 1rem;
      border-radius: 14px;
      background: #f8fafc;
      border: 1px solid rgba(0, 0, 0, 0.03);
      .search-icon { width: 18px; height: 18px; color: #94a3b8; }
      input { flex: 1; background: none; border: none; outline: none; font-size: 0.95rem; font-weight: 500; color: #1e293b; &::placeholder { color: #94a3b8; } }
      .shortcut { font-size: 0.7rem; font-weight: 800; color: #cbd5e1; background: white; padding: 0.25rem 0.5rem; border-radius: 6px; border: 1px solid #f1f5f9; }
    }
    .nav-actions { display: flex; align-items: center; gap: 2rem; }
    .system-status {
      display: flex; align-items: center; gap: 0.75rem; font-size: 0.85rem; color: #64748b; font-weight: 600;
      .status-indicator { width: 8px; height: 8px; background: #10b981; border-radius: 50%; box-shadow: 0 0 8px rgba(16, 185, 129, 0.4); }
      .online { color: #059669; }
    }
    .icon-btn {
      width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; position: relative;
      background: white; border: 1px solid rgba(0,0,0,0.03); border-radius: 12px; cursor: pointer; color: #64748b;
      .notification-dot { position: absolute; top: 10px; right: 10px; width: 8px; height: 8px; background: #ef4444; border-radius: 50%; border: 2px solid white; }
      &:hover { color: var(--primary); background: #f8fafc; }
    }
    .user-profile {
      display: flex; align-items: center; gap: 1rem; padding: 0.5rem; border-radius: 16px; transition: background 0.2s; cursor: pointer;
      &:hover { background: #f8fafc; }
      .profile-info {
        display: flex; flex-direction: column; text-align: right;
        .user-name { font-size: 0.95rem; font-weight: 700; color: #1e293b; }
        .user-role { font-size: 0.75rem; font-weight: 600; color: #94a3b8; }
      }
      .avatar { width: 44px; height: 44px; border-radius: 14px; background-size: cover; background-position: center; border: 2px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
    }
  `]
})
export class NavbarComponent implements OnInit {
  userName = 'Utilisateur';
  userRole = 'user';

  constructor(private router: Router) {}

  ngOnInit() {
    const s = localStorage.getItem('user_session');
    if (s) try {
      const u = JSON.parse(s);
      this.userName = u.firstName || 'Utilisateur';
      this.userRole = u.role || 'user';
    } catch (e) {}
  }

  logout() {
    localStorage.removeItem('user_session');
    this.router.navigate(['/login']);
  }
}
