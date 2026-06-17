import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  toasts$ = this.toastsSubject.asObservable();

  showSuccess(title: string, message: string) {
    this.addToast('success', title, message);
  }

  showError(title: string, message: string) {
    this.addToast('error', title, message);
  }

  showInfo(title: string, message: string) {
    this.addToast('info', title, message);
  }

  removeToast(id: string) {
    const currentToasts = this.toastsSubject.getValue();
    this.toastsSubject.next(currentToasts.filter(t => t.id !== id));
  }

  private addToast(type: 'success' | 'error' | 'info', title: string, message: string) {
    const id = Math.random().toString(36).substr(2, 9);
    const toast: Toast = { id, type, title, message };
    const currentToasts = this.toastsSubject.getValue();
    
    // Max 3 toasts
    if (currentToasts.length >= 3) {
      currentToasts.shift();
    }
    
    this.toastsSubject.next([...currentToasts, toast]);

    // Auto remove after 5 seconds
    setTimeout(() => {
      this.removeToast(id);
    }, 5000);
  }
}
