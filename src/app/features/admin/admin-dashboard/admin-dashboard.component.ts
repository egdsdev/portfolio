import { Component, inject, OnInit, ChangeDetectorRef, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FirebaseService, AiMatchRecord, VisitorRecord, DevMatchRecord } from '../../../core/services/firebase.service';

interface ChartPoint { x: number; y: number; count: number; label: string; }
interface MapDot { cx: number; cy: number; count: number; }
interface LineChartData {
  pts: ChartPoint[];
  area: string;
  line: string;
  yLabels: { val: number; y: number }[];
  gridY: number[];
  vb: string;
  bottomY: number;
  padL: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [DatePipe],
  template: `
    <div class="admin-page min-h-screen pt-20">
      <main class="max-w-7xl mx-auto px-4 pb-12 space-y-8">

        <!-- Título -->
        <div class="pt-6">
          <h1 class="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p class="text-xs text-gray-500 mt-1">{{ today | date:'dd/MM/yyyy' }}</p>
        </div>

        <!-- 4 Cards resumo -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div class="admin-card rounded-xl p-4 border">
            <p class="text-xs text-gray-500 mb-1">Visitantes Únicos</p>
            <p class="text-3xl font-bold text-cyan-400">{{ visitors.length }}</p>
          </div>
          <div class="admin-card rounded-xl p-4 border">
            <p class="text-xs text-gray-500 mb-1">Países</p>
            <p class="text-3xl font-bold">{{ uniqueCountries }}</p>
          </div>
          <div class="admin-card rounded-xl p-4 border">
            <p class="text-xs text-gray-500 mb-1">Análises IA</p>
            <p class="text-3xl font-bold">{{ aiMatches.length }}</p>
          </div>
          <div class="admin-card rounded-xl p-4 border">
            <p class="text-xs text-gray-500 mb-1">Dev Matches</p>
            <p class="text-3xl font-bold">{{ devMatches.length }}</p>
          </div>
        </div>

        <!-- Abas -->
        <div class="flex gap-1 border-b border-gray-800">
          <button (click)="activeTab.set('ai')"
                  class="px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px"
                  [class.border-cyan-400]="activeTab() === 'ai'"
                  [class.text-cyan-400]="activeTab() === 'ai'"
                  [class.border-transparent]="activeTab() !== 'ai'"
                  [class.text-gray-500]="activeTab() !== 'ai'">
            Análises IA ({{ aiMatches.length }})
          </button>
          <button (click)="activeTab.set('dev')"
                  class="px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px"
                  [class.border-cyan-400]="activeTab() === 'dev'"
                  [class.text-cyan-400]="activeTab() === 'dev'"
                  [class.border-transparent]="activeTab() !== 'dev'"
                  [class.text-gray-500]="activeTab() !== 'dev'">
            Dev Match ({{ devMatches.length }})
          </button>

        </div>

        <!-- Tabela IA -->
        @if (activeTab() === 'ai') {
          <div class="admin-card border rounded-xl overflow-hidden">
            @if (loading) {
              <div class="p-10 text-center text-gray-500 text-sm animate-pulse">Carregando...</div>
            } @else if (aiMatches.length === 0) {
              <div class="p-10 text-center text-gray-600 text-sm">Nenhuma análise registrada ainda.</div>
            } @else {
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="text-xs text-gray-500 uppercase tracking-wider border-b border-gray-800">
                      <th class="text-left px-5 py-3 whitespace-nowrap">Data</th>
                      <th class="text-left px-5 py-3">Match</th>
                      <th class="text-left px-5 py-3">O que escreveu</th>
                      <th class="text-left px-5 py-3">Resposta da IA</th>
                      <th class="text-left px-5 py-3">Localização</th>
                      <th class="text-left px-5 py-3">Dispositivo</th>
                      <th class="text-left px-5 py-3">IP</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (m of aiMatches; track m.id) {
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
                        <td class="px-5 py-3 text-xs text-gray-400 whitespace-nowrap">
                          @if (getVisitor(m.visitorId); as v) {
                            {{ v.city }}{{ v.city && v.country ? ', ' : '' }}{{ v.country }}
                          } @else {
                            <span class="text-gray-600">—</span>
                          }
                        </td>
                        <td class="px-5 py-3 text-xs text-gray-400 whitespace-nowrap">
                          @if (getVisitor(m.visitorId); as v) {
                            {{ isMobile(v.userAgent) ? '📱' : '🖥️' }}
                            <span class="text-gray-600"> {{ v.screenWidth }}×{{ v.screenHeight }}</span>
                          } @else {
                            <span class="text-gray-600">—</span>
                          }
                        </td>
                        <td class="px-5 py-3 text-xs text-gray-600 font-mono whitespace-nowrap">
                          {{ getVisitor(m.visitorId)?.ip ?? '—' }}
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </div>
        }

        <!-- Tabela Dev Match -->
        @if (activeTab() === 'dev') {
          <div class="admin-card border rounded-xl overflow-hidden">
            @if (loading) {
              <div class="p-10 text-center text-gray-500 text-sm animate-pulse">Carregando...</div>
            } @else if (devMatches.length === 0) {
              <div class="p-10 text-center text-gray-600 text-sm">Nenhum match manual registrado ainda.</div>
            } @else {
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="text-xs text-gray-500 uppercase tracking-wider border-b border-gray-800">
                      <th class="text-left px-5 py-3 whitespace-nowrap">Data</th>
                      <th class="text-left px-5 py-3">Match</th>
                      <th class="text-left px-5 py-3">Áreas de Atuação</th>
                      <th class="text-left px-5 py-3">Requisitos Específicos</th>
                      <th class="text-left px-5 py-3">Localização</th>
                      <th class="text-left px-5 py-3">Dispositivo</th>
                      <th class="text-left px-5 py-3">IP</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (d of devMatches; track d.id) {
                      <tr class="border-b border-gray-800/40 hover:bg-gray-800/20 transition-colors">
                        <td class="px-5 py-3 text-xs text-gray-400 whitespace-nowrap">{{ d.createdAt | date:'dd/MM/yy HH:mm' }}</td>
                        <td class="px-5 py-3 whitespace-nowrap">
                          <span class="text-xs font-bold px-2.5 py-1 rounded-full"
                                [class.bg-green-500/15]="d.matchPercentage >= 70" [class.text-green-400]="d.matchPercentage >= 70"
                                [class.bg-yellow-500/15]="d.matchPercentage >= 50 && d.matchPercentage < 70" [class.text-yellow-400]="d.matchPercentage >= 50 && d.matchPercentage < 70"
                                [class.bg-red-500/15]="d.matchPercentage < 50" [class.text-red-400]="d.matchPercentage < 50">
                            {{ d.matchPercentage }}%
                          </span>
                        </td>
                        <td class="px-5 py-3 text-xs text-gray-400 max-w-xs">
                          <div class="flex flex-wrap gap-1">
                            @for (a of d.areas; track a) {
                              <span class="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300 text-xs">{{ a }}</span>
                            }
                          </div>
                        </td>
                        <td class="px-5 py-3 text-xs text-gray-400 max-w-xs">
                          @if (d.requirements.length === 0) {
                            <span class="text-gray-600">—</span>
                          } @else {
                            <div class="flex flex-wrap gap-1">
                              @for (r of d.requirements; track r) {
                                <span class="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 text-xs">{{ r }}</span>
                              }
                            </div>
                          }
                        </td>
                        <td class="px-5 py-3 text-xs text-gray-400 whitespace-nowrap">
                          @if (getVisitor(d.visitorId); as v) {
                            {{ v.city }}{{ v.city && v.country ? ', ' : '' }}{{ v.country }}
                          } @else {
                            <span class="text-gray-600">—</span>
                          }
                        </td>
                        <td class="px-5 py-3 text-xs text-gray-400 whitespace-nowrap">
                          @if (getVisitor(d.visitorId); as v) {
                            {{ isMobile(v.userAgent) ? '📱' : '🖥️' }}
                            <span class="text-gray-600"> {{ v.screenWidth }}×{{ v.screenHeight }}</span>
                          } @else {
                            <span class="text-gray-600">—</span>
                          }
                        </td>
                        <td class="px-5 py-3 text-xs text-gray-600 font-mono whitespace-nowrap">
                          {{ getVisitor(d.visitorId)?.ip ?? '—' }}
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </div>
        }

        <!-- Gráficos -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <!-- Gráfico de linha -->
          @let chart = lineChart;
          <div class="admin-card border rounded-xl p-5">
            <p class="text-xs text-gray-500 uppercase tracking-widest mb-4 font-semibold">📈 Acessos — Últimos 7 dias</p>
            <svg [attr.viewBox]="chart.vb" class="w-full" style="overflow:visible">
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#22d3ee" stop-opacity="0.25"/>
                  <stop offset="100%" stop-color="#22d3ee" stop-opacity="0"/>
                </linearGradient>
              </defs>
              @for (gy of chart.gridY; track gy) {
                <line [attr.x1]="chart.padL" x2="492" [attr.y1]="gy" [attr.y2]="gy"
                      stroke="#1f2937" stroke-width="1"/>
              }
              <path [attr.d]="chart.area" fill="url(#areaGrad)"/>
              <polyline [attr.points]="chart.line"
                        fill="none" stroke="#22d3ee" stroke-width="2"
                        stroke-linejoin="round" stroke-linecap="round"/>
              @for (pt of chart.pts; track pt.label) {
                <circle [attr.cx]="pt.x" [attr.cy]="pt.y" r="4"
                        fill="#22d3ee" stroke="#0a0f1a" stroke-width="2"/>
              }
              @for (pt of chart.pts; track pt.label) {
                <text [attr.x]="pt.x" [attr.y]="chart.bottomY + 18"
                      text-anchor="middle" class="chart-lbl">{{ pt.label }}</text>
              }
              @for (l of chart.yLabels; track l.val) {
                <text [attr.x]="chart.padL - 6" [attr.y]="l.y + 4"
                      text-anchor="end" class="chart-lbl">{{ l.val }}</text>
              }
            </svg>
          </div>

          <!-- Mapa de pontos -->
          @let dots = mapDots;
          <div class="admin-card border rounded-xl p-5">
            <p class="text-xs text-gray-500 uppercase tracking-widest mb-4 font-semibold">🌍 Localização dos Acessos</p>
            <svg viewBox="0 0 480 240" class="w-full rounded-lg" style="background:#05080f">
              <line x1="0" x2="480" y1="40"  y2="40"  stroke="#0d1f2d" stroke-width="1" stroke-dasharray="3,4"/>
              <line x1="0" x2="480" y1="80"  y2="80"  stroke="#0d1f2d" stroke-width="1" stroke-dasharray="3,4"/>
              <line x1="0" x2="480" y1="120" y2="120" stroke="#162333" stroke-width="1"/>
              <line x1="0" x2="480" y1="160" y2="160" stroke="#0d1f2d" stroke-width="1" stroke-dasharray="3,4"/>
              <line x1="0" x2="480" y1="200" y2="200" stroke="#0d1f2d" stroke-width="1" stroke-dasharray="3,4"/>
              <line x1="80"  x2="80"  y1="0" y2="240" stroke="#0d1f2d" stroke-width="1" stroke-dasharray="3,4"/>
              <line x1="160" x2="160" y1="0" y2="240" stroke="#0d1f2d" stroke-width="1" stroke-dasharray="3,4"/>
              <line x1="240" x2="240" y1="0" y2="240" stroke="#162333" stroke-width="1"/>
              <line x1="320" x2="320" y1="0" y2="240" stroke="#0d1f2d" stroke-width="1" stroke-dasharray="3,4"/>
              <line x1="400" x2="400" y1="0" y2="240" stroke="#0d1f2d" stroke-width="1" stroke-dasharray="3,4"/>
              <text x="4" y="14"  fill="#1e3a4a" font-size="7" font-family="inherit">90°N</text>
              <text x="4" y="43"  fill="#1e3a4a" font-size="7" font-family="inherit">60°N</text>
              <text x="4" y="83"  fill="#1e3a4a" font-size="7" font-family="inherit">30°N</text>
              <text x="4" y="123" fill="#1e3a4a" font-size="7" font-family="inherit">0°</text>
              <text x="4" y="163" fill="#1e3a4a" font-size="7" font-family="inherit">30°S</text>
              <text x="4" y="203" fill="#1e3a4a" font-size="7" font-family="inherit">60°S</text>
              <text x="78"  y="237" fill="#1e3a4a" font-size="7" font-family="inherit" text-anchor="middle">120°O</text>
              <text x="158" y="237" fill="#1e3a4a" font-size="7" font-family="inherit" text-anchor="middle">60°O</text>
              <text x="240" y="237" fill="#1e3a4a" font-size="7" font-family="inherit" text-anchor="middle">0°</text>
              <text x="320" y="237" fill="#1e3a4a" font-size="7" font-family="inherit" text-anchor="middle">60°L</text>
              <text x="400" y="237" fill="#1e3a4a" font-size="7" font-family="inherit" text-anchor="middle">120°L</text>
              @for (dot of dots; track dot.cx + '-' + dot.cy) {
                <circle [attr.cx]="dot.cx" [attr.cy]="dot.cy"
                        [attr.r]="dot.count > 5 ? 6 : dot.count > 2 ? 4.5 : 3"
                        fill="#22d3ee" opacity="0.75"/>
              }
              @for (dot of dots; track 'h' + dot.cx + '-' + dot.cy) {
                @if (dot.count > 2) {
                  <circle [attr.cx]="dot.cx" [attr.cy]="dot.cy"
                          [attr.r]="dot.count > 5 ? 10 : 7"
                          fill="none" stroke="#22d3ee" stroke-width="1" opacity="0.25"/>
                }
              }
              @if (dots.length === 0 && !loading) {
                <text x="240" y="120" text-anchor="middle" fill="#374151" font-size="11" font-family="inherit">Sem dados de localização</text>
              }
            </svg>
            <div class="flex items-center gap-4 mt-3">
              <div class="flex items-center gap-1.5">
                <svg width="10" height="10"><circle cx="5" cy="5" r="3" fill="#22d3ee" opacity="0.75"/></svg>
                <span class="text-xs text-gray-500">1–2 visitas</span>
              </div>
              <div class="flex items-center gap-1.5">
                <svg width="12" height="12"><circle cx="6" cy="6" r="4.5" fill="#22d3ee" opacity="0.75"/></svg>
                <span class="text-xs text-gray-500">3–5 visitas</span>
              </div>
              <div class="flex items-center gap-1.5">
                <svg width="14" height="14"><circle cx="7" cy="7" r="6" fill="#22d3ee" opacity="0.75"/></svg>
                <span class="text-xs text-gray-500">6+ visitas</span>
              </div>
            </div>
          </div>

        </div>
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
    :host ::ng-deep .chart-lbl {
      fill: #6b7280;
      font-size: 10px;
      font-family: inherit;
    }
  `],
})
export class AdminDashboardComponent implements OnInit {
  private firebase = inject(FirebaseService);
  private cdr = inject(ChangeDetectorRef);

