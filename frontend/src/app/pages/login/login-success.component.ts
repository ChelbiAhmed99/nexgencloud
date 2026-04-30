import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login-success',
  standalone: true,
  template: `
    <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: sans-serif; color: #1e293b;">
      <div style="text-align: center;">
        <div style="width: 50px; height: 50px; border: 4px solid #f3f3f3; border-top: 4px solid #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1.5rem;"></div>
        <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
        <h2>Connexion réussie</h2>
        <p>Finalisation de votre session, veuillez patienter...</p>
      </div>
    </div>
  `
})
export class LoginSuccessComponent implements OnInit {
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
          
          const user = {
            id: decodedPayload.sub,
            email: decodedPayload.email,
            firstName: decodedPayload.firstName || 'Utilisateur',
            lastName: decodedPayload.lastName || '',
            role: decodedPayload.role || 'user',
            isTwoFactorEnabled: !!decodedPayload.isTwoFactorEnabled
          };
          
          this.authService.setTokenAndUser(token, user);
          
          setTimeout(() => this.router.navigate(['/dashboard']), 1000);
        } catch (e) {
          console.error('Erreur lors du décodage du token', e);
          this.router.navigate(['/login']);
        }
      } else {
        this.router.navigate(['/login']);
      }
    });
  }
}
