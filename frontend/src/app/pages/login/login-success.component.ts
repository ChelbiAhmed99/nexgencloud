import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login-success',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="success-wrapper">
      <div class="success-card">
        <div *ngIf="!hasError" class="success-content">
          <div class="success-icon">
            <div class="check-circle">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
          </div>
          <h2>Connexion réussie</h2>
          <p *ngIf="providerName">Authentifié via <strong>{{ providerName }}</strong></p>
          <p class="sub">Finalisation de votre session, veuillez patienter...</p>
          <div class="loader-bar"><div class="loader-fill"></div></div>
        </div>

        <div *ngIf="hasError" class="error-content">
          <div class="error-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
          </div>
          <h2>Erreur d'authentification</h2>
          <p>{{ errorMessage }}</p>
          <button class="btn-primary" (click)="goToLogin()">Retour à la connexion</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .success-wrapper {
      display: flex; justify-content: center; align-items: center; height: 100vh;
      font-family: 'Inter', sans-serif; background: #fdfdff;
      background-image:
        radial-gradient(at 0% 0%, rgba(79, 70, 229, 0.05) 0px, transparent 50%),
        radial-gradient(at 100% 100%, rgba(14, 165, 233, 0.05) 0px, transparent 50%);
    }

    .success-card {
      text-align: center; padding: 3rem;
      background: rgba(255,255,255,0.9); backdrop-filter: blur(16px);
      border-radius: 28px; border: 1px solid rgba(255,255,255,1);
      box-shadow: 0 20px 40px rgba(0,0,0,0.06); max-width: 420px; width: 90%;
    }

    .success-content h2, .error-content h2 {
      font-family: 'Outfit', sans-serif; font-size: 1.8rem; font-weight: 800; color: #0f172a; margin: 1.5rem 0 0.5rem;
    }

    .success-content p, .error-content p { color: #64748b; font-size: 0.95rem; margin-bottom: 0.25rem; }
    .success-content .sub { font-size: 0.85rem; color: #94a3b8; margin-top: 0.5rem; }
    .success-content strong { color: #4f46e5; }

    .check-circle {
      width: 72px; height: 72px; border-radius: 50%;
      background: linear-gradient(135deg, #4f46e5, #0ea5e9);
      display: flex; align-items: center; justify-content: center; margin: 0 auto;
      animation: scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    @keyframes scaleIn {
      from { transform: scale(0); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }

    .loader-bar {
      height: 4px; background: #e2e8f0; border-radius: 10px; margin-top: 2rem; overflow: hidden;
      .loader-fill {
        height: 100%; width: 0%; background: linear-gradient(135deg, #4f46e5, #0ea5e9);
        border-radius: 10px; animation: loadBar 1.5s ease forwards;
      }
    }

    @keyframes loadBar {
      0% { width: 0%; }
      100% { width: 100%; }
    }

    .error-icon { margin-bottom: 0.5rem; }
    .error-content .btn-primary {
      margin-top: 1.5rem; display: inline-flex; align-items: center; gap: 0.5rem;
      padding: 0.75rem 2rem; background: linear-gradient(135deg, #4f46e5, #7c3aed);
      color: white; border: none; border-radius: 12px; font-weight: 700; font-size: 0.95rem;
      cursor: pointer; transition: all 0.3s;
      &:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(79,70,229,0.35); }
    }
  `]
})
export class LoginSuccessComponent implements OnInit {
  hasError = false;
  errorMessage = '';
  providerName = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      if (token) {
        try {
          const payloadBase64 = token.split('.')[1];
          const decodedPayload = JSON.parse(atob(payloadBase64));

          // Extract provider name for display
          const provider = decodedPayload.provider || 'local';
          const providerLabels: Record<string, string> = {
            google: 'Google',
            github: 'GitHub',
            microsoft: 'Microsoft',
            local: ''
          };
          this.providerName = providerLabels[provider] || provider;

          const user = {
            id: decodedPayload.sub,
            email: decodedPayload.email,
            firstName: decodedPayload.firstName || 'Utilisateur',
            lastName: decodedPayload.lastName || '',
            role: decodedPayload.role || 'user',
            isTwoFactorEnabled: !!decodedPayload.isTwoFactorEnabled
          };

          this.authService.setTokenAndUser(token, user);

          setTimeout(() => this.router.navigate(['/dashboard']), 1500);
        } catch (e) {
          console.error('Erreur lors du décodage du token', e);
          this.hasError = true;
          this.errorMessage = "Le jeton d'authentification est invalide ou corrompu.";
        }
      } else {
        this.hasError = true;
        this.errorMessage = "Aucun jeton d'authentification reçu.";
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
