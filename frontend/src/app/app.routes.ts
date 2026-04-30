import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { LoginComponent } from './pages/login/login.component';
import { TwoFactorComponent } from './pages/two-factor/two-factor.component';
import { ApplicationsComponent } from './pages/applications/applications.component';
import { DeployComponent } from './pages/deploy/deploy.component';
import { MainLayoutComponent } from './components/layout/main-layout/main-layout.component';
import { InfrastructureComponent } from './pages/admin/infrastructure.component';
import { UsersComponent } from './pages/admin/users.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { LoginSuccessComponent } from './pages/login/login-success.component';
import { authGuard, adminGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'login/success', component: LoginSuccessComponent },
  { path: 'login/2fa', component: TwoFactorComponent },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'applications', component: ApplicationsComponent },
      { path: 'deploy', component: DeployComponent },
      { path: 'settings', component: SettingsComponent },
      { 
        path: 'admin/infrastructure', 
        component: InfrastructureComponent,
        canActivate: [adminGuard]
      },
      { 
        path: 'admin/users', 
        component: UsersComponent,
        canActivate: [adminGuard]
      }
    ]
  }
];
