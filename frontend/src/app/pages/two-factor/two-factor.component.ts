import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-two-factor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="auth-wrapper">
      <div class="mesh-bg">
        <div class="mesh-ball ball-1"></div>
        <div class="mesh-ball ball-2"></div>
      </div>

      <div class="auth-container glass-card fade-in">
        <div class="two-factor-card">
          <div class="card-header">
            <div class="shield-icon">🛡️</div>
            <h2>Vérification de sécurité</h2>
            <p>Entrez le code de vérification à 6 chiffres généré par votre application mobile.</p>
          </div>

          <form (ngSubmit)="verifyCode()" class="code-form">
            <div class="code-inputs">
              <input type="text" maxlength="6" [(ngModel)]="code" name="code" placeholder="000 000" class="premium-input">
            </div>
            
            <button type="submit" class="btn-primary w-full">
              Vérifier le code
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </button>
          </form>

          <div class="footer">
            <p>Un problème ? <button (click)="goBack()">Retour à la connexion</button></p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-wrapper {
      min-height: 100vh;
      display: flex; align-items: center; justify-content: center;
      position: relative; overflow: hidden; background: #fdfdff;
    }
    .mesh-bg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 0; filter: blur(100px); }
    .mesh-ball { position: absolute; border-radius: 50%; opacity: 0.2; animation: meshMove 15s infinite alternate ease-in-out; }
    .ball-1 { width: 500px; height: 500px; background: #c7d2fe; top: -100px; right: -100px; }
    .ball-2 { width: 400px; height: 400px; background: #bae6fd; bottom: -100px; left: -100px; }

    @keyframes meshMove {
      0% { transform: translate(0, 0); }
      100% { transform: translate(30px, 30px); }
    }

    .auth-container {
      width: 90%; max-width: 480px; padding: 3.5rem; z-index: 1;
      background: rgba(255, 255, 255, 0.8);
      border: 1px solid white;
    }

    .two-factor-card {
      text-align: center;
      .shield-icon { font-size: 3rem; margin-bottom: 1.5rem; }
      h2 { font-size: 1.8rem; font-weight: 800; color: #0f172a; margin-bottom: 0.75rem; }
      p { color: #64748b; font-size: 0.95rem; line-height: 1.6; margin-bottom: 2.5rem; }
    }

    .code-form {
      .code-inputs {
        margin-bottom: 2rem;
        .premium-input {
          width: 100%; padding: 1.25rem; font-size: 2.2rem; letter-spacing: 0.6rem;
          text-align: center; font-weight: 800; color: var(--primary);
          background: #f8fafc; border: 1.5px solid rgba(0,0,0,0.03); border-radius: 16px;
          outline: none; transition: all 0.2s;
          &:focus { border-color: var(--primary); background: white; box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.08); }
          &::placeholder { color: #e2e8f0; letter-spacing: 0.1rem; }
        }
      }
      .w-full { width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.75rem; font-size: 1.1rem; height: 56px; border-radius: 14px; }
    }

    .footer {
      margin-top: 2rem;
      p { color: #94a3b8; font-size: 0.9rem; font-weight: 500; }
      button { background: none; border: none; color: var(--primary); font-weight: 700; cursor: pointer; &:hover { text-decoration: underline; } }
    }
  `]
})
export class TwoFactorComponent implements OnInit {
  code = '';
  constructor(private router: Router) {}
  ngOnInit() {
    const session = localStorage.getItem('user_session');
    if (!session) this.router.navigate(['/login']);
  }
  verifyCode() {
    if (this.code.length === 6) { window.location.href = '/dashboard'; }
    else { alert('Veuillez entrer un code valide à 6 chiffres.'); }
  }
  goBack() { this.router.navigate(['/login']); }
}
