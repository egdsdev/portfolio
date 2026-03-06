import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FirebaseService } from '../../../core/services/firebase.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-950 p-4">
      <div class="w-full max-w-sm bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-xl">
        <h1 class="text-xl font-bold text-white text-center mb-6">🔐 Admin</h1>

        @if (error) {
          <div class="bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-lg p-3 mb-4 text-center">
            {{ error }}
          </div>
        }

        <div class="space-y-4">
          <input type="email"
                 [(ngModel)]="email"
                 placeholder="Email"
                 class="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-600 outline-none focus:border-cyan-500/60 transition-colors">
          <input type="password"
                 [(ngModel)]="password"
                 placeholder="Senha"
                 (keydown.enter)="login()"
                 class="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-600 outline-none focus:border-cyan-500/60 transition-colors">
          <button (click)="login()"
                  [disabled]="loading"
                  class="w-full py-3 rounded-xl text-white text-sm font-bold transition-all"
                  [class]="loading ? 'bg-gray-700 cursor-not-allowed' : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:scale-[1.02]'">
            {{ loading ? 'Entrando...' : 'Entrar' }}
          </button>
        </div>
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
