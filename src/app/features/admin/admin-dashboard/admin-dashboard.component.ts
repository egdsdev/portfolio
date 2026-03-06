import { Component, inject, OnInit, ChangeDetectorRef, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FirebaseService, AiMatchRecord, VisitorRecord } from '../../../core/services/firebase.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [DatePipe],
  template: `
    <div class="admin-page min-h-screen pt-20">
      <main class="max-w-6xl mx-auto px-4 pb-12 space-y-8">

        <!-- Título -->
        <div class="pt-6">
          <h1 class="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p class="text-xs text-gray-500 mt-1">{{ today | date:'dd/MM/yyyy' }}</p>
        </div>

        <!-- Seção IA -->
        <section>
          <p class="text-xs text-gray-500 uppercase tracking-widest mb-3 font-semibold">🤖 Análises de IA</p>
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div class="admin-card rounded-xl p-4 border">
              <p class="text-xs text-gray-500 mb-1">Total de Análises</p>
              <p class="text-3xl font-bold">{{ matches.length }}</p>
            </div>
            <div class="admin-card rounded-xl p-4 border">
              <p class="text-xs text-gray-500 mb-1">Match Médio</p>
              <p class="text-3xl font-bold" [class.text-green-400]="avgMatch >= 70" [class.text-yellow-400]="avgMatch >= 50 && avgMatch < 70" [class.text-red-400]="avgMatch < 50 && matches.length > 0">
                {{ matches.length > 0 ? avgMatch + '%' : '—' }}
              </p>
            </div>
            <div class="admin-card rounded-xl p-4 border">
              <p class="text-xs text-gray-500 mb-1">Melhor Match</p>
              <p class="text-3xl font-bold text-green-400">{{ bestMatch > 0 ? bestMatch + '%' : '—' }}</p>
            </div>
            <div class="admin-card rounded-xl p-4 border">
              <p class="text-xs text-gray-500 mb-1">Última Análise</p>
              <p class="text-sm font-medium mt-1">{{ matches.length > 0 ? (matches[0].createdAt | date:'dd/MM HH:mm') : '—' }}</p>
            </div>
          </div>
        </section>

        <!-- Seção Visitantes -->
        <section>
          <p class="text-xs text-gray-500 uppercase tracking-widest mb-3 font-semibold">👥 Visitantes</p>
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div class="admin-card rounded-xl p-4 border">
              <p class="text-xs text-gray-500 mb-1">Visitantes Únicos</p>
              <p class="text-3xl font-bold text-cyan-400">{{ visitors.length }}</p>
            </div>
            <div class="admin-card rounded-xl p-4 border">
              <p class="text-xs text-gray-500 mb-1">Total de Visitas</p>
              <p class="text-3xl font-bold">{{ totalVisits }}</p>
            </div>
            <div class="admin-card rounded-xl p-4 border">
              <p class="text-xs text-gray-500 mb-1">Países</p>
              <p class="text-3xl font-bold">{{ uniqueCountries }}</p>
            </div>
            <div class="admin-card rounded-xl p-4 border">
              <p class="text-xs text-gray-500 mb-1">Última Visita</p>
              <p class="text-sm font-medium mt-1">{{ visitors.length > 0 ? (visitors[0].lastSeen | date:'dd/MM HH:mm') : '—' }}</p>
            </div>
          </div>
        </section>

        <!-- Abas -->
        <div class="flex gap-1 border-b border-gray-800">
          <button (click)="activeTab.set('ai')"
                  class="px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px"
                  [class.border-cyan-400]="activeTab() === 'ai'"
                  [class.text-cyan-400]="activeTab() === 'ai'"
                  [class.border-transparent]="activeTab() !== 'ai'"
                  [class.text-gray-500]="activeTab() !== 'ai'">
            Análises IA ({{ matches.length }})
          </button>
          <button (click)="activeTab.set('visitors')"
                  class="px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px"
                  [class.border-cyan-400]="activeTab() === 'visitors'"
                  [class.text-cyan-400]="activeTab() === 'visitors'"
                  [class.border-transparent]="activeTab() !== 'visitors'"
                  [class.text-gray-500]="activeTab() !== 'visitors'">
            Visitantes ({{ visitors.length }})
          </button>
        </div>

        <!-- Tabela IA -->
        @if (activeTab() === 'ai') {
          <div class="admin-card border rounded-xl overflow-hidden">
            @if (loading) {
              <div class="p-10 text-center text-gray-500 text-sm animate-pulse">Carregando...</div>
            } @else if (matches.length === 0) {
              <div class="p-10 text-center text-gray-600 text-sm">Nenhuma análise registrada ainda.</div>
            } @else {
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="text-xs text-gray-500 uppercase tracking-wider border-b border-gray-800">
                      <th class="text-left px-5 py-3 whitespace-nowrap">Data</th>
                      <th class="text-left px-5 py-3">Match</th>
                      <th class="text-left px-5 py-3">Vaga</th>
                      <th class="text-left px-5 py-3">Resposta IA</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (m of matches; track m.id) {
                      <tr class="border-b border-gray-800/40 hover:bg-gray-800/20 transition-colors">
                        <td class="px-5 py-3 text-xs text-gray-400 whitespace-nowrap">{{ m.createdAt | date:'dd/MM/yy HH:mm' }}</td>
                        <td class="px-5 py-3 whitespace-nowrap">
                          <span class="text-xs font-bold px-2.5 py-1 rounded-full"
                                [class.bg-green-500/15]="m.matchPercentage >= 70" [class.text-green-400]="m.matchPercentage >= 70"
                                [class.bg-yellow-500/15]="m.matchPercentage >= 50 && m.matchPercentage < 70" [class.text-yellow-400]="m.matchPercentage >= 50 && m.matchPercentage < 70"
                                [class.bg-red-500/15]="m.matchPercentage < 50" [class.text-red-400]="m.matchPercentage < 50">
                            {{ m.matchPercentage }}%
                          </span>
                        </td>
                        <td class="px-5 py-3 text-xs text-gray-400 max-w-xs"><div class="line-clamp-2" [title]="m.jobDescription">{{ m.jobDescription }}</div></td>
                        <td class="px-5 py-3 text-xs text-gray-400 max-w-xs"><div class="line-clamp-2" [title]="m.aiResponse">{{ m.aiResponse }}</div></td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </div>
        }

        <!-- Tabela Visitantes -->
        @if (activeTab() === 'visitors') {
          <div class="admin-card border rounded-xl overflow-hidden">
            @if (loading) {
              <div class="p-10 text-center text-gray-500 text-sm animate-pulse">Carregando...</div>
            } @else if (visitors.length === 0) {
              <div class="p-10 text-center text-gray-600 text-sm">Nenhum visitante registrado ainda.</div>
            } @else {
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="text-xs text-gray-500 uppercase tracking-wider border-b border-gray-800">
                      <th class="text-left px-5 py-3">Última Visita</th>
                      <th class="text-left px-5 py-3">Visitas</th>
                      <th class="text-left px-5 py-3">Localização</th>
                      <th class="text-left px-5 py-3">Idioma</th>
                      <th class="text-left px-5 py-3">Dispositivo</th>
                      <th class="text-left px-5 py-3">IP</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (v of visitors; track v.id) {
                      <tr class="border-b border-gray-800/40 hover:bg-gray-800/20 transition-colors">
                        <td class="px-5 py-3 text-xs text-gray-400 whitespace-nowrap">{{ v.lastSeen | date:'dd/MM/yy HH:mm' }}</td>
                        <td class="px-5 py-3">
                          <span class="text-xs font-bold px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400">
                            {{ v.visitCount }}x
                          </span>
                        </td>
                        <td class="px-5 py-3 text-xs text-gray-400">
                          {{ v.city }}{{ v.city && v.country ? ', ' : '' }}{{ v.country }}
                        </td>
                        <td class="px-5 py-3 text-xs text-gray-400">{{ v.language ?? '—' }}</td>
                        <td class="px-5 py-3 text-xs text-gray-400 whitespace-nowrap">
                          {{ isMobile(v.userAgent) ? '📱 Mobile' : '🖥️ Desktop' }}
                          <span class="text-gray-600"> {{ v.screenWidth }}×{{ v.screenHeight }}</span>
                        </td>
                        <td class="px-5 py-3 text-xs text-gray-600 font-mono">{{ v.ip }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </div>
        }

      </main>
    </div>
  `,
  styles: [`
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `],
})
export class AdminDashboardComponent implements OnInit {
  private firebase = inject(FirebaseService);
  private cdr = inject(ChangeDetectorRef);

  matches: AiMatchRecord[] = [];
  visitors: VisitorRecord[] = [];
  loading = true;
  avgMatch = 0;
  bestMatch = 0;
  totalVisits = 0;
  uniqueCountries = 0;
  today = new Date();
  activeTab = signal<'ai' | 'visitors'>('ai');

  async ngOnInit(): Promise<void> {
    try {
      const [matches, visitors] = await Promise.all([
        this.firebase.getAiMatches(),
        this.firebase.getVisitors(),
      ]);
      this.matches = matches;
      this.visitors = visitors;

      if (matches.length > 0) {
        this.avgMatch = Math.round(matches.reduce((s, m) => s + m.matchPercentage, 0) / matches.length);
        this.bestMatch = Math.max(...matches.map(m => m.matchPercentage));
      }

      this.totalVisits = visitors.reduce((s, v) => s + (v.visitCount ?? 1), 0);
      this.uniqueCountries = new Set(visitors.map(v => v.country).filter(Boolean)).size;
    } catch {
      this.matches = [];
      this.visitors = [];
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  isMobile(ua?: string): boolean {
    return /mobile|android|iphone|ipad/i.test(ua ?? '');
  }
}
