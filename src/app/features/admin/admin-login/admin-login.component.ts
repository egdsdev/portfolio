import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FirebaseService } from '../../../core/services/firebase.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="admin-page min-h-screen flex items-center justify-center px-6 py-20">
      <div class="w-full max-w-sm">
        <div class="mb-8">
          <div class="eyebrow mb-3">Área restrita</div>
          <h1 class="display text-3xl text-zinc-50 mb-2" style="font-weight: 600;">Dashboard</h1>
          <p class="text-sm text-zinc-500">Entre para ver as métricas do portfólio.</p>
        </div>

        @if (error) {
          <div class="border border-red-500/30 bg-red-500/5 text-red-400 text-sm rounded-lg px-4 py-3 mb-5">
            {{ error }}
          </div>
        }

        <form class="space-y-4" (ngSubmit)="login()">
          <div>
            <label for="email" class="eyebrow block mb-2">Email</label>
            <input id="email" type="email" name="email" autocomplete="email"
                   [(ngModel)]="email"
                   class="w-full admin-input border rounded-lg px-4 py-3 text-sm transition-colors">
          </div>
          <div>
            <label for="password" class="eyebrow block mb-2">Senha</label>
            <input id="password" type="password" name="password" autocomplete="current-password"
                   [(ngModel)]="password"
                   class="w-full admin-input border rounded-lg px-4 py-3 text-sm transition-colors">
          </div>
          <button type="submit"
                  [disabled]="loading || !email || !password"
                  class="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed">
            {{ loading ? 'Entrando...' : 'Entrar' }}
          </button>
        </form>

        <a href="/" class="inline-flex items-center gap-1.5 mt-8 text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
          </svg>
          Voltar ao portfólio
        </a>
      </div>
    </div>
  `,
})
export class AdminLoginComponent {
  private firebase = inject(FirebaseService);
  private router = inject(Router);

  email = '';
  password = '';
  error = '';
  loading = false;

  async login(): Promise<void> {
    if (!this.email || !this.password) return;
    this.loading = true;
    this.error = '';
    try {
      await this.firebase.login(this.email, this.password);
      this.router.navigate(['/admin']);
    } catch {
      this.error = 'Email ou senha inválidos.';
    } finally {
      this.loading = false;
    }
  }
}
