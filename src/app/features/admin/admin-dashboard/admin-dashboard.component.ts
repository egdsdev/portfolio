import { Component, inject, OnInit, AfterViewInit, OnDestroy, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FirebaseService, AiMatchRecord, VisitorRecord, DevMatchRecord } from '../../../core/services/firebase.service';
import * as L from 'leaflet';
import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip } from 'chart.js';

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip);

interface AccessRecord {
  date: Date;
  visitor?: VisitorRecord;
  aiMatch?: AiMatchRecord;
  devMatch?: DevMatchRecord;
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

        <!-- Card Brulias Clicks -->
        <div class="admin-card rounded-xl p-4 border flex items-center gap-4">
          <span class="text-3xl shrink-0">🌌</span>
          <div>
            <p class="text-xs text-gray-500 mb-1">Cliques em Brulias <span class="text-gray-600">(excluindo seu IP)</span></p>
            <p class="text-3xl font-bold text-purple-400">{{ bruliasClicks }}</p>
          </div>
        </div>

        <!-- Tabela unificada de acessos -->
        <div class="admin-card border rounded-xl overflow-hidden">
          @if (loading) {
            <div class="p-10 text-center text-gray-500 text-sm animate-pulse">Carregando...</div>
          } @else if (accessRecords.length === 0) {
            <div class="p-10 text-center text-gray-600 text-sm">Nenhum acesso registrado ainda.</div>
          } @else {
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="text-xs text-gray-500 uppercase tracking-wider border-b border-gray-800">
                    <th class="text-left px-4 py-3 whitespace-nowrap">Data</th>
                    <th class="text-left px-4 py-3">Localizacao</th>
                    <th class="text-left px-4 py-3">Dispositivo</th>
                    <th class="text-left px-4 py-3">IP</th>
                    <th class="text-left px-4 py-3 border-l border-gray-800/60">Match IA</th>
                    <th class="text-left px-4 py-3">Resposta IA</th>
                    <th class="text-left px-4 py-3 border-l border-gray-800/60">Match Dev</th>
                    <th class="text-left px-4 py-3">Areas Dev</th>
                    <th class="text-left px-4 py-3 border-l border-gray-800/60 whitespace-nowrap">🌌 Brulias</th>
                    <th class="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  @for (r of accessRecords; track r.date.getTime()) {
                    <tr class="border-b border-gray-800/40 hover:bg-gray-800/20 transition-colors">
                      <td class="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{{ r.date | date:'dd/MM/yy HH:mm' }}</td>
                      <td class="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                        @if (r.visitor) {
                          {{ r.visitor.city }}{{ r.visitor.city && r.visitor.country ? ', ' : '' }}{{ r.visitor.country }}
                        } @else { <span class="text-gray-600">-</span> }
                      </td>
                      <td class="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                        @if (r.visitor) {
                          {{ isMobile(r.visitor.userAgent) ? '&#x1F4F1;' : '&#x1F5A5;' }}
                          <span class="text-gray-600"> {{ r.visitor.screenWidth }}x{{ r.visitor.screenHeight }}</span>
                        } @else { <span class="text-gray-600">-</span> }
                      </td>
                      <td class="px-4 py-3 text-xs text-gray-600 font-mono whitespace-nowrap">{{ r.visitor?.ip ?? '-' }}</td>
                      <td class="px-4 py-3 whitespace-nowrap border-l border-gray-800/40">
                        @if (r.aiMatch) {
                          <span class="text-xs font-bold px-2 py-1 rounded-full"
                                [class.bg-green-500/15]="r.aiMatch.matchPercentage >= 70"
                                [class.text-green-400]="r.aiMatch.matchPercentage >= 70"
                                [class.bg-yellow-500/15]="r.aiMatch.matchPercentage >= 50 && r.aiMatch.matchPercentage < 70"
                                [class.text-yellow-400]="r.aiMatch.matchPercentage >= 50 && r.aiMatch.matchPercentage < 70"
                                [class.bg-red-500/15]="r.aiMatch.matchPercentage < 50"
                                [class.text-red-400]="r.aiMatch.matchPercentage < 50">
                            {{ r.aiMatch.matchPercentage }}%
                          </span>
                        } @else { <span class="text-gray-700">-</span> }
                      </td>
                      <td class="px-4 py-3 text-xs text-gray-400 max-w-[160px]">
                        @if (r.aiMatch) {
                          <div class="line-clamp-2" [title]="r.aiMatch.aiResponse">{{ r.aiMatch.aiResponse }}</div>
                        } @else { <span class="text-gray-700">-</span> }
                      </td>
                      <td class="px-4 py-3 whitespace-nowrap border-l border-gray-800/40">
                        @if (r.devMatch) {
                          <span class="text-xs font-bold px-2 py-1 rounded-full"
                                [class.bg-green-500/15]="r.devMatch.matchPercentage >= 70"
                                [class.text-green-400]="r.devMatch.matchPercentage >= 70"
                                [class.bg-yellow-500/15]="r.devMatch.matchPercentage >= 50 && r.devMatch.matchPercentage < 70"
                                [class.text-yellow-400]="r.devMatch.matchPercentage >= 50 && r.devMatch.matchPercentage < 70"
                                [class.bg-red-500/15]="r.devMatch.matchPercentage < 50"
                                [class.text-red-400]="r.devMatch.matchPercentage < 50">
                            {{ r.devMatch.matchPercentage }}%
                          </span>
                        } @else { <span class="text-gray-700">-</span> }
                      </td>
                      <td class="px-4 py-3 text-xs text-gray-400 max-w-[160px]">
                        @if (r.devMatch) {
                          <div class="flex flex-wrap gap-1">
                            @for (a of r.devMatch.areas; track a) {
                              <span class="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300 text-xs">{{ a }}</span>
                            }
                          </div>
                        } @else { <span class="text-gray-700">-</span> }
                      </td>
                      <td class="px-4 py-3 border-l border-gray-800/40 text-center">
                        @if (r.visitor?.ip && bruliasClicksByIp.get(r.visitor!.ip)) {
                          <span class="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full bg-purple-500/15 text-purple-400">
                            {{ bruliasClicksByIp.get(r.visitor!.ip) }}×
                          </span>
                        } @else {
                          <span class="text-gray-700">-</span>
                        }
                      </td>
                      <td class="px-4 py-3 text-center">
                        @if (r.visitor?.id) {
                          <button
                            (click)="confirmDelete(r.visitor!)"
                            class="text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors rounded p-1.5"
                            title="Excluir visitante">
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                              <polyline points="3 6 5 6 21 6"/>
                              <path d="M19 6l-1 14H6L5 6"/>
                              <path d="M10 11v6"/><path d="M14 11v6"/>
                              <path d="M9 6V4h6v2"/>
                            </svg>
                          </button>
                        }
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>

        <!-- Modal de confirmação de exclusão -->
        @if (deleteTarget) {
          <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" (click)="cancelDelete()">
            <div class="admin-card border rounded-xl p-6 w-full max-w-sm mx-4 shadow-2xl" (click)="$event.stopPropagation()">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-10 h-10 rounded-full bg-red-500/15 flex items-center justify-center shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-semibold text-gray-100">Excluir visitante</p>
                  <p class="text-xs text-gray-500 mt-0.5">Esta ação não pode ser desfeita</p>
                </div>
              </div>
              <p class="text-xs text-gray-400 mb-5">
                Deseja excluir o registro de
                <span class="font-semibold text-gray-200">{{ deleteTarget.ip }}</span>
                @if (deleteTarget.city || deleteTarget.country) {
                  ({{ deleteTarget.city }}{{ deleteTarget.city && deleteTarget.country ? ', ' : '' }}{{ deleteTarget.country }})
                }?
                Todos os matches associados também serão removidos.
              </p>
              <div class="flex gap-3 justify-end">
                <button (click)="cancelDelete()" class="px-4 py-2 text-xs text-gray-400 hover:text-gray-200 border border-gray-700 hover:border-gray-500 rounded-lg transition-colors">Cancelar</button>
                <button (click)="executeDelete()" [disabled]="deleting" class="px-4 py-2 text-xs font-semibold bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center gap-2">
                  @if (deleting) { <span class="animate-spin w-3 h-3 border border-white border-t-transparent rounded-full"></span> }
                  Excluir
                </button>
              </div>
            </div>
          </div>
        }

        <!-- Gráficos -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <!-- Gráfico de linha (Chart.js) -->
          <div class="admin-card border rounded-xl p-5">
            <p class="text-xs text-gray-500 uppercase tracking-widest mb-4 font-semibold">Acessos — Últimos 7 dias</p>
            <canvas #chartCanvas style="width:100%;max-height:220px"></canvas>
          </div>

          <!-- Mapa Leaflet -->
          <div class="admin-card border rounded-xl p-5">
            <p class="text-xs text-gray-500 uppercase tracking-widest mb-4 font-semibold">Localização dos Acessos</p>
            @if (loading) {
              <div class="h-64 flex items-center justify-center text-gray-600 text-sm animate-pulse">Carregando mapa...</div>
            } @else if (!hasMapCoords) {
              <div class="h-64 flex items-center justify-center text-gray-600 text-sm">Sem dados de localização</div>
            } @else {
              <div #mapEl class="leaflet-map w-full rounded-lg" style="height:260px"></div>
            }
          </div>

        </div>

        <!-- ── Heatmap de Horários ──────────────────────────────────────── -->
        <div class="admin-card border rounded-xl p-5">
          <p class="text-xs text-gray-500 uppercase tracking-widest mb-1 font-semibold">Heatmap de Acesso</p>
          <p class="text-[11px] text-gray-600 mb-4">Dia da semana × hora — todas as interações registradas</p>
          @if (!loading && visitors.length > 0) {
            <div class="flex gap-8 flex-wrap lg:flex-nowrap">
              <!-- Grade -->
              <div class="overflow-x-auto pb-1 shrink-0">
                <!-- Header de horas -->
                <div class="flex mb-1" style="padding-left:56px; gap:1px">
                  @for (cell of heatmapRows[0].cells; track $index) {
                    <div class="text-[9px] text-gray-600 text-center shrink-0" [style.width.px]="cellSize">
                      {{ $index % 6 === 0 ? $index + 'h' : '' }}
                    </div>
                  }
                </div>
                <!-- Linhas por dia -->
                @for (row of heatmapRows; track row.label) {
                  <div class="flex items-center mb-px" style="gap:1px">
                    <div class="text-[10px] text-gray-500 text-right pr-2 shrink-0" style="width:54px">{{ row.label }}</div>
                    @for (cell of row.cells; track $index) {
                      <div
                        class="rounded-sm shrink-0 cursor-default hover:opacity-75 transition-opacity"
                        [style.width.px]="cellSize"
                        [style.height.px]="cellSize"
                        [style.background-color]="cell.color"
                        [title]="cell.title">
                      </div>
                    }
                  </div>
                }
                <!-- Legenda -->
                <div class="flex items-center gap-1 mt-3" style="padding-left:56px">
                  <span class="text-[10px] text-gray-600 mr-1">Menos</span>
                  @for (l of legendSteps; track l) {
                    <div class="rounded-sm" style="width:14px;height:14px" [style.background-color]="heatLegendColor(l)"></div>
                  }
                  <span class="text-[10px] text-gray-600 ml-1">Mais</span>
                </div>
              </div>

              <!-- Painel de resumo -->
              <div class="flex-1 flex flex-col justify-between gap-5 min-w-[180px]">
                <!-- KPIs -->
                <div class="grid grid-cols-3 gap-3">
                  <div class="admin-card border rounded-lg p-3 text-center">
                    <p class="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Total</p>
                    <p class="text-2xl font-bold" [style.color]="accentColor">{{ heatTotalHits }}</p>
                    <p class="text-[10px] text-gray-500 mt-0.5">eventos</p>
                  </div>
                  <div class="admin-card border rounded-lg p-3 text-center">
                    <p class="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Hora pico</p>
                    <p class="text-2xl font-bold" [style.color]="accentColor">{{ heatPeakHour }}h</p>
                    <p class="text-[10px] text-gray-500 mt-0.5">mais acessos</p>
                  </div>
                  <div class="admin-card border rounded-lg p-3 text-center">
                    <p class="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Dia ativo</p>
                    <p class="text-2xl font-bold" [style.color]="accentColor">{{ heatPeakDay }}</p>
                    <p class="text-[10px] text-gray-500 mt-0.5">mais acessos</p>
                  </div>
                </div>

                <!-- Top 5 horas -->
                <div>
                  <p class="text-[10px] text-gray-500 uppercase tracking-wider mb-3">Top 5 horas mais ativas</p>
                  <div class="space-y-2">
                    @for (h of heatTopHours; track h.label) {
                      <div class="flex items-center gap-2">
                        <span class="text-[11px] text-gray-400 w-6 shrink-0 text-right">{{ h.label }}</span>
                        <div class="flex-1 h-2 rounded-full bg-gray-800 overflow-hidden">
                          <div class="h-full rounded-full transition-all" [style.width.%]="h.pct" [style.background-color]="accentColor"></div>
                        </div>
                        <span class="text-[11px] font-bold tabular-nums w-6 text-right" [style.color]="accentColor">{{ h.count }}</span>
                      </div>
                    }
                  </div>
                </div>
              </div>
            </div>
          } @else if (!loading) {
            <div class="py-8 text-center text-gray-600 text-sm">Sem dados suficientes</div>
          } @else {
            <div class="py-8 text-center text-gray-500 text-sm animate-pulse">Carregando...</div>
          }
        </div>

        <!-- ── Funil + Dispositivos + Taxa de Retorno ─────────────────────── -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <!-- Funil de Engajamento -->
          <div class="admin-card border rounded-xl p-5">
            <p class="text-xs text-gray-500 uppercase tracking-widest mb-5 font-semibold">Funil de Engajamento</p>
            @if (!loading) {
              <div class="space-y-4">
                @for (step of funnelSteps; track $index; let i = $index) {
                  <div>
                    <div class="flex items-center justify-between mb-1.5">
                      <div class="flex items-center gap-2">
                        <span class="text-[10px] font-mono text-gray-600 w-3 shrink-0">{{ i + 1 }}</span>
                        <span class="text-xs text-gray-300">{{ step.label }}</span>
                      </div>
                      <div class="flex items-center gap-1.5">
                        <span class="text-sm font-bold tabular-nums" [style.color]="step.color">{{ step.value }}</span>
                        @if (funnelSteps[0].value > 0) {
                          <span class="text-[10px] text-gray-500 font-mono w-9 text-right">
                            {{ i === 0 ? '100' : pct(step.value / funnelSteps[0].value) }}%
                          </span>
                        }
                      </div>
                    </div>
                    <div class="h-1.5 bg-gray-800/80 rounded-full overflow-hidden">
                      <div class="h-full rounded-full transition-all duration-700"
                           [style.width.%]="funnelSteps[0].value > 0 ? (step.value / funnelSteps[0].value) * 100 : 0"
                           [style.background-color]="step.color">
                      </div>
                    </div>
                  </div>
                }
              </div>
            } @else {
              <div class="py-8 text-center text-gray-500 text-sm animate-pulse">Carregando...</div>
            }
          </div>

          <!-- Dispositivos (Donut) -->
          <div class="admin-card border rounded-xl p-5 flex flex-col">
            <p class="text-xs text-gray-500 uppercase tracking-widest mb-4 font-semibold">Dispositivos</p>
            @if (!loading && visitors.length > 0) {
              <div class="flex-1 flex flex-col items-center justify-center gap-5">
                <svg viewBox="0 0 140 140" class="w-40 h-40 shrink-0">
                  <circle cx="70" cy="70" r="50" fill="none" stroke="rgba(31,41,55,0.9)" stroke-width="20"/>
                  @for (seg of donutSegs; track $index) {
                    @if (seg.value > 0) {
                      <circle
                        cx="70" cy="70" r="50"
                        fill="none"
                        [attr.stroke]="seg.color"
                        stroke-width="20"
                        stroke-linecap="butt"
                        [attr.stroke-dasharray]="seg.dasharray"
                        [attr.stroke-dashoffset]="seg.dashoffset"
                        transform="rotate(-90 70 70)"/>
                    }
                  }
                  <text x="70" y="65" text-anchor="middle" font-size="20" font-weight="700" fill="white" font-family="system-ui">{{ visitors.length }}</text>
                  <text x="70" y="80" text-anchor="middle" font-size="10" fill="rgb(107,114,128)" font-family="system-ui">únicos</text>
                </svg>
                <div class="w-full space-y-3">
                  @for (seg of donutSegs; track $index) {
                    <div class="flex items-center justify-between gap-4">
                      <div class="flex items-center gap-2">
                        <span class="w-3 h-3 rounded-full shrink-0" [style.background-color]="seg.color"></span>
                        <span class="text-sm text-gray-300">{{ seg.label }}</span>
                      </div>
                      <span class="text-sm font-bold tabular-nums" [style.color]="seg.color">{{ seg.value }}</span>
                    </div>
                  }
                </div>
              </div>
            } @else if (!loading) {
              <div class="py-4 text-center text-gray-600 text-sm">Sem dados</div>
            } @else {
              <div class="py-4 text-center text-gray-500 text-sm animate-pulse">Carregando...</div>
            }
          </div>

          <!-- Taxa de Retorno -->
          <div class="admin-card border rounded-xl p-5">
            <p class="text-xs text-gray-500 uppercase tracking-widest mb-4 font-semibold">Taxa de Retorno</p>
            @if (!loading && visitors.length > 0) {
              <div class="flex items-end gap-6 mb-5">
                <div>
                  <p class="text-4xl font-bold" [style.color]="accentColor">{{ returnRatePct }}%</p>
                  <p class="text-xs text-gray-500 mt-1">voltaram ao site</p>
                </div>
                <div class="text-right">
                  <p class="text-2xl font-bold text-gray-200">
                    {{ returningCount }}<span class="text-sm text-gray-500">/{{ visitors.length }}</span>
                  </p>
                  <p class="text-xs text-gray-500 mt-1">visitantes únicos</p>
                </div>
              </div>
              @if (topReturnList.length > 0) {
                <p class="text-[10px] text-gray-600 uppercase tracking-wider mb-2">Top recorrentes</p>
                <div class="space-y-2">
                  @for (v of topReturnList; track v.ip) {
                    <div class="flex items-center justify-between">
                      <span class="text-xs text-gray-400 font-mono truncate max-w-[120px]">{{ v.city || v.ip }}</span>
                      <div class="flex items-center gap-2">
                        <div class="w-16 h-1 bg-gray-800 rounded-full overflow-hidden">
                          <div class="h-full rounded-full"
                               [style.background-color]="accentColor"
                               [style.width.%]="topReturnList[0].visitCount > 0 ? (v.visitCount / topReturnList[0].visitCount) * 100 : 0">
                          </div>
                        </div>
                        <span class="text-xs font-bold w-5 text-right" [style.color]="accentColor">{{ v.visitCount }}×</span>
                      </div>
                    </div>
                  }
                </div>
              }
            } @else if (!loading) {
              <div class="py-4 text-center text-gray-600 text-sm">Sem dados</div>
            } @else {
              <div class="py-4 text-center text-gray-500 text-sm animate-pulse">Carregando...</div>
            }
          </div>
        </div>

      </main>
    </div>
  `,
  styles: [`
    .map-dark-invert .leaflet-layer,
    .map-dark-invert .leaflet-control-zoom-in,
    .map-dark-invert .leaflet-control-zoom-out,
    .map-dark-invert .leaflet-control-attribution {
      filter: brightness(1.55) contrast(0.75) saturate(0.65);
    }

    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `],
})
export class AdminDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapEl') mapEl!: ElementRef<HTMLDivElement>;
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  private leafletMap?: L.Map;
  private lineChartInstance?: Chart;
  private themeObserver?: MutationObserver;

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
  hasMapCoords = false;
  bruliasClicks = 0;
  bruliasClicksByIp = new Map<string, number>();

  private readonly OWNER_IPS = ['45.179.22.183'];

  // ── Novos widgets ──────────────────────────────────────────────────────────
  heatmapRows: { label: string; cells: Array<{ color: string; title: string }> }[] = [];
  heatPeakHour = 0;
  heatPeakDay = '';
  heatTotalHits = 0;
  heatTopHours: { label: string; count: number; pct: number }[] = [];
  donutSegs: { label: string; value: number; color: string; dasharray: string; dashoffset: number }[] = [];
  returningCount = 0;
  returnRatePct = 0;
  topReturnList: VisitorRecord[] = [];
  funnelSteps: { label: string; value: number; color: string }[] = [];
  readonly legendSteps = [0.1, 0.3, 0.5, 0.75, 1.0];
  readonly cellSize = 18;

  // ── Delete ──────────────────────────────────────────────────────────
  deleteTarget: VisitorRecord | null = null;
  deleting = false;

  async ngOnInit(): Promise<void> {
    const settle = <T>(p: Promise<T>, fallback: T) =>
      p.catch((err: unknown) => { console.error('[Dashboard]', err); return fallback; });

    const [aiMatches, devMatches, visitors, bruliasClickList] = await Promise.all([
      settle(this.firebase.getAiMatches(), [] as AiMatchRecord[]),
      settle(this.firebase.getDevMatches(), [] as DevMatchRecord[]),
      settle(this.firebase.getVisitors(), [] as VisitorRecord[]),
      settle(this.firebase.getBruliasClicks(), [] as { ip: string; createdAt: Date }[]),
    ]);

    this.aiMatches = aiMatches;
    this.devMatches = devMatches;
    this.visitors = visitors;
    const filteredBrulias = bruliasClickList.filter(c => !this.OWNER_IPS.includes(c.ip));
    this.bruliasClicks = filteredBrulias.length;
    this.bruliasClicksByIp = filteredBrulias.reduce((map, c) => {
      map.set(c.ip, (map.get(c.ip) ?? 0) + 1);
      return map;
    }, new Map<string, number>());
    this.visitorMap = new Map(visitors.filter(v => v.id).map(v => [v.id!, v]));
    this.uniqueCountries = new Set(visitors.map(v => v.country).filter(Boolean)).size;
    this.mobileCount = visitors.filter(v => this.isMobile(v.userAgent)).length;
    this.hasMapCoords = visitors.some(v => v.lat != null && v.lng != null);

    this.loading = false;
    this.computeExtraStats();
    this.cdr.detectChanges();
    setTimeout(() => {
      this.initLineChart();
      this.initMap();
    }, 50);
  }

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {
    this.lineChartInstance?.destroy();
    this.themeObserver?.disconnect();
    this.leafletMap?.remove();
  }

  private isLightTheme(): boolean {
    return document.documentElement.classList.contains('light');
  }

  private chartColors() {
    const light = this.isLightTheme();
    return {
      accent:     light ? '#7c3aed' : '#22d3ee',
      areaStart:  light ? 'rgba(124,58,237,0.18)' : 'rgba(34,211,238,0.18)',
      areaEnd:    light ? 'rgba(124,58,237,0)' : 'rgba(34,211,238,0)',
      grid:       light ? '#e9d5ff' : '#1f2937',
      tickColor:  light ? '#6b7280' : '#6b7280',
    };
  }

  private initLineChart(): void {
    if (!this.chartCanvas?.nativeElement) return;
    this.lineChartInstance?.destroy();

    const today = new Date();
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (6 - i));
      return d;
    });
    const labels = days.map(d => d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }));
    const counts = days.map(day =>
      this.visitors.filter(v => {
        const ls = new Date(v.lastSeen);
        return ls.getFullYear() === day.getFullYear()
          && ls.getMonth() === day.getMonth()
          && ls.getDate() === day.getDate();
      }).length
    );

    const c = this.chartColors();
    const ctx = this.chartCanvas.nativeElement.getContext('2d')!;
    const grad = ctx.createLinearGradient(0, 0, 0, 220);
    grad.addColorStop(0, c.areaStart);
    grad.addColorStop(1, c.areaEnd);

    this.lineChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          data: counts,
          borderColor: c.accent,
          backgroundColor: grad,
          borderWidth: 2,
          pointBackgroundColor: c.accent,
          pointRadius: 4,
          pointHoverRadius: 6,
          fill: true,
          tension: 0.35,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
        scales: {
          x: { grid: { color: c.grid }, ticks: { color: c.tickColor, font: { size: 11 } } },
          y: { beginAtZero: true, grid: { color: c.grid }, ticks: { color: c.tickColor, font: { size: 11 }, precision: 0 } },
        },
      },
    });

    // Observa troca de tema no <html> e atualiza cores
    this.themeObserver?.disconnect();
    this.themeObserver = new MutationObserver(() => {
      this.updateChartTheme();
      this.computeExtraStats();
      this.initMap();
      this.cdr.detectChanges();
    });
    this.themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  }

  private updateChartTheme(): void {
    if (!this.lineChartInstance) return;
    const c = this.chartColors();
    const ctx = this.chartCanvas.nativeElement.getContext('2d')!;
    const grad = ctx.createLinearGradient(0, 0, 0, 220);
    grad.addColorStop(0, c.areaStart);
    grad.addColorStop(1, c.areaEnd);

    const ds = this.lineChartInstance.data.datasets[0] as any;
    ds.borderColor = c.accent;
    ds.backgroundColor = grad;
    ds.pointBackgroundColor = c.accent;
    const scales = this.lineChartInstance.options.scales!;
    (scales['x'] as any).grid.color = c.grid;
    (scales['x'] as any).ticks.color = c.tickColor;
    (scales['y'] as any).grid.color = c.grid;
    (scales['y'] as any).ticks.color = c.tickColor;
    this.lineChartInstance.update();
  }

  private initMap(): void {
    const withCoords = this.visitors.filter(v => v.lat != null && v.lng != null);
    if (!withCoords.length || !this.mapEl?.nativeElement) return;
    if (this.leafletMap) { this.leafletMap.remove(); }

    // Fix ícones padrão do Leaflet no contexto de bundler
    const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
    const iconRetina = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
    const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';
    L.Marker.prototype.options.icon = L.icon({ iconUrl, iconRetinaUrl: iconRetina, shadowUrl, iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34] });

    const light = this.isLightTheme();
    this.leafletMap = L.map(this.mapEl.nativeElement, { zoomControl: true, scrollWheelZoom: true });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(this.leafletMap);

    const bounds: [number, number][] = [];
    for (const v of withCoords) {
      const lat = v.lat!;
      const lng = v.lng!;
      bounds.push([lat, lng]);
      const markerContent = this.buildMapMarkerContent(v);
      const markerColor = this.isLightTheme() ? '#7c3aed' : '#22d3ee';
      L.circleMarker([lat, lng], {
        radius: v.visitCount > 5 ? 10 : v.visitCount > 2 ? 7 : 5,
        color: markerColor,
        fillColor: markerColor,
        fillOpacity: 0.75,
        weight: 1.5,
      })
        .bindTooltip(markerContent, {
          direction: 'top',
          sticky: true,
          opacity: 0.95,
        })
        .bindPopup(markerContent)
        .addTo(this.leafletMap!);
    }
    if (bounds.length === 1) {
      this.leafletMap.setView(bounds[0], 5);
    } else {
      this.leafletMap.fitBounds(bounds, { padding: [30, 30] });
    }
  }

  confirmDelete(v: VisitorRecord): void {
    this.deleteTarget = v;
  }

  cancelDelete(): void {
    if (this.deleting) return;
    this.deleteTarget = null;
  }

  async executeDelete(): Promise<void> {
    if (!this.deleteTarget?.id || this.deleting) return;
    this.deleting = true;
    try {
      await this.firebase.deleteVisitor(this.deleteTarget.id);
      const id = this.deleteTarget.id;
      this.visitors = this.visitors.filter(v => v.id !== id);
      this.aiMatches = this.aiMatches.filter(m => m.visitorId !== id);
      this.devMatches = this.devMatches.filter(m => m.visitorId !== id);
      this.visitorMap.delete(id);
      this.uniqueCountries = new Set(this.visitors.map(v => v.country).filter(Boolean)).size;
      this.mobileCount = this.visitors.filter(v => this.isMobile(v.userAgent)).length;
      this.hasMapCoords = this.visitors.some(v => v.lat != null && v.lng != null);
      this.computeExtraStats();
      this.deleteTarget = null;
    } catch (err) {
      console.error('[Dashboard] deleteVisitor', err);
    } finally {
      this.deleting = false;
      this.cdr.markForCheck();
    }
  }

  getVisitor(visitorId?: string): VisitorRecord | undefined {
    return visitorId ? this.visitorMap.get(visitorId) : undefined;
  }

  get accessRecords(): AccessRecord[] {
    const seenVisitors = new Set<string>();
    const records: AccessRecord[] = [];

    for (const visitor of this.visitors) {
      if (!visitor.id) continue;
      seenVisitors.add(visitor.id);
      const aiMatch = this.aiMatches
        .filter(m => m.visitorId === visitor.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
      const devMatch = this.devMatches
        .filter(m => m.visitorId === visitor.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
      records.push({ date: new Date(visitor.lastSeen), visitor, aiMatch, devMatch });
    }

    // matches sem visitante associado (dados antigos sem visitorId)
    for (const m of this.aiMatches) {
      if (!m.visitorId || !seenVisitors.has(m.visitorId)) {
        records.push({ date: new Date(m.createdAt), aiMatch: m });
      }
    }
    for (const m of this.devMatches) {
      if (!m.visitorId || !seenVisitors.has(m.visitorId)) {
        records.push({ date: new Date(m.createdAt), devMatch: m });
      }
    }

    return records.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  isMobile(ua?: string): boolean {
    return /mobile|android|iphone|ipad/i.test(ua ?? '');
  }

  isTablet(ua?: string): boolean {
    return /ipad|tablet/i.test(ua ?? '');
  }

  get accentColor(): string {
    return this.isLightTheme() ? '#7c3aed' : '#22d3ee';
  }

  heatLegendColor(t: number): string {
    return this.heatColorByIntensity(t, this.isLightTheme());
  }

  pct(ratio: number): number {
    return Math.round(ratio * 100);
  }

  private buildMapMarkerContent(visitor: VisitorRecord): string {
    const location = [visitor.city, visitor.region, visitor.country].filter(Boolean).join(', ') || 'Local não identificado';
    const lastAccess = this.formatMapAccessTime(visitor.lastSeen);
    const visitLabel = `${visitor.visitCount} ${visitor.visitCount === 1 ? 'visita' : 'visitas'}`;

    return [
      '<div style="min-width: 220px; line-height: 1.45;">',
      `  <div style="font-weight: 700; margin-bottom: 4px;">${this.escapeHtml(location)}</div>`,
      `  <div><strong>IP:</strong> ${this.escapeHtml(visitor.ip || 'indisponível')}</div>`,
      `  <div><strong>Último acesso:</strong> ${this.escapeHtml(lastAccess)}</div>`,
      `  <div><strong>Visitas:</strong> ${this.escapeHtml(visitLabel)}</div>`,
      '</div>',
    ].join('');
  }

  private formatMapAccessTime(value: Date | string | undefined): string {
    const date = value ? new Date(value) : undefined;
    if (!date || Number.isNaN(date.getTime())) return 'indisponível';

    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(date);
  }

  private escapeHtml(value: string): string {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  private heatColorByIntensity(t: number, isLight = false): string {
    if (t <= 0) return isLight ? 'rgb(237,233,254)' : 'rgb(39,52,68)';
    if (isLight) {
      // purple gradient: light lavender → deep purple
      const r = Math.round(196 - t * 72);
      const g = Math.round(181 - t * 123);
      const b = Math.round(253 - t * 30);
      return `rgba(${r},${g},${b},${+(0.4 + t * 0.6).toFixed(2)})`;
    }
    const r = Math.round(14 + t * 20);
    const g = Math.round(74 + t * 137);
    const b = Math.round(82 + t * 156);
    return `rgba(${r},${g},${b},${+(0.3 + t * 0.7).toFixed(2)})`;
  }

  private computeExtraStats(): void {
    const isLight = this.isLightTheme();
    const dayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    // ── Heatmap ────────────────────────────────────────────────────────────
    const grid: number[][] = Array.from({ length: 7 }, () => new Array(24).fill(0));
    const times: Date[] = [
      ...this.visitors.map(v => new Date(v.lastSeen)),
      ...this.aiMatches.map(m => new Date(m.createdAt)),
      ...this.devMatches.map(m => new Date(m.createdAt)),
    ];
    for (const t of times) grid[t.getDay()][t.getHours()]++;
    const maxVal = Math.max(1, ...grid.flat());

    // Resumo heatmap
    this.heatTotalHits = grid.flat().reduce((a, b) => a + b, 0);
    const hourTotals = Array.from({ length: 24 }, (_, h) => grid.reduce((s, d) => s + d[h], 0));
    this.heatPeakHour = hourTotals.indexOf(Math.max(...hourTotals));
    const dayTotals = grid.map(d => d.reduce((a, b) => a + b, 0));
    this.heatPeakDay = dayLabels[dayTotals.indexOf(Math.max(...dayTotals))];
    const maxHour = Math.max(1, ...hourTotals);
    this.heatTopHours = hourTotals
      .map((count, h) => ({ label: `${h}h`, count, pct: Math.round((count / maxHour) * 100) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    this.heatmapRows = dayLabels.map((label, dayIdx) => ({
      label,
      cells: Array.from({ length: 24 }, (_, h) => {
        const count = grid[dayIdx][h];
        return {
          color: this.heatColorByIntensity(count / maxVal, isLight),
          title: `${count} ${count === 1 ? 'acesso' : 'acessos'} — ${label} às ${h}h`,
        };
      }),
    }));

    // ── Dispositivos / Donut ───────────────────────────────────────────────
    let mobile = 0, tablet = 0, desktop = 0;
    for (const v of this.visitors) {
      if (this.isTablet(v.userAgent)) tablet++;
      else if (this.isMobile(v.userAgent)) mobile++;
      else desktop++;
    }
    const total = this.visitors.length || 1;
    const C = 2 * Math.PI * 50;
    const deviceItems = isLight
      ? [
          { label: 'Desktop', value: desktop, color: '#7c3aed' },
          { label: 'Mobile',  value: mobile,  color: '#a855f7' },
          { label: 'Tablet',  value: tablet,  color: '#c084fc' },
        ]
      : [
          { label: 'Desktop', value: desktop, color: '#60a5fa' },
          { label: 'Mobile',  value: mobile,  color: '#22d3ee' },
          { label: 'Tablet',  value: tablet,  color: '#a78bfa' },
        ];
    let offset = 0;
    this.donutSegs = deviceItems.map(item => {
      const arc = (item.value / total) * C;
      const seg = { ...item, dasharray: `${arc.toFixed(3)} ${C.toFixed(3)}`, dashoffset: +((-offset).toFixed(3)) };
      offset += arc;
      return seg;
    });

    // ── Taxa de Retorno ───────────────────────────────────────────────────
    const returning = this.visitors.filter(v => v.visitCount > 1);
    this.returningCount = returning.length;
    this.returnRatePct = this.visitors.length > 0
      ? Math.round((returning.length / this.visitors.length) * 100) : 0;
    this.topReturnList = [...returning]
      .sort((a, b) => b.visitCount - a.visitCount)
      .slice(0, 5);

    // ── Funil de Engajamento ──────────────────────────────────────────────
    const totalVisits = this.visitors.reduce((s, v) => s + (v.visitCount || 1), 0);
    const aiUniq  = new Set(this.aiMatches.map(m => m.visitorId).filter(Boolean)).size;
    const devUniq = new Set(this.devMatches.map(m => m.visitorId).filter(Boolean)).size;
    this.funnelSteps = isLight
      ? [
          { label: 'Total de Acessos',  value: Math.max(totalVisits, this.visitors.length), color: '#7c3aed' },
          { label: 'Visitantes Únicos', value: this.visitors.length,                        color: '#a855f7' },
          { label: 'Usaram Match IA',   value: aiUniq,                                      color: '#c084fc' },
          { label: 'Usaram Dev Match',  value: devUniq,                                     color: '#6d28d9' },
        ]
      : [
          { label: 'Total de Acessos',  value: Math.max(totalVisits, this.visitors.length), color: '#22d3ee' },
          { label: 'Visitantes Únicos', value: this.visitors.length,                        color: '#60a5fa' },
          { label: 'Usaram Match IA',   value: aiUniq,                                      color: '#a78bfa' },
          { label: 'Usaram Dev Match',  value: devUniq,                                     color: '#34d399' },
        ];
  }
}
