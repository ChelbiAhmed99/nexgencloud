import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div *ngFor="let toast of toasts" class="toast fade-in" [ngClass]="toast.type">
        <div class="toast-icon">
          <span *ngIf="toast.type === 'success'">✅</span>
          <span *ngIf="toast.type === 'error'">🚨</span>
          <span *ngIf="toast.type === 'info'">ℹ️</span>
        </div>
        <div class="toast-content">
          <h4>{{ toast.title }}</h4>
          <p>{{ toast.message }}</p>
        </div>
        <button class="toast-close" (click)="remove(toast.id)">×</button>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .toast {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      background: var(--bg-card);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 1);
      border-radius: 16px;
      padding: 1rem 1.25rem;
      box-shadow: var(--shadow-premium);
      min-width: 300px;
      max-width: 400px;
      position: relative;
      overflow: hidden;
    }
    .toast::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
    }
    .toast.success::before { background: #10b981; }
    .toast.error::before { background: #ef4444; }
    .toast.info::before { background: #3b82f6; }
    
    .toast-icon {
      font-size: 1.5rem;
      margin-top: 2px;
    }
    .toast-content {
      flex: 1;
    }
    .toast-content h4 {
      margin: 0 0 0.25rem 0;
      font-size: 0.95rem;
      font-weight: 700;
      color: #0f172a;
    }
    .toast-content p {
      margin: 0;
      font-size: 0.85rem;
      color: #64748b;
      line-height: 1.4;
    }
    .toast-close {
      background: none;
      border: none;
      font-size: 1.25rem;
      color: #94a3b8;
      cursor: pointer;
      padding: 0;
      line-height: 1;
      margin-top: -2px;
      transition: color 0.2s;
    }
    .toast-close:hover {
      color: #0f172a;
    }
    .fade-in {
      animation: slideInRight 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    }
    @keyframes slideInRight {
      from { opacity: 0; transform: translateX(50px); }
      to { opacity: 1; transform: translateX(0); }
    }
  `]
})
export class ToastComponent implements OnInit {
  toasts: Toast[] = [];

  constructor(private toastService: ToastService) {}

  ngOnInit() {
    this.toastService.toasts$.subscribe(toasts => {
      this.toasts = toasts;
    });
  }

  remove(id: string) {
    this.toastService.removeToast(id);
  }
}
