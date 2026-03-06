import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FirebaseService, AiMatchRecord } from '../../../core/services/firebase.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [DatePipe],
  template: `
    <div class="admin-page min-h-screen pt-20">
      <!-- Sub-header -->
      <div class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <h1 class="text-lg font-bold">📊 Dashboard Admin</h1>
        <div class="flex items-center gap-3">
          <a href="/" class="text-xs text-gray-500 hover:text-gray-300 transition-colors">← Voltar ao site</a>
          <button (click)="logout()"
                  class="text-xs px-3 py-1.5 rounded-lg border border-gray-700 text-gray-500 hover:text-red-400 hover:border-red-500/40 transition-all">
            Sair
          </button>
        </div>
      </div>

      <main class="max-w-6xl mx-auto p-6 space-y-8">

        <!-- Stats -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <p class="text-xs text-gray-500 uppercase tracking-wider mb-1">Total de Análises</p>
            <p class="text-3xl font-bold text-white">{{ matches.length }}</p>
          </div>
          <div class="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <p class="text-xs text-gray-500 uppercase tracking-wider mb-1">Match Médio</p>
            <p class="text-3xl font-bold" [class.text-green-400]="avgMatch >= 70" [class.text-yellow-400]="avgMatch >= 50 && avgMatch < 70" [class.text-red-400]="avgMatch < 50">
              {{ avgMatch }}%
            </p>
          </div>
          <div class="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <p class="text-xs text-gray-500 uppercase tracking-wider mb-1">Último Resultado</p>
            <p class="text-sm text-gray-400">{{ matches.length > 0 ? (matches[0].createdAt | date:'dd/MM/yyyy HH:mm') : '—' }}</p>
          </div>
        </div>

        <!-- Tabela -->
        <div class="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div class="px-5 py-4 border-b border-gray-800">
            <h2 class="text-sm font-semibold text-white">🤖 Análises de IA</h2>
          </div>

          @if (loading) {
            <div class="p-8 text-center">
              <p class="text-gray-500 text-sm animate-pulse">Carregando...</p>
            </div>
          }

          @if (!loading && matches.length === 0) {
            <div class="p-8 text-center">
              <p class="text-gray-600 text-sm">Nenhuma análise registrada ainda.</p>
            </div>
          }

          @if (!loading && matches.length > 0) {
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="text-xs text-gray-500 uppercase tracking-wider border-b border-gray-800">
                    <th class="text-left px-5 py-3">Data</th>
                    <th class="text-left px-5 py-3">Match</th>
                    <th class="text-left px-5 py-3">Descrição da Vaga</th>
                    <th class="text-left px-5 py-3">Resposta da IA</th>
                  </tr>
                </thead>
                <tbody>
                  @for (m of matches; track m.id) {
                    <tr class="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                      <td class="px-5 py-3 text-xs text-gray-400 whitespace-nowrap">{{ m.createdAt | date:'dd/MM/yyyy HH:mm' }}</td>
                      <td class="px-5 py-3">
                        <span class="text-xs font-bold px-2 py-1 rounded-full"
                              [class.bg-green-500/15]="m.matchPercentage >= 70"
                              [class.text-green-400]="m.matchPercentage >= 70"
                              [class.bg-yellow-500/15]="m.matchPercentage >= 50 && m.matchPercentage < 70"
                              [class.text-yellow-400]="m.matchPercentage >= 50 && m.matchPercentage < 70"
                              [class.bg-red-500/15]="m.matchPercentage < 50"
                              [class.text-red-400]="m.matchPercentage < 50">
                          {{ m.matchPercentage }}%
                        </span>
                      </td>
                      <td class="px-5 py-3 text-xs text-gray-400 max-w-xs">
                        <div class="line-clamp-3 cursor-pointer" [title]="m.jobDescription">{{ m.jobDescription }}</div>
                      </td>
                      <td class="px-5 py-3 text-xs text-gray-400 max-w-xs">
                        <div class="line-clamp-3 cursor-pointer" [title]="m.aiResponse">{{ m.aiResponse }}</div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      </main>
    </div>
  `,
  styles: [`
    .line-clamp-3 {
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `],
})
export class AdminDashboardComponent implements OnInit {
  private firebase = inject(FirebaseService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  matches: AiMatchRecord[] = [];
  loading = true;
  avgMatch = 0;

  async ngOnInit(): Promise<void> {
    try {
      this.matches = await this.firebase.getAiMatches();
      this.avgMatch = this.matches.length > 0
        ? Math.round(this.matches.reduce((s, m) => s + m.matchPercentage, 0) / this.matches.length)
        : 0;
    } catch {
      this.matches = [];
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  async logout(): Promise<void> {
    await this.firebase.logout();
    this.router.navigate(['/admin/login']);
  }
}
