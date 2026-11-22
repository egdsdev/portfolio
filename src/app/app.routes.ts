import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // página inicial: o conteúdo é desenhado pelo App; a rota existe para a pré-renderização
  { path: '', pathMatch: 'full', children: [] },
  // versão em inglês: mesmo conteúdo, textos pela LanguageService
  { path: 'en', children: [] },
  {
    path: 'admin/login',
    loadComponent: () => import('./features/admin/admin-login/admin-login.component').then(m => m.AdminLoginComponent),
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadComponent: () => import('./features/admin/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
  },
  // URL desconhecida: volta para o portfólio em vez de tela em branco
  { path: '**', redirectTo: '' },
];