  aiMatches: AiMatchRecord[] = [];
  devMatches: DevMatchRecord[] = [];
  visitors: VisitorRecord[] = [];
  visitorMap = new Map<string, VisitorRecord>();
  loading = true;
  uniqueCountries = 0;
  mobileCount = 0;
  today = new Date();
  activeTab = signal<'ai' | 'dev'>('ai');

  async ngOnInit(): Promise<void> {
    try {
      const [aiMatches, devMatches, visitors] = await Promise.all([
        this.firebase.getAiMatches(),
        this.firebase.getDevMatches(),
        this.firebase.getVisitors(),
      ]);
      this.aiMatches = aiMatches;
      this.devMatches = devMatches;
      this.visitors = visitors;
      this.visitorMap = new Map(visitors.filter(v => v.id).map(v => [v.id!, v]));
      this.uniqueCountries = new Set(visitors.map(v => v.country).filter(Boolean)).size;
      this.mobileCount = visitors.filter(v => this.isMobile(v.userAgent)).length;
    } catch {
      this.aiMatches = [];
      this.devMatches = [];
      this.visitors = [];
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  getVisitor(visitorId?: string): VisitorRecord | undefined {
    return visitorId ? this.visitorMap.get(visitorId) : undefined;
  }

  get lineChart(): LineChartData {
    const PAD_L = 44, PAD_R = 12, PAD_T = 16, PAD_B = 36;
    const W = 492 - PAD_L - PAD_R;
    const H = 148;
    const bottomY = PAD_T + H;
    const today = new Date();
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (6 - i));
      return d;
    });
    const counts = days.map(day =>
      this.visitors.filter(v => {
        const ls = new Date(v.lastSeen);
        return ls.getFullYear() === day.getFullYear()
          && ls.getMonth() === day.getMonth()
          && ls.getDate() === day.getDate();
      }).length
    );
    const maxVal = Math.max(...counts, 1);
    const pts: ChartPoint[] = days.map((day, i) => ({
      x: PAD_L + (i / 6) * W,
      y: PAD_T + (1 - counts[i] / maxVal) * H,
      count: counts[i],
      label: day.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    }));
    const area = `M${pts[0].x},${bottomY} L${pts.map(p => `${p.x},${p.y}`).join(' L')} L${pts[pts.length - 1].x},${bottomY} Z`;
    const line = pts.map(p => `${p.x},${p.y}`).join(' ');
    const yLabels = Array.from({ length: 5 }, (_, i) => ({
      val: Math.round((maxVal / 4) * i),
      y: bottomY - (i / 4) * H,
    }));
    return {
      pts, area, line, yLabels,
      gridY: yLabels.map(l => l.y),
      vb: `0 0 492 ${H + PAD_T + PAD_B}`,
      bottomY,
      padL: PAD_L,
    };
  }

  get mapDots(): MapDot[] {
    const W = 480, H = 240;
    return this.visitors
      .filter(v => v.lat != null && v.lng != null)
      .map(v => ({
        cx: ((v.lng! + 180) / 360) * W,
        cy: ((90 - v.lat!) / 180) * H,
        count: v.visitCount,
      }));
  }

  isMobile(ua?: string): boolean {
    return /mobile|android|iphone|ipad/i.test(ua ?? '');
  }
}
