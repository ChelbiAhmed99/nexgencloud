import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { ToastComponent } from '../../toast/toast.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, NavbarComponent, ToastComponent],
  template: `
    <div class="app-container" [class.collapsed]="isCollapsed">
      <app-sidebar [isCollapsed]="isCollapsed" (toggle)="toggleSidebar()"></app-sidebar>
      <div class="main-content">
        <app-navbar></app-navbar>
        <main class="page-content">
          <router-outlet></router-outlet>
        </main>
      </div>
      <app-toast-container></app-toast-container>
    </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      height: 100vh;
      width: 100vw;
      overflow: hidden;
      background: #fdfdff;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .page-content {
      flex: 1;
      overflow-y: auto;
      padding: 1rem 2.5rem 2.5rem 2.5rem;
      scrollbar-width: thin;
      scrollbar-color: var(--primary) transparent;
      &::-webkit-scrollbar { width: 6px; }
      &::-webkit-scrollbar-thumb { background: var(--primary); border-radius: 10px; }
    }
  `]
})
export class MainLayoutComponent {
  isCollapsed = false;
  toggleSidebar() { this.isCollapsed = !this.isCollapsed; }
}
