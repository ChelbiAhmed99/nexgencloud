import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="auth-wrapper">
      <!-- Soft Mesh Background (Light Mode) -->
      <div class="mesh-bg">
        <div class="mesh-ball ball-1"></div>
        <div class="mesh-ball ball-2"></div>
        <div class="mesh-ball ball-3"></div>
      </div>

      <div class="auth-container fade-in" [class.register-mode]="!isLoginMode">
        <!-- Left: Branding & Value Proposition -->
        <div class="brand-panel">
          <div class="brand-content">
            <div class="logo-wrapper">
              <div class="logo-icon">N</div>
              <span class="logo-text">NexGen<span class="highlight">Cloud</span></span>
            </div>
            
            <div class="hero-text">
              <h1>L'excellence de l'hébergement <span class="text-gradient">Cloud</span>.</h1>
              <p>Déployez vos applications métiers sur une infrastructure sécurisée et isolée en quelques secondes.</p>
            </div>

            <div class="feature-list">
              <div class="feature-item">
                <div class="f-icon">🛡️</div>
                <div class="f-text">
                  <strong>Sécurité Avancée</strong>
                  <span>Isolation totale et chiffrement des données.</span>
                </div>
              </div>
              <div class="feature-item">
                <div class="f-icon">⚡</div>
                <div class="f-text">
                  <strong>Performance Stable</strong>
                  <span>Stockage haute vitesse et réseau optimisé.</span>
                </div>
              </div>
            </div>

            <div class="trust-badge">
              <div class="avatars">
                <div class="avatar-mini" style="background-image: url('https://i.pravatar.cc/150?u=1')"></div>
                <div class="avatar-mini" style="background-image: url('https://i.pravatar.cc/150?u=2')"></div>
                <div class="avatar-mini" style="background-image: url('https://i.pravatar.cc/150?u=3')"></div>
                <div class="avatar-count">+2k</div>
              </div>
              <span>développeurs nous font confiance</span>
            </div>
          </div>
        </div>

        <!-- Right: Auth Form -->
        <div class="form-panel">
          <div class="login-card glass-card">
            <div class="card-header">
              <h2>{{ isLoginMode ? 'Bon retour parmi nous' : 'Créer votre espace' }}</h2>
              <p>{{ isLoginMode ? 'Connectez-vous pour gérer vos serveurs.' : 'Inscrivez-vous pour commencer à déployer.' }}</p>
            </div>

            <div class="social-login">
              <button class="social-btn glass-card" (click)="loginWithOAuth('google')">
                <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Google
              </button>
              <button class="social-btn glass-card" (click)="loginWithOAuth('github')">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.34-3.369-1.34-.454-1.152-1.11-1.458-1.11-1.458-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>
                GitHub
              </button>
            </div>

            <div class="divider">
              <span>ou via email</span>
            </div>

            <div *ngIf="errorMessage" class="error-toast">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              {{ errorMessage }}
            </div>

            <form (ngSubmit)="onSubmit()" class="auth-form">
              <div class="input-grid" *ngIf="!isLoginMode">
                <div class="input-field">
                  <label>Prénom</label>
                  <input type="text" [(ngModel)]="formData.firstName" name="firstName" placeholder="Jean" class="form-control" [required]="!isLoginMode">
                </div>
                <div class="input-field">
                  <label>Nom</label>
                  <input type="text" [(ngModel)]="formData.lastName" name="lastName" placeholder="Dupont" class="form-control" [required]="!isLoginMode">
                </div>
              </div>

              <div class="input-field">
                <label>Email professionnel</label>
                <div class="input-wrapper">
                  <svg class="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                  <input type="email" [(ngModel)]="formData.email" name="email" placeholder="nom@entreprise.com" required class="form-control icon-padding">
                </div>
              </div>

              <div class="input-field">
                <div class="label-row">
                  <label>Mot de passe</label>
                  <a href="javascript:void(0)" class="forgot-link" *ngIf="isLoginMode">Oublié ?</a>
                </div>
                <div class="input-wrapper">
                  <svg class="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  <input type="password" [(ngModel)]="formData.password" name="password" placeholder="••••••••" required class="form-control icon-padding">
                </div>
              </div>

              <button type="submit" class="btn-primary main-submit" [disabled]="isLoading">
                <span *ngIf="!isLoading">
                  {{ isLoginMode ? 'Accéder à la console' : 'Créer mon compte' }}
                </span>
                <div *ngIf="isLoading" class="loader-mini"></div>
                <svg *ngIf="!isLoading" class="arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </button>
            </form>

            <div class="card-footer">
              <p>{{ isLoginMode ? "Pas encore de compte ?" : "Déjà membre ?" }} 
                <button type="button" class="toggle-btn" (click)="toggleMode()">
                  {{ isLoginMode ? "S'inscrire" : "Se connecter" }}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-wrapper {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
      background: #fdfdff;
      font-family: 'Inter', sans-serif;
    }

    .mesh-bg {
      position: absolute;
      top: 0; left: 0; width: 100%; height: 100%;
      z-index: 0; filter: blur(120px);
    }
    .mesh-ball { position: absolute; border-radius: 50%; opacity: 0.35; animation: meshMove 15s infinite alternate ease-in-out; }
    .ball-1 { width: 600px; height: 600px; background: #c7d2fe; top: -100px; left: -100px; }
    .ball-2 { width: 500px; height: 500px; background: #bae6fd; bottom: -100px; right: -100px; animation-delay: -4s; }
    .ball-3 { width: 400px; height: 400px; background: #ddd6fe; top: 30%; left: 40%; animation-delay: -8s; }

    @keyframes meshMove {
      0% { transform: translate(0, 0) scale(1); }
      100% { transform: translate(50px, 50px) scale(1.1); }
    }

    .auth-container {
      width: 95%;
      max-width: 1100px;
      height: 700px;
      display: flex;
      background: rgba(255, 255, 255, 0.75);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border-radius: 36px;
      border: 1px solid rgba(255, 255, 255, 1);
      box-shadow: 0 40px 80px -20px rgba(79, 70, 229, 0.15), inset 0 0 0 1px rgba(255,255,255,0.5);
      z-index: 1;
      overflow: hidden;
      transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
      @media (max-width: 900px) { flex-direction: column; height: auto; margin: 2rem 0; }
    }

    .auth-container.register-mode {
      height: 800px;
      max-width: 1150px;
    }

    .brand-panel {
      flex: 1;
      padding: 4rem;
      display: flex;
      align-items: center;
      background: rgba(255, 255, 255, 0.4);
      border-right: 1px solid rgba(0, 0, 0, 0.03);
      transition: all 0.6s ease;
      @media (max-width: 900px) { padding: 3rem; }
    }

    .register-mode .brand-panel {
      background: rgba(79, 70, 229, 0.03);
    }
    .logo-wrapper {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 3.5rem;
      .logo-icon {
        width: 44px; height: 44px; background: var(--gradient-primary); border-radius: 12px;
        display: flex; align-items: center; justify-content: center; color: white;
        font-weight: 800; font-size: 1.4rem; box-shadow: 0 8px 16px rgba(79, 70, 229, 0.2);
      }
      .logo-text { font-family: 'Outfit', sans-serif; font-size: 1.75rem; font-weight: 700; color: #0f172a; }
      .highlight { color: var(--primary); }
    }
    .hero-text {
      margin-bottom: 3rem;
      h1 { font-size: 2.8rem; font-weight: 800; line-height: 1.2; margin-bottom: 1.5rem; color: #0f172a; }
      p { font-size: 1.1rem; color: #64748b; line-height: 1.6; }
    }
    .feature-list {
      display: flex; flex-direction: column; gap: 1.5rem; margin-bottom: 3.5rem;
      .feature-item {
        display: flex; gap: 1.25rem; align-items: center;
        .f-icon { width: 44px; height: 44px; background: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; box-shadow: 0 4px 10px rgba(0,0,0,0.03); }
        .f-text {
          display: flex; flex-direction: column;
          strong { color: #1e293b; font-size: 0.95rem; }
          span { color: #94a3b8; font-size: 0.85rem; }
        }
      }
    }
    .trust-badge {
      display: flex; align-items: center; gap: 1rem; color: #64748b; font-size: 0.9rem; font-weight: 500;
      .avatars {
        display: flex;
        .avatar-mini { width: 32px; height: 32px; border-radius: 50%; border: 2px solid white; margin-left: -8px; background-size: cover; &:first-child { margin-left: 0; } }
        .avatar-count { width: 32px; height: 32px; border-radius: 50%; background: #e0e7ff; color: #4338ca; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; border: 2px solid white; margin-left: -8px; }
      }
    }

    .form-panel { flex: 1; padding: 4rem; display: flex; align-items: center; justify-content: center; @media (max-width: 900px) { padding: 3rem; } }
    .login-card {
      width: 100%; max-width: 420px; padding: 2.5rem;
      .card-header { text-align: center; margin-bottom: 2rem; h2 { font-size: 1.8rem; font-weight: 800; color: #0f172a; margin-bottom: 0.75rem; } p { color: #64748b; font-size: 0.95rem; } }
    }

    .social-login {
      display: flex; gap: 1rem; margin-bottom: 2rem;
      .social-btn {
        flex: 1; height: 52px; display: flex; align-items: center; justify-content: center; gap: 0.75rem;
        color: #1e293b; font-weight: 700; font-size: 0.9rem; cursor: pointer; border: 1px solid rgba(0,0,0,0.05);
        background: rgba(255, 255, 255, 0.6); backdrop-filter: blur(10px); transition: all 0.3s ease;
        &:hover { background: white; transform: translateY(-3px) scale(1.02); box-shadow: 0 12px 24px rgba(79, 70, 229, 0.1); border-color: rgba(79, 70, 229, 0.2); }
      }
    }

    .divider {
      position: relative; text-align: center; margin-bottom: 2rem;
      &::before { content: ""; position: absolute; top: 50%; left: 0; width: 100%; height: 1px; background: rgba(0,0,0,0.05); }
      span { position: relative; background: #fff; padding: 0 1rem; color: #cbd5e1; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; }
    }

    .error-toast {
      background: #fef2f2; color: #dc2626; padding: 1rem; border-radius: 12px; margin-bottom: 1.5rem;
      display: flex; align-items: center; gap: 0.75rem; font-size: 0.9rem; font-weight: 600; border: 1px solid #fee2e2;
      animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
    }

    @keyframes shake {
      10%, 90% { transform: translate3d(-1px, 0, 0); }
      20%, 80% { transform: translate3d(2px, 0, 0); }
      30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
      40%, 60% { transform: translate3d(4px, 0, 0); }
    }

    .auth-form {
      .input-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
      .input-field {
        margin-bottom: 1.5rem;
        label { display: block; font-size: 0.85rem; font-weight: 700; color: #475569; margin-bottom: 0.5rem; }
        .label-row { display: flex; justify-content: space-between; .forgot-link { font-size: 0.8rem; color: var(--primary); font-weight: 700; text-decoration: none; } }
        .input-wrapper { position: relative; .field-icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); width: 18px; height: 18px; color: #94a3b8; } }
        .form-control {
          width: 100%; padding: 0.85rem 1rem; background: #f8fafc; border: 1.5px solid rgba(0,0,0,0.03); border-radius: 12px;
          font-size: 0.95rem; font-weight: 500; transition: all 0.2s;
          &:focus { outline: none; border-color: var(--primary); background: white; box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.08); }
          &.icon-padding { padding-left: 3rem; }
        }
      }
    }

    .main-submit { 
      width: 100%; height: 56px; display: flex; align-items: center; justify-content: center; gap: 1rem; 
      font-size: 1.05rem; border-radius: 14px; margin-top: 1rem; background: var(--gradient-primary); 
      background-size: 200% auto; transition: 0.5s; .arrow { transition: transform 0.3s; } 
      &:hover:not(:disabled) { background-position: right center; box-shadow: 0 12px 24px rgba(79, 70, 229, 0.4); transform: translateY(-2px); } 
      &:hover:not(:disabled) .arrow { transform: translateX(5px); }
      &:disabled { opacity: 0.7; cursor: not-allowed; }
    }

    .loader-mini {
      width: 20px; height: 20px; border: 2.5px solid rgba(255,255,255,0.3); border-top-color: white;
      border-radius: 50%; animation: spin 0.8s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    .card-footer { margin-top: 2rem; text-align: center; p { color: #64748b; font-size: 0.95rem; } .toggle-btn { background: none; border: none; color: var(--primary); font-weight: 700; cursor: pointer; margin-left: 0.25rem; &:hover { text-decoration: underline; } } }
  `]
})
export class LoginComponent implements OnInit {
  isLoginMode = true;
  isLoading = false;
  errorMessage = '';
  formData = { email: '', password: '', firstName: '', lastName: '' };

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['error']) {
        if (params['error'] === 'auth_failed') {
          this.errorMessage = "L'authentification Google a échoué. Veuillez réessayer.";
        } else if (params['error'] === 'server_error') {
          this.errorMessage = "Une erreur serveur est survenue lors de la connexion Google.";
        }
      }
    });
  }

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    this.errorMessage = '';
  }

  loginWithOAuth(p: string) {
    window.location.href = `http://localhost:3000/api/auth/${p}`;
  }

  onSubmit() {
    this.isLoading = true;
    this.errorMessage = '';

    const obs = this.isLoginMode
      ? this.authService.login({ email: this.formData.email, password: this.formData.password })
      : this.authService.signup(this.formData);

    obs.subscribe({
      next: (res) => {
        this.isLoading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Une erreur est survenue';
      }
    });
  }
}
