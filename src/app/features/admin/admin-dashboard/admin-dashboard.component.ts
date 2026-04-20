import { Component, inject, OnInit, AfterViewInit, OnDestroy, ChangeDetectorRef, ElementRef, ViewChild, NgZone } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FirebaseService, AiMatchRecord, VisitorRecord, DevMatchRecord, AnalyticsEventRecord, ChatConversation, ChatMessage, isChatMessageWithinEditWindow } from '../../../core/services/firebase.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import * as L from 'leaflet';
import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip } from 'chart.js';

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip);

interface AccessRecord {
  date: Date;
  visitor?: VisitorRecord;
  aiMatch?: AiMatchRecord;
  devMatch?: DevMatchRecord;
}

interface AccessTableRow {
  key: string;
  date: Date;
  ip?: string;
  resolution: string;
  accessCount: number;
  visitorIds: string[];
  visitor?: VisitorRecord;
  aiMatch?: AiMatchRecord;
  devMatch?: DevMatchRecord;
}

interface SourceConversionRow {
  source: string;
  visits: number;
  projectClicks: number;
  contactIntents: number;
  directContacts: number;
  resumeDownloads: number;
  conversionRate: number;
}

interface CtaPerformanceRow {
  key: string;
  label: string;
  category: string;
  clicks: number;
  uniqueSessions: number;
  impressions: number;
  ctr: number;
}

interface SectionReachRow {
  key: string;
  label: string;
  sessions: number;
  reachRate: number;
}

interface FeatureUsageRow {
  key: string;
  label: string;
  started: number;
  completed: number;
  abandoned: number;
  completionRate: number;
  avgResult: number | null;
}

interface TimeToActionRow {
  source: string;
  sessions: number;
  avgSeconds: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [DatePipe, FormsModule, ConfirmDialogComponent],
  template: `
    <div class="admin-page min-h-screen pt-20">
      <main class="max-w-7xl mx-auto px-4 pb-12 space-y-6">

        <!-- Título -->
        <div class="pt-6">
          <h1 class="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p class="text-xs text-gray-500 mt-1">{{ today | date:'dd/MM/yyyy' }}</p>
        </div>

        <!-- Tabs de navegação -->
        <div class="flex items-center justify-between gap-2 flex-wrap">
          <div class="flex gap-1 bg-gray-800/50 border border-gray-700/50 rounded-xl p-1">
          <button (click)="activeTab = 'analytics'"
                  [class.bg-gray-700]="activeTab === 'analytics'"
                  [class.text-white]="activeTab === 'analytics'"
                  [class.text-gray-500]="activeTab !== 'analytics'"
                  class="px-5 py-2 rounded-lg text-sm font-medium transition-all duration-150">
            Analytics
          </button>
          <button (click)="activeTab = 'chat'"
                  [class.bg-gray-700]="activeTab === 'chat'"
                  [class.text-white]="activeTab === 'chat'"
                  [class.text-gray-500]="activeTab !== 'chat'"
                  class="px-5 py-2 rounded-lg text-sm font-medium transition-all duration-150 flex items-center gap-2">
            Conversas
            @if (totalUnread > 0) {
              <span class="inline-flex items-center justify-center w-4 h-4 rounded-full bg-violet-500 text-white text-[9px] font-bold">
                {{ totalUnread > 9 ? '9+' : totalUnread }}
              </span>
            }
          </button>
          <button (click)="activeTab = 'tests'"
                  [class.bg-gray-700]="activeTab === 'tests'"
                  [class.text-white]="activeTab === 'tests'"
                  [class.text-gray-500]="activeTab !== 'tests'"
                  class="px-5 py-2 rounded-lg text-sm font-medium transition-all duration-150">
            🛠️ Testes
          </button>
          </div>

          <!-- Botão de notificações push -->
          <button (click)="togglePushNotifications()"
                  [disabled]="pushLoading"
                  class="flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  [class]="pushEnabled ? 'border-green-500/50 bg-green-500/10 text-green-400 hover:bg-green-500/20' : 'border-gray-700 bg-gray-800/50 text-gray-400 hover:text-white hover:border-gray-600'">
            <span class="inline-block w-2 h-2 rounded-full" [class]="pushEnabled ? 'bg-green-400' : 'bg-gray-500'"></span>
            @if (pushLoading) { A ativar... }
            @else if (pushEnabled) { Push ativo }
            @else { Ativar Push }
          </button>
        </div>

        <!-- ── Aba: Analytics ─────────────────────────────────────────────── -->
        <div [class.hidden]="activeTab !== 'analytics'" class="space-y-8">

        <!-- 5 Cards resumo -->
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
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
          <div class="admin-card rounded-xl p-4 border">
            <p class="text-xs text-gray-500 mb-1">🌌 Brulias <span class="text-gray-600 text-[10px]">(excl. seu IP)</span></p>
            <p class="text-3xl font-bold text-purple-400">{{ bruliasClicks }}</p>
          </div>
        </div>

        <!-- Tabela unificada de acessos -->
        <div class="admin-card border rounded-xl overflow-hidden">
          @if (loading) {
            <div class="p-10 text-center text-gray-500 text-sm animate-pulse">Carregando...</div>
          } @else if (accessRows.length === 0) {
            <div class="p-10 text-center text-gray-600 text-sm">Nenhum acesso registrado ainda.</div>
          } @else {
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="text-xs text-gray-500 uppercase tracking-wider border-b border-gray-800">
                    <th class="text-left px-4 py-3 whitespace-nowrap">Data</th>
                    <th class="text-left px-4 py-3">Localizacao</th>
                    <th class="text-left px-4 py-3">Dispositivo</th>
                    <th class="text-left px-4 py-3">IP / Rede</th>
                    <th class="text-left px-4 py-3 whitespace-nowrap">Acessos</th>
                    <th class="text-left px-4 py-3 border-l border-gray-800/60">Match IA</th>
                    <th class="text-left px-4 py-3">Resposta IA</th>
                    <th class="text-left px-4 py-3 border-l border-gray-800/60">Match Dev</th>
                    <th class="text-left px-4 py-3">Areas Dev</th>
                    <th class="text-left px-4 py-3 border-l border-gray-800/60 whitespace-nowrap">🌌 Brulias</th>
                    <th class="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  @for (r of paginatedAccessRows; track r.key) {
                    <tr
                      class="access-row border-b border-gray-800/40 transition-colors"
                      [class.access-row-clickable]="hasMapTarget(r)"
                      [class.access-row-selected]="selectedAccessRowKey === r.key"
                      [attr.tabindex]="hasMapTarget(r) ? 0 : null"
                      [attr.title]="rowMapHint(r)"
                      (click)="focusRowOnMap(r)"
                      (keydown.enter)="focusRowOnMap(r)"
                      (keydown.space)="focusRowOnMap(r); $event.preventDefault()">
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
                      <td class="px-4 py-3 text-xs align-top">
                        <div class="text-gray-600 font-mono whitespace-nowrap">{{ r.ip ?? '-' }}</div>
                        @if (r.visitor && hasNetworkInfo(r.visitor)) {
                          <div class="mt-1 space-y-1">
                            <div class="text-[10px] text-gray-400 max-w-44 truncate" [title]="networkSummary(r.visitor)">
                              {{ networkSummary(r.visitor) }}
                            </div>
                            <span class="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold"
                                  [style.background-color]="networkKindBackground(r.visitor)"
                                  [style.color]="networkKindForeground(r.visitor)"
                                  [attr.title]="networkKindTitle(r.visitor)">
                              {{ networkKindLabel(r.visitor) }}
                            </span>
                          </div>
                        }
                      </td>
                      <td class="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                        @if (r.visitorIds.length > 0) {
                          <span class="inline-flex items-center gap-1 rounded-full px-2 py-1 bg-cyan-500/10 text-cyan-400 font-semibold">
                            {{ r.accessCount }}x
                          </span>
                        } @else {
                          <span class="text-gray-700">-</span>
                        }
                      </td>
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
                      <td class="px-4 py-3 text-xs text-gray-400 max-w-40">
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
                      <td class="px-4 py-3 text-xs text-gray-400 max-w-40">
                        @if (r.devMatch) {
                          <div class="flex flex-wrap gap-1">
                            @for (a of r.devMatch.areas; track a) {
                              <span class="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300 text-xs">{{ a }}</span>
                            }
                          </div>
                        } @else { <span class="text-gray-700">-</span> }
                      </td>
                      <td class="px-4 py-3 border-l border-gray-800/40 text-center">
                        @if (r.ip && bruliasClicksByIp.get(r.ip)) {
                          <span class="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full bg-purple-500/15 text-purple-400">
                            {{ bruliasClicksByIp.get(r.ip) }}x
                          </span>
                        } @else {
                          <span class="text-gray-700">-</span>
                        }
                      </td>
                      <td class="px-4 py-3 text-center">
                        @if (r.ip && r.visitorIds.length > 0) {
                          <button
                            (click)="$event.stopPropagation(); confirmDelete(r)"
                            class="text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors rounded p-1.5"
                            title="Excluir grupo de IP e resolução">
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
            <div class="flex flex-col gap-3 border-t border-gray-800/40 px-4 py-3 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">
              <div>
                Exibindo {{ pageStart }}-{{ pageEnd }} de {{ accessRows.length }} grupos
              </div>
              <div class="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  (click)="previousPage()"
                  [disabled]="currentPage === 1"
                  class="rounded-md border border-gray-700 px-3 py-1.5 transition-colors hover:border-gray-500 hover:text-gray-300 disabled:cursor-not-allowed disabled:opacity-40">
                  Anterior
                </button>
                <span class="min-w-24 text-center">Página {{ currentPage }} de {{ totalPages }}</span>
                <button
                  type="button"
                  (click)="nextPage()"
                  [disabled]="currentPage >= totalPages"
                  class="rounded-md border border-gray-700 px-3 py-1.5 transition-colors hover:border-gray-500 hover:text-gray-300 disabled:cursor-not-allowed disabled:opacity-40">
                  Próxima
                </button>
              </div>
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
                  <p class="text-sm font-semibold text-gray-100">Excluir grupo de acesso</p>
                  <p class="text-xs text-gray-500 mt-0.5">Esta ação não pode ser desfeita</p>
                </div>
              </div>
              <p class="text-xs text-gray-400 mb-5">
                Deseja excluir os registros do grupo
                <span class="font-semibold text-gray-200">{{ deleteTarget.ip }}</span>
                <span class="font-semibold text-gray-200"> · {{ deleteTarget.resolution }}</span>
                @if (deleteTarget.visitor?.city || deleteTarget.visitor?.country) {
                  ({{ deleteTarget.visitor?.city }}{{ deleteTarget.visitor?.city && deleteTarget.visitor?.country ? ', ' : '' }}{{ deleteTarget.visitor?.country }})
                }?
                Isso removerá {{ deleteTarget.accessCount }} acessos consolidados e os matches associados.
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
            <p class="text-[11px] text-gray-600 mb-4">Clique em uma linha da tabela para aproximar o mapa nesse acesso.</p>
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

        <!-- ── Dispositivos + Taxa de Retorno ────────────────────────────── -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

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

        <!-- ── Origem + Tempo até Primeira Ação ─────────────────────────── -->
        <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">

          <div class="admin-card border rounded-xl p-5 xl:col-span-2">
            <div class="flex items-center justify-between gap-3 mb-1">
              <p class="text-xs text-gray-500 uppercase tracking-widest font-semibold">Origem com Conversão</p>
              @if (!loading) {
                <span class="text-[10px] px-2 py-0.5 rounded-full border"
                      [class.border-amber-500/30]="usingFallback"
                      [class.text-amber-400]="usingFallback"
                      [class.bg-amber-500/5]="usingFallback"
                      [class.border-gray-700]="!usingFallback"
                      [class.text-gray-600]="!usingFallback">
                  {{ usingFallback ? 'estimativa de referrer' : analyticsEventCount + ' eventos' }}
                </span>
              }
            </div>
            <p class="text-[11px] text-gray-600 mb-4">
              {{ usingFallback ? 'Origem dos visitantes por campo referrer. Cliques em CTA disponíveis após acumulação de eventos.' : 'Sessões por canal e quantas delas geram projeto, contato e download de currículo.' }}
            </p>
            @if (!loading && sourceConversions.length > 0) {
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="text-[11px] text-gray-500 uppercase tracking-wider border-b border-gray-800/50">
                      <th class="text-left py-2 pr-4">Origem</th>
                      <th class="text-right py-2 px-2">{{ usingFallback ? 'Visitantes' : 'Sessões' }}</th>
                      @if (!usingFallback) {
                        <th class="text-right py-2 px-2">Projetos</th>
                        <th class="text-right py-2 px-2">Contato</th>
                        <th class="text-right py-2 px-2">Direto</th>
                        <th class="text-right py-2 px-2">Currículo</th>
                        <th class="text-right py-2 pl-2">Conv.</th>
                      }
                    </tr>
                  </thead>
                  <tbody>
                    @for (row of sourceConversions; track row.source) {
                      <tr class="border-b border-gray-800/30">
                        <td class="py-2 pr-4 text-gray-300 font-medium">{{ row.source }}</td>
                        <td class="py-2 px-2 text-right text-gray-400">{{ row.visits }}</td>
                        @if (!usingFallback) {
                          <td class="py-2 px-2 text-right text-purple-300">{{ row.projectClicks }}</td>
                          <td class="py-2 px-2 text-right text-cyan-300">{{ row.contactIntents }}</td>
                          <td class="py-2 px-2 text-right text-green-300">{{ row.directContacts }}</td>
                          <td class="py-2 px-2 text-right text-amber-300">{{ row.resumeDownloads }}</td>
                          <td class="py-2 pl-2 text-right font-semibold" [style.color]="row.conversionRate >= 20 ? '#4ade80' : row.conversionRate >= 10 ? '#fbbf24' : '#94a3b8'">{{ row.conversionRate }}%</td>
                        }
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            } @else if (!loading) {
              <div class="py-8 text-center text-gray-600 text-sm">Sem visitantes registrados ainda</div>
            } @else {
              <div class="py-8 text-center text-gray-500 text-sm animate-pulse">Carregando...</div>
            }
          </div>

          <div class="admin-card border rounded-xl p-5">
            <p class="text-xs text-gray-500 uppercase tracking-widest mb-1 font-semibold">Tempo até Primeira Ação</p>
            <p class="text-[11px] text-gray-600 mb-4">Quanto tempo uma sessão leva para clicar ou iniciar algo relevante.</p>
            @if (!loading && (firstActionAvgSeconds > 0 || firstActionBySource.length > 0)) {
              <div class="grid grid-cols-2 gap-3 mb-5">
                <div class="admin-card border rounded-lg p-3 text-center">
                  <p class="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Média</p>
                  <p class="text-2xl font-bold" [style.color]="accentColor">{{ firstActionAvgSeconds }}s</p>
                </div>
                <div class="admin-card border rounded-lg p-3 text-center">
                  <p class="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Mediana</p>
                  <p class="text-2xl font-bold" [style.color]="accentColor">{{ firstActionMedianSeconds }}s</p>
                </div>
              </div>
              <div class="space-y-3">
                @for (row of firstActionBySource; track row.source) {
                  <div class="flex items-center justify-between gap-4">
                    <div>
                      <p class="text-sm text-gray-300">{{ row.source }}</p>
                      <p class="text-[10px] text-gray-600">{{ row.sessions }} sessões</p>
                    </div>
                    <p class="text-lg font-bold tabular-nums" [style.color]="accentColor">{{ row.avgSeconds }}s</p>
                  </div>
                }
              </div>
            } @else if (!loading) {
              <div class="py-8 text-center text-gray-600 text-sm">Sem ações registradas ainda</div>
            } @else {
              <div class="py-8 text-center text-gray-500 text-sm animate-pulse">Carregando...</div>
            }
          </div>
        </div>

        <!-- ── Funil de Contato + CTR ───────────────────────────────────── -->
        <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">

          <div class="admin-card border rounded-xl p-5">
            <p class="text-xs text-gray-500 uppercase tracking-widest mb-1 font-semibold">Funil de Contato</p>
            <p class="text-[11px] text-gray-600 mb-4">
              {{ usingFallback ? 'Estimativa de adoção de features — eventos de navegação ainda insuficientes.' : 'Sessões, projetos, contato, CTA e contato direto.' }}
            </p>
            @if (!loading && contactFunnelSteps.length > 0) {
              <div class="space-y-4">
                @for (step of contactFunnelSteps; track step.label; let i = $index) {
                  <div>
                    <div class="flex items-center justify-between mb-1.5">
                      <div class="flex items-center gap-2">
                        <span class="text-[10px] font-mono text-gray-600 w-3 shrink-0">{{ i + 1 }}</span>
                        <span class="text-xs text-gray-300">{{ step.label }}</span>
                      </div>
                      <div class="flex items-center gap-1.5">
                        <span class="text-sm font-bold tabular-nums" [style.color]="step.color">{{ step.value }}</span>
                        @if (contactFunnelSteps[0].value > 0) {
                          <span class="text-[10px] text-gray-500 font-mono w-9 text-right">
                            {{ i === 0 ? '100' : pct(step.value / contactFunnelSteps[0].value) }}%
                          </span>
                        }
                      </div>
                    </div>
                    <div class="h-1.5 bg-gray-800/80 rounded-full overflow-hidden">
                      <div class="h-full rounded-full transition-all duration-700"
                           [style.width.%]="contactFunnelSteps[0].value > 0 ? (step.value / contactFunnelSteps[0].value) * 100 : 0"
                           [style.background-color]="step.color">
                      </div>
                    </div>
                  </div>
                }
              </div>
            } @else if (!loading) {
              <div class="py-8 text-center text-gray-600 text-sm">Sem eventos suficientes ainda</div>
            } @else {
              <div class="py-8 text-center text-gray-500 text-sm animate-pulse">Carregando...</div>
            }
          </div>

          <div class="admin-card border rounded-xl p-5">
            <p class="text-xs text-gray-500 uppercase tracking-widest mb-1 font-semibold">CTR por CTA</p>
            <p class="text-[11px] text-gray-600 mb-4">CTA = botão ou link de ação. Ex.: contato, currículo, WhatsApp, projetos e atalhos do header.</p>
            @if (!loading && ctaPerformance.length > 0) {
              <div class="space-y-3">
                @for (row of ctaPerformance; track row.key) {
                  <div>
                    <div class="flex items-center justify-between gap-3 mb-1">
                      <div>
                        <p class="text-sm text-gray-300">{{ row.label }}</p>
                        <p class="text-[10px] text-gray-600">{{ row.uniqueSessions }} sessões · {{ row.clicks }} cliques</p>
                      </div>
                      <p class="text-sm font-bold tabular-nums" [style.color]="row.ctr >= 20 ? '#4ade80' : row.ctr >= 10 ? '#fbbf24' : accentColor">{{ row.ctr }}%</p>
                    </div>
                    <div class="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div class="h-full rounded-full transition-all duration-700"
                           [style.width.%]="row.ctr"
                           [style.background-color]="row.category === 'project' ? '#a855f7' : row.category === 'direct_contact' ? '#22c55e' : row.category === 'resume' ? '#f59e0b' : row.category === 'navigation' ? '#94a3b8' : '#22d3ee'">
                      </div>
                    </div>
                  </div>
                }
              </div>
            } @else if (!loading) {
              <div class="py-8 text-center text-gray-600 text-sm">Sem CTAs suficientes ainda</div>
            } @else {
              <div class="py-8 text-center text-gray-500 text-sm animate-pulse">Carregando...</div>
            }
          </div>
        </div>

        <!-- ── Alcance por Seção + Uso de Features ─────────────────────── -->
        <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">

          <div class="admin-card border rounded-xl p-5">
            <p class="text-xs text-gray-500 uppercase tracking-widest mb-1 font-semibold">Alcance por Seção</p>
            <p class="text-[11px] text-gray-600 mb-4">Profundidade real de leitura da página por sessão.</p>
            @if (!loading && sectionReachRows.length > 0) {
              <div class="space-y-3">
                @for (row of sectionReachRows; track row.key) {
                  <div>
                    <div class="flex items-center justify-between gap-3 mb-1">
                      <div>
                        <p class="text-sm text-gray-300">{{ row.label }}</p>
                        <p class="text-[10px] text-gray-600">{{ row.sessions }} sessões</p>
                      </div>
                      <p class="text-sm font-bold tabular-nums" [style.color]="accentColor">{{ row.reachRate }}%</p>
                    </div>
                    <div class="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div class="h-full rounded-full transition-all duration-700"
                           [style.width.%]="row.reachRate"
                           [style.background-color]="accentColor">
                      </div>
                    </div>
                  </div>
                }
              </div>
            } @else if (!loading) {
              <div class="py-8 text-center text-gray-600 text-sm">Sem seções visualizadas ainda</div>
            } @else {
              <div class="py-8 text-center text-gray-500 text-sm animate-pulse">Carregando...</div>
            }
          </div>

          <div class="admin-card border rounded-xl p-5">
            <p class="text-xs text-gray-500 uppercase tracking-widest mb-1 font-semibold">Uso das Features</p>
            <p class="text-[11px] text-gray-600 mb-4">
              {{ usingFallback ? 'Totais de uso das features (baseado nos matches registrados).' : 'Início, conclusão e abandono implícito por sessão.' }}
            </p>
            @if (!loading && featureUsageRows.length > 0) {
              <div class="space-y-4">
                @for (row of featureUsageRows; track row.key) {
                  <div class="admin-card border rounded-lg p-4">
                    <div class="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <p class="text-sm text-gray-200 font-semibold">{{ row.label }}</p>
                        <p class="text-[10px] text-gray-600">
                          {{ usingFallback ? row.completed + ' usos registrados' : row.started + ' iniciaram · ' + row.completed + ' concluíram · ' + row.abandoned + ' abandonaram' }}
                        </p>
                      </div>
                      <div class="text-right">
                        <p class="text-lg font-bold" [style.color]="row.completionRate >= 60 ? '#4ade80' : row.completionRate >= 30 ? '#fbbf24' : '#f87171'">{{ row.completionRate }}%</p>
                        <p class="text-[10px] text-gray-600">taxa de conclusão</p>
                      </div>
                    </div>
                    <div class="h-1.5 bg-gray-800 rounded-full overflow-hidden mb-2">
                      <div class="h-full rounded-full transition-all duration-700"
                           [style.width.%]="row.completionRate"
                           [style.background-color]="row.key === 'dev_match' ? '#22d3ee' : '#a855f7'">
                      </div>
                    </div>
                    <p class="text-[10px] text-gray-500">
                      Resultado médio:
                      <span class="font-semibold text-gray-300">{{ row.avgResult != null ? row.avgResult + '%' : 'sem conclusão ainda' }}</span>
                    </p>
                  </div>
                }
              </div>
            } @else if (!loading) {
              <div class="py-8 text-center text-gray-600 text-sm">Sem uso registrado ainda</div>
            } @else {
              <div class="py-8 text-center text-gray-500 text-sm animate-pulse">Carregando...</div>
            }
          </div>
        </div>

        </div>
        <!-- fim: Aba Analytics -->

        <!-- ── Aba: Conversas ───────────────────────────────────────────── -->
        <div [class.hidden]="activeTab !== 'chat'">

        <!-- ── Conversas do Chat ──────────────────────────────────────────── -->
        <div>
          <p class="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-4">Conversas do Chat</p>
          <div class="grid md:grid-cols-5 gap-4">

            <!-- Lista de conversas -->
            <div class="admin-card border rounded-xl overflow-hidden md:col-span-2">
              <div class="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
                <p class="text-xs text-gray-500 font-semibold">{{ conversations.length }} conversa(s)</p>
                @if (totalUnread > 0) {
                  <span class="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-violet-500 text-white text-[10px] font-bold">
                    {{ totalUnread }} não lida(s)
                  </span>
                }
              </div>
              @if (conversations.length === 0) {
                <div class="p-8 text-center text-gray-600 text-sm">Nenhuma conversa iniciada ainda.</div>
              }
              @for (conv of conversations; track conv.id) {
                <button (click)="selectConversation(conv)"
                        class="group w-full text-left px-4 py-3 hover:bg-gray-800/40 transition-colors border-b border-gray-800/30"
                        [class.bg-violet-500/10]="selectedConv?.id === conv.id">
                  <div class="flex items-start justify-between gap-2">
                    <div class="min-w-0 flex items-start gap-2">
                      <span class="mt-1.5 shrink-0 inline-block w-2 h-2 rounded-full"
                            [class]="conv.visitorOnline ? 'bg-green-400' : 'bg-gray-600'"></span>
                      <div class="min-w-0">
                        <p class="text-sm font-medium text-gray-200 truncate">{{ conv.company ? conv.username + ' · ' + conv.company : conv.username }}</p>
                        <p class="text-[10px] text-gray-600 mt-0.5">{{ conv.lastMessageAt | date:'dd/MM HH:mm' }}</p>
                      </div>
                    </div>
                  <div class="flex items-center gap-2 shrink-0">
                    @if (conv.unreadByOwner > 0) {
                      <span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-violet-500 text-white text-[10px] font-bold">
                        {{ conv.unreadByOwner > 9 ? '9+' : conv.unreadByOwner }}
                      </span>
                    }
                    <button (click)="$event.stopPropagation(); askDeleteConv(conv)"
                            class="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                            title="Excluir conversa">
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  </div>
                </button>
              }
            </div>

            <!-- Painel de mensagens -->
            <div class="admin-card border rounded-xl flex flex-col overflow-hidden md:col-span-3" style="height:500px">
              @if (!selectedConv) {
                <div class="flex-1 flex flex-col items-center justify-center text-gray-600 text-sm">
                  <span class="text-3xl mb-2">💬</span>
                  Selecione uma conversa para ler as mensagens.
                </div>
              } @else {
                <!-- Header da conversa -->
                <div class="px-4 py-3 border-b border-gray-800 flex items-center gap-3 shrink-0">
                  <div class="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center shrink-0">
                    <span class="text-sm">💬</span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-200">{{ selectedConv.company ? selectedConv.username + ' · ' + selectedConv.company : selectedConv.username }}</p>
                    <p class="text-xs flex items-center gap-1" [class]="selectedConv.visitorOnline ? 'text-green-400' : 'text-gray-500'">
                      <span class="inline-block w-1.5 h-1.5 rounded-full" [class]="selectedConv.visitorOnline ? 'bg-green-400' : 'bg-gray-500'"></span>
                      {{ selectedConv.visitorOnline ? 'Online' : 'Offline' }}
                    </p>
                  </div>
                  <p class="text-[10px] text-gray-600">{{ selectedConv.startedAt | date:'dd/MM/yy HH:mm' }}</p>
                  <button (click)="askDeleteConv(selectedConv)"
                          class="ml-1 p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                          title="Excluir conversa">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                <!-- Mensagens -->
                <div #convMsgContainer data-conv-msgs class="flex-1 overflow-y-auto px-4 py-3 space-y-2"
                     (click)="closeConvMessageMenu()"
                     (scroll)="closeConvMessageMenu()">
                  @if (convMessagesList.length === 0) {
                    <div class="flex items-center justify-center h-full text-gray-600 text-sm">Sem mensagens ainda.</div>
                  }
                  @for (msg of convMessagesList; track msg.id) {
                    <div [class]="msg.sender === 'visitor' ? 'group flex justify-start items-start gap-1.5' : 'group flex justify-end items-start gap-1.5'">
                      <div [class]="msg.deletedAt
                          ? 'max-w-[78%] bg-gray-700/40 text-gray-500 rounded-2xl px-3.5 py-2 text-sm italic'
                          : msg.sender === 'visitor'
                            ? 'max-w-[78%] bg-gray-700/80 text-gray-100 rounded-2xl rounded-bl-sm px-3.5 py-2 text-sm'
                            : 'max-w-[78%] bg-violet-600 text-white rounded-2xl rounded-br-sm px-3.5 py-2 text-sm'">
                        @if (msg.deletedAt) {
                          <p class="flex items-center gap-1.5">
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
                            </svg>
                            Mensagem excluída
                          </p>
                        } @else {
                          @if (msg.sender === 'visitor') {
                            <p class="text-[10px] text-gray-400 font-semibold mb-1">{{ selectedConv.username }}</p>
                          }
                          @if (editingConvMessageId === msg.id) {
                            <div class="space-y-2 min-w-[220px]" (click)="$event.stopPropagation()">
                              <textarea [(ngModel)]="editConvMessageText"
                                        (keydown)="onConvEditKeydown($event, msg)"
                                        rows="3"
                                        class="w-full bg-black/10 border border-white/15 rounded-xl px-3 py-2 text-sm text-white
                                               placeholder-white/50 focus:outline-none focus:border-white/30 resize-none"
                                        placeholder="Edite a mensagem..."></textarea>
                              <div class="flex items-center justify-end gap-2">
                                <button (click)="cancelEditConvMessage()"
                                        class="px-2.5 py-1 rounded-lg text-[11px] bg-black/15 hover:bg-black/25 transition-colors cursor-pointer">
                                  Cancelar
                                </button>
                                <button (click)="saveEditedConvMessage(msg)"
                                        [disabled]="!editConvMessageText.trim() || savingConvEdit"
                                        class="px-2.5 py-1 rounded-lg text-[11px] bg-white/15 hover:bg-white/25 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer">
                                  {{ savingConvEdit ? 'Salvando...' : 'Salvar' }}
                                </button>
                              </div>
                            </div>
                          } @else {
                            @if (msg.text) {
                              <p class="wrap-break-word whitespace-pre-wrap">{{ msg.text }}</p>
                            }
                            @if (msg.fileUrl) {
                              <a [href]="msg.fileUrl" target="_blank" rel="noopener noreferrer"
                                 class="flex items-center gap-1.5 mt-1 text-xs underline opacity-80 break-all">
                                <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                </svg>
                                {{ msg.fileName }}
                              </a>
                            }
                            <p class="text-[10px] mt-1 opacity-60 text-right">
                              {{ msg.sentAt | date:'HH:mm' }}@if (msg.editedAt) { · editada }
                            </p>
                          }
                        }
                      </div>
                      @if (msg.sender === 'owner' && !msg.deletedAt && editingConvMessageId !== msg.id) {
                        <div class="self-start mt-1 shrink-0" (click)="$event.stopPropagation()">
                          <button (click)="toggleConvMessageMenu(msg, $event)"
                                  class="text-gray-500 hover:text-white transition-colors cursor-pointer p-1 rounded-lg hover:bg-gray-700/40"
                                  title="Mais ações">
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M12 5h.01M12 12h.01M12 19h.01" />
                            </svg>
                          </button>
                        </div>
                      }
                    </div>
                  }
                </div>

                <!-- Input de resposta -->
                <div class="px-3 py-3 border-t border-gray-800/50 flex flex-col gap-2 shrink-0">
                  <!-- Arquivo selecionado -->
                  @if (pendingConvFile) {
                    <div class="flex items-center gap-2 px-2 py-1 bg-gray-700/60 rounded-lg text-xs text-gray-300">
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 shrink-0 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      <span class="flex-1 truncate">{{ pendingConvFile.name }}</span>
                      <button (click)="pendingConvFile = null" class="text-gray-500 hover:text-white cursor-pointer">✕</button>
                    </div>
                  }
                  <div class="flex items-end gap-2">
                    <input #convFileInput type="file" accept=".pdf,.jpg,.jpeg,.png" class="hidden"
                           (change)="onConvFileSelected($event)" />
                    <button (click)="convFileInput.click()"
                            [disabled]="sendingConvReply"
                            class="shrink-0 self-stretch min-w-8 px-2 rounded-xl border border-gray-700 bg-gray-800/50
                                   text-gray-400 hover:text-violet-400 hover:border-violet-500/50 transition-colors
                                   flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                    </button>
                    <textarea [(ngModel)]="convReplyText"
                              name="convReply"
                              (keydown)="onConvKeydown($event)"
                              rows="1"
                              class="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3.5 py-2.5 text-white text-sm
                                     placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors
                                     resize-none max-h-24 overflow-y-auto"
                              placeholder="Responder como Elias..."></textarea>
                    <button (click)="sendConvReply()"
                            [disabled]="(!convReplyText.trim() && !pendingConvFile) || sendingConvReply"
                            class="shrink-0 self-stretch min-w-9 px-3 rounded-xl bg-violet-600 hover:bg-violet-500
                                   disabled:opacity-40 disabled:cursor-not-allowed transition-colors
                                   flex items-center justify-center">
                      @if (sendingConvReply) {
                        <svg class="w-4 h-4 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                        </svg>
                      } @else {
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      }
                    </button>
                  </div>
                </div>
              }
            </div>

          </div>
        </div>

        </div>
        <!-- fim: Aba Conversas -->

        <!-- ── Aba: Testes ───────────────────────────────────────────── -->
        <div [class.hidden]="activeTab !== 'tests'" class="space-y-6">
          <p class="text-xs text-gray-500 uppercase tracking-widest font-semibold">Ferramentas de teste</p>

          <div class="grid md:grid-cols-2 gap-6">

            <!-- Card: Push Notification -->
            <div class="admin-card border rounded-xl p-6 space-y-4">
              <div class="flex items-center gap-3 mb-1">
                <div class="w-9 h-9 rounded-xl bg-violet-500/15 flex items-center justify-center text-lg">🔔</div>
                <div>
                  <h3 class="text-white font-semibold text-sm">Push Notification</h3>
                  <p class="text-gray-500 text-xs">Envia uma notificação de teste para este dispositivo</p>
                </div>
              </div>

              <!-- Status da permissão -->
              <div class="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/60 text-xs">
                <span class="w-2 h-2 rounded-full shrink-0"
                      [class.bg-green-400]="pushPermStatus === 'granted'"
                      [class.bg-yellow-400]="pushPermStatus === 'prompt'"
                      [class.bg-red-400]="pushPermStatus === 'denied'"
                      [class.bg-gray-500]="pushPermStatus === 'unknown'"></span>
                <span class="text-gray-400">Permissão:
                  <span class="font-semibold"
                        [class.text-green-400]="pushPermStatus === 'granted'"
                        [class.text-yellow-400]="pushPermStatus === 'prompt'"
                        [class.text-red-400]="pushPermStatus === 'denied'">
                    {{ pushPermStatus === 'granted' ? 'Concedida' : pushPermStatus === 'denied' ? 'Negada' : pushPermStatus === 'prompt' ? 'Aguardando' : 'Desconhecido' }}
                  </span>
                </span>
              </div>

              <div class="space-y-3">
                <div>
                  <label class="text-xs text-gray-400 mb-1 block">Título</label>
                  <input type="text" [(ngModel)]="testPushTitle" maxlength="80"
                         placeholder="Ex: Nova mensagem recebida"
                         class="w-full bg-gray-800/70 border border-gray-700/60 rounded-xl px-3 py-2 text-sm text-gray-200 placeholder-gray-600 outline-none focus:border-violet-500/60 transition-colors" />
                </div>
                <div>
                  <label class="text-xs text-gray-400 mb-1 block">Corpo</label>
                  <textarea [(ngModel)]="testPushBody" rows="3" maxlength="200"
                            placeholder="Ex: Um visitante iniciou uma conversa."
                            class="w-full bg-gray-800/70 border border-gray-700/60 rounded-xl px-3 py-2 text-sm text-gray-200 placeholder-gray-600 outline-none focus:border-violet-500/60 transition-colors resize-none"></textarea>
                </div>
              </div>

              @if (testPushResult) {
                <div class="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
                     [class.bg-green-500/10]="testPushResult === 'ok'"
                     [class.border-green-500/20]="testPushResult === 'ok'"
                     [class.bg-red-500/10]="testPushResult !== 'ok'"
                     [class.border-red-500/20]="testPushResult !== 'ok'"
                     style="border-width:1px">
                  <span>{{ testPushResult === 'ok' ? '✅ Notificação enviada!' : '❌ ' + testPushResult }}</span>
                </div>
              }

              <div class="flex gap-2">
                @if (pushPermStatus !== 'granted') {
                  <button (click)="requestPushPerm()"
                          class="flex-1 py-2.5 rounded-xl bg-violet-500/20 border border-violet-500/40 text-violet-300 text-sm font-semibold hover:bg-violet-500/30 transition-all">
                    Conceder permissão
                  </button>
                }
                <button (click)="sendTestPush()"
                        [disabled]="pushSending || !testPushTitle.trim() || pushPermStatus !== 'granted'"
                        class="flex-1 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  @if (pushSending) {
                    <span class="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Enviando...
                  } @else {
                    🔔 Enviar notificação
                  }
                </button>
              </div>
            </div>

            <!-- Card: Email -->
            <div class="admin-card border rounded-xl p-6 space-y-4">
              <div class="flex items-center gap-3 mb-1">
                <div class="w-9 h-9 rounded-xl bg-cyan-500/15 flex items-center justify-center text-lg">📧</div>
                <div>
                  <h3 class="text-white font-semibold text-sm">Email de teste</h3>
                  <p class="text-gray-500 text-xs">Envia um email real para <span class="text-cyan-400 font-mono">egds.dev&#64;gmail.com</span></p>
                </div>
              </div>

              <div class="space-y-3">
                <div>
                  <label class="text-xs text-gray-400 mb-1 block">Assunto</label>
                  <input type="text" [(ngModel)]="testEmailSubject" maxlength="100"
                         placeholder="Ex: Teste de email — Portfolio Admin"
                         class="w-full bg-gray-800/70 border border-gray-700/60 rounded-xl px-3 py-2 text-sm text-gray-200 placeholder-gray-600 outline-none focus:border-cyan-500/60 transition-colors" />
                </div>
                <div>
                  <label class="text-xs text-gray-400 mb-1 block">Mensagem</label>
                  <textarea [(ngModel)]="testEmailBody" rows="4" maxlength="1000"
                            placeholder="Corpo do email de teste..."
                            class="w-full bg-gray-800/70 border border-gray-700/60 rounded-xl px-3 py-2 text-sm text-gray-200 placeholder-gray-600 outline-none focus:border-cyan-500/60 transition-colors resize-none"></textarea>
                </div>
              </div>

              @if (testEmailResult) {
                <div class="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
                     [class.bg-green-500/10]="testEmailResult.startsWith('✅')"
                     [class.border-green-500/20]="testEmailResult.startsWith('✅')"
                     [class.bg-yellow-500/10]="testEmailResult.startsWith('⏳')"
                     [class.border-yellow-500/20]="testEmailResult.startsWith('⏳')"
                     [class.bg-red-500/10]="testEmailResult.startsWith('❌')"
                     [class.border-red-500/20]="testEmailResult.startsWith('❌')"
                     style="border-width:1px">
                  <span>{{ testEmailResult }}</span>
                </div>
              }

              <button (click)="sendTestEmail()"
                      [disabled]="emailSending || !testEmailSubject.trim()"
                      class="w-full py-2.5 rounded-xl bg-cyan-600 text-white text-sm font-semibold hover:bg-cyan-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                @if (emailSending) {
                  <span class="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Enviando...
                } @else {
                  📧 Enviar email de teste
                }
              </button>
            </div>

          </div>

          <!-- Card: Info FCM Token -->
          <div class="admin-card border rounded-xl p-5">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-white font-semibold text-sm">Token FCM</h3>
              <button (click)="copyFcmToken()" [disabled]="!savedFcmToken"
                      class="text-xs px-3 py-1 rounded-lg border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 transition-all disabled:opacity-40">
                {{ fcmCopied ? '✅ Copiado!' : 'Copiar' }}
              </button>
            </div>
            @if (savedFcmToken) {
              <p class="text-xs font-mono text-gray-500 break-all leading-relaxed">{{ savedFcmToken }}</p>
            } @else {
              <p class="text-xs text-gray-600">Nenhum token salvo. Ative o Push na aba principal primeiro.</p>
            }
          </div>

        </div>
        <!-- fim: Aba Testes -->

      </main>

      <!-- Dropdown flutuante do menu de mensagem (admin) -->
      @if (openConvMessageMenuId && convMenuPos) {
        <div class="fixed w-36 rounded-xl border border-gray-700 bg-gray-900 shadow-2xl z-9999"
             [style.top.px]="convMenuPos.top"
             [style.right.px]="convMenuPos.right"
             (click)="$event.stopPropagation()">
          @for (msg of convMessagesList; track msg.id) {
            @if (msg.id === openConvMessageMenuId) {
              @if (canEditConvMessage(msg)) {
                <button (click)="startEditConvMessage(msg)"
                        class="w-full px-3 py-2 text-left text-sm text-gray-200 hover:bg-gray-800 transition-colors cursor-pointer">
                  Editar
                </button>
              }
              <button (click)="askDeleteConvMessage(msg)"
                      class="w-full px-3 py-2 text-left text-sm text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer">
                Excluir
              </button>
            }
          }
        </div>
      }

      <!-- Dialog: confirmar exclusão de mensagem -->
      @if (convMsgToDelete) {
        <app-confirm-dialog
          title="Excluir mensagem"
          message="Esta mensagem será excluída para todos os participantes. Esta ação não pode ser desfeita."
          confirmLabel="Excluir"
          cancelLabel="Cancelar"
          (confirmed)="confirmDeleteConvMessage()"
          (cancelled)="cancelDeleteConvMessage()" />
      }

      <!-- Dialog: confirmar exclusão de conversa -->
      @if (convToDelete) {
        <app-confirm-dialog
          title="Excluir conversa"
          [message]="'Tem certeza que deseja excluir a conversa de ' + (convToDelete.company ? convToDelete.username + ' · ' + convToDelete.company : convToDelete.username) + '? Todas as mensagens serão removidas permanentemente.'"
          confirmLabel="Excluir"
          cancelLabel="Cancelar"
          (confirmed)="confirmDeleteConv()"
          (cancelled)="convToDelete = null" />
      }

      <!-- Toast: nova mensagem de visitante -->
      @if (adminToastMsg) {
        <div class="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-gray-900 border border-violet-500/50
                    rounded-2xl shadow-2xl px-4 py-3 max-w-xs animate-[slideUp_0.3s_ease-out]">
          <div class="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center shrink-0">
            <span class="text-sm">💬</span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-xs font-semibold text-violet-400">{{ adminToastConvName }}</p>
            <p class="text-sm text-gray-200">Nova mensagem</p>
          </div>
          <button (click)="openAdminToastConv()"
                  class="shrink-0 text-xs bg-violet-600 hover:bg-violet-500 text-white px-2.5 py-1 rounded-lg transition-colors cursor-pointer">
            Abrir
          </button>
          <button (click)="dismissAdminToast()"
                  class="shrink-0 text-gray-500 hover:text-white transition-colors cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .map-dark-invert .leaflet-layer,
    .map-dark-invert .leaflet-control-zoom-in,
    .map-dark-invert .leaflet-control-zoom-out,
    .map-dark-invert .leaflet-control-attribution {
      filter: brightness(1.55) contrast(0.75) saturate(0.65);
    }

    .access-row-clickable {
      cursor: pointer;
    }

    .access-row-clickable:hover {
      background: rgba(148, 163, 184, 0.08);
    }

    .access-row-selected {
      background: rgba(34, 211, 238, 0.12);
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
  private mapMarkers = new Map<string, L.CircleMarker>();
  private lineChartInstance?: Chart;
  private themeObserver?: MutationObserver;

  private firebase = inject(FirebaseService);
  private cdr = inject(ChangeDetectorRef);
  private zone = inject(NgZone);
  @ViewChild('convMsgContainer') convMsgContainer?: ElementRef<HTMLDivElement>;

  aiMatches: AiMatchRecord[] = [];
  devMatches: DevMatchRecord[] = [];
  visitors: VisitorRecord[] = [];
  analyticsEvents: AnalyticsEventRecord[] = [];
  accessRows: AccessTableRow[] = [];
  visitorMap = new Map<string, VisitorRecord>();
  loading = true;
  uniqueCountries = 0;
  mobileCount = 0;
  today = new Date();
  hasMapCoords = false;
  bruliasClicks = 0;
  bruliasClicksByIp = new Map<string, number>();
  currentPage = 1;
  readonly pageSize = 10;
  selectedAccessRowKey: string | null = null;
  selectedVisitorId: string | null = null;
  sourceConversions: SourceConversionRow[] = [];
  ctaPerformance: CtaPerformanceRow[] = [];
  sectionReachRows: SectionReachRow[] = [];
  featureUsageRows: FeatureUsageRow[] = [];
  contactFunnelSteps: { label: string; value: number; color: string }[] = [];
  firstActionAvgSeconds = 0;
  firstActionMedianSeconds = 0;
  firstActionBySource: TimeToActionRow[] = [];
  analyticsEventCount = 0;
  usingFallback = false;

  private readonly OWNER_IPS = ['45.179.22.183', '138.255.215.188'];

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
  readonly legendSteps = [0.1, 0.3, 0.5, 0.75, 1.0];
  readonly cellSize = 18;

  // ── Tabs ─────────────────────────────────────────────────────────────
  activeTab: 'analytics' | 'chat' | 'tests' = 'analytics';

  // ── Chat ────────────────────────────────────────────────────────────
  conversations: ChatConversation[] = [];
  selectedConvId: string | null = null;
  get selectedConv(): ChatConversation | null {
    return this.conversations.find(c => c.id === this.selectedConvId) ?? null;
  }
  convMessagesList: ChatMessage[] = [];
  convReplyText = '';
  sendingConvReply = false;
  pendingConvFile: File | null = null;
  convMsgToDelete: ChatMessage | null = null;
  openConvMessageMenuId: string | null = null;
  convMenuPos: {top: number; right: number} | null = null;
  editingConvMessageId: string | null = null;
  editConvMessageText = '';
  savingConvEdit = false;
  private readonly ALLOWED_EXT = ['.pdf', '.jpg', '.jpeg', '.png'];
  pushEnabled = false;
  pushLoading = false;
  get totalUnread(): number { return this.conversations.reduce((s, c) => s + c.unreadByOwner, 0); }

  // ── Painel de Testes ─────────────────────────────────────────────────
  testPushTitle = 'Notificação de teste';
  testPushBody = 'Tudo certo! O push do portfolio está funcionando.';
  testPushResult = '';
  pushSending = false;
  pushPermStatus: 'granted' | 'denied' | 'prompt' | 'unknown' = 'unknown';
  savedFcmToken: string | null = null;
  fcmCopied = false;
  testEmailSubject = '🧪 Teste de email — Portfolio Admin';
  testEmailBody = 'Esta é uma mensagem de teste enviada pelo painel administrativo do portfolio.';
  testEmailResult = '';
  emailSending = false;
  private unsubTestEmail?: () => void;
  private unsubConversations?: () => void;
  private unsubConvMessages?: () => void;

  // ── Admin toast (nova mensagem) ─────────────────────────────────────
  adminToastMsg = '';
  adminToastConvName = '';
  adminToastConvId = '';
  private adminToastTimer?: ReturnType<typeof setTimeout>;
  private knownUnreadByConv = new Map<string, number>();
  private hasInitializedKnownUnread = false;

  // ── Delete ──────────────────────────────────────────────────────────
  deleteTarget: AccessTableRow | null = null;
  deleting = false;
  convToDelete: ChatConversation | null = null;
  deletingConv = false;

  async ngOnInit(): Promise<void> {
    void this.firebase.setOwnerOnline(true);
    // Verifica se já tem token FCM salvo
    const token = await this.firebase.getSavedFCMToken();
    this.pushEnabled = !!token;
    this.savedFcmToken = token;
    this.checkPushPermission();
    const settle = <T>(p: Promise<T>, fallback: T) =>
      p.catch((err: unknown) => { console.error('[Dashboard]', err); return fallback; });

    const [aiMatches, devMatches, visitors, bruliasClickList, analyticsEvents] = await Promise.all([
      settle(this.firebase.getAiMatches(), [] as AiMatchRecord[]),
      settle(this.firebase.getDevMatches(), [] as DevMatchRecord[]),
      settle(this.firebase.getVisitors(), [] as VisitorRecord[]),
      settle(this.firebase.getBruliasClicks(), [] as { ip: string; createdAt: Date }[]),
      settle(this.firebase.getAnalyticsEvents(), [] as AnalyticsEventRecord[]),
    ]);

    const ignoredVisitorIds = new Set(
      visitors
        .filter(v => v.id && this.OWNER_IPS.includes(v.ip))
        .map(v => v.id!),
    );

    this.aiMatches = aiMatches.filter(m => !m.visitorId || !ignoredVisitorIds.has(m.visitorId));
    this.devMatches = devMatches.filter(m => !m.visitorId || !ignoredVisitorIds.has(m.visitorId));
    this.visitors = visitors.filter(v => !this.OWNER_IPS.includes(v.ip));
    this.analyticsEvents = analyticsEvents.filter(event => {
      if (event.ip && this.OWNER_IPS.includes(event.ip)) return false;
      if (event.visitorId && ignoredVisitorIds.has(event.visitorId)) return false;
      return true;
    });
    const filteredBrulias = bruliasClickList.filter(c => !this.OWNER_IPS.includes(c.ip));
    this.bruliasClicks = filteredBrulias.length;
    this.bruliasClicksByIp = filteredBrulias.reduce((map, c) => {
      map.set(c.ip, (map.get(c.ip) ?? 0) + 1);
      return map;
    }, new Map<string, number>());

    this.loading = false;
    this.rebuildDashboardState();
    this.cdr.detectChanges();
    setTimeout(() => {
      this.initLineChart();
      this.initMap();
    }, 50);

    // Listener em tempo real das conversas
    this.unsubConversations = this.firebase.listenToConversations(convs => {
      this.zone.run(() => {
        if (!this.hasInitializedKnownUnread) {
          // Primeira carga: apenas inicializa sem mostrar toast
          for (const conv of convs) {
            if (conv.id) this.knownUnreadByConv.set(conv.id, conv.unreadByOwner);
          }
          this.hasInitializedKnownUnread = true;
        } else {
          // Atualizações posteriores: detecta novas mensagens
          for (const conv of convs) {
            if (!conv.id) continue;
            const prev = this.knownUnreadByConv.get(conv.id) ?? 0;
            if (conv.unreadByOwner > prev && this.selectedConvId !== conv.id) {
              this.showAdminToast(conv.username, conv.id);
            }
            this.knownUnreadByConv.set(conv.id, conv.unreadByOwner);
          }
        }
        this.conversations = convs;
        this.cdr.detectChanges();
      });
    });
  }

  ngAfterViewInit(): void {}

  // ── Push Notifications ───────────────────────────────────────────────
  async togglePushNotifications(): Promise<void> {
    if (this.pushLoading) return;
    this.pushLoading = true;
    try {
      const token = await this.firebase.requestPushPermission();
      this.pushEnabled = !!token;
      if (token) {
        this.savedFcmToken = token;
        this.pushPermStatus = 'granted';
      } else {
        alert('Permissão negada ou navegador não suportado.');
      }
    } finally {
      this.pushLoading = false;
      this.cdr.detectChanges();
    }
  }

  // ── Métodos do Painel de Testes ───────────────────────────────────────
  private checkPushPermission(): void {
    if (!('Notification' in window)) {
      this.pushPermStatus = 'unknown';
      return;
    }
    this.pushPermStatus = Notification.permission as 'granted' | 'denied' | 'prompt';
    if (this.pushPermStatus === 'granted') this.pushEnabled = true;
  }

  async requestPushPerm(): Promise<void> {
    const perm = await Notification.requestPermission();
    this.pushPermStatus = perm as 'granted' | 'denied' | 'prompt';
    if (perm === 'granted') {
      this.pushEnabled = true;
      // Tenta registrar FCM token em background
      void this.firebase.requestPushPermission().then(token => {
        if (token) this.savedFcmToken = token;
        this.cdr.detectChanges();
      });
    }
    this.cdr.detectChanges();
  }

  sendTestPush(): void {
    if (this.pushSending || !this.testPushTitle.trim() || this.pushPermStatus !== 'granted') return;
    this.pushSending = true;
    this.testPushResult = '';
    try {
      new Notification(this.testPushTitle, {
        body: this.testPushBody,
        icon: '/portfolio/icons/icon-192x192.png',
      });
      this.testPushResult = 'ok';
    } catch (err) {
      this.testPushResult = err instanceof Error ? err.message : 'Erro ao enviar notificação';
    } finally {
      this.pushSending = false;
      this.cdr.detectChanges();
    }
    setTimeout(() => { this.testPushResult = ''; this.cdr.detectChanges(); }, 5000);
  }

  async sendTestEmail(): Promise<void> {
    if (this.emailSending || !this.testEmailSubject.trim()) return;
    this.emailSending = true;
    this.testEmailResult = '⏳ Enviando via Cloud Function...';
    this.cdr.detectChanges();

    // Cancela listener anterior se houver
    this.unsubTestEmail?.();

    try {
      const docId = await this.firebase.queueTestEmail(this.testEmailSubject, this.testEmailBody);

      // Aguarda status da Cloud Function (timeout de 15s)
      const timeout = setTimeout(() => {
        this.unsubTestEmail?.();
        this.emailSending = false;
        this.testEmailResult = '⏳ Email enfileirado — verifique sua caixa em breve';
        this.cdr.detectChanges();
        setTimeout(() => { this.testEmailResult = ''; this.cdr.detectChanges(); }, 8000);
      }, 15000);

      this.unsubTestEmail = this.firebase.listenTestNotificationStatus(docId, (status, error) => {
        clearTimeout(timeout);
        this.unsubTestEmail?.();
        this.emailSending = false;
        this.testEmailResult = status === 'sent'
          ? '✅ Email enviado para egds.dev@gmail.com!'
          : `❌ Erro: ${error ?? 'falha no envio'}`;
        this.cdr.detectChanges();
        setTimeout(() => { this.testEmailResult = ''; this.cdr.detectChanges(); }, 8000);
      });
    } catch (err) {
      this.emailSending = false;
      this.testEmailResult = `❌ ${err instanceof Error ? err.message : 'Erro ao enfileirar email'}`;
      this.cdr.detectChanges();
      setTimeout(() => { this.testEmailResult = ''; this.cdr.detectChanges(); }, 8000);
    }
  }

  async copyFcmToken(): Promise<void> {
    if (!this.savedFcmToken) return;
    await navigator.clipboard.writeText(this.savedFcmToken);
    this.fcmCopied = true;
    this.cdr.detectChanges();
    setTimeout(() => { this.fcmCopied = false; this.cdr.detectChanges(); }, 2500);
  }

  // ── Chat methods ────────────────────────────────────────────────────────
  selectConversation(conv: ChatConversation): void {
    this.selectedConvId = conv.id!;
    this.closeConvMessageMenu();
    this.cancelEditConvMessage();
    this.unsubConvMessages?.();
    this.convMessagesList = [];
    this.unsubConvMessages = this.firebase.listenToChatMessages(conv.id!, msgs => {
      this.zone.run(() => {
        this.convMessagesList = msgs;
        this.scrollConvToBottom();
        this.cdr.detectChanges();
      });
    });
    if (conv.unreadByOwner > 0) {
      void this.firebase.markConversationRead(conv.id!);
    }
  }

  onConvFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!this.ALLOWED_EXT.includes(ext)) return;
    if (file.size > 10 * 1024 * 1024) { alert('Arquivo deve ter no máximo 10 MB.'); return; }
    this.pendingConvFile = file;
  }

  async sendConvReply(): Promise<void> {
    const text = this.convReplyText.trim();
    if ((!text && !this.pendingConvFile) || !this.selectedConv || this.sendingConvReply) return;
    this.convReplyText = '';
    const fileToSend = this.pendingConvFile;
    this.pendingConvFile = null;
    this.sendingConvReply = true;
    this.cdr.detectChanges();
    try {
      let fileAttachment: { url: string; name: string } | undefined;
      if (fileToSend) {
        fileAttachment = await this.firebase.uploadChatFile(this.selectedConv.id!, fileToSend);
      }
      await this.firebase.sendChatMessage(this.selectedConv.id!, text, 'owner', fileAttachment);
    } finally {
      this.sendingConvReply = false;
      this.cdr.detectChanges();
    }
  }

  onConvKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void this.sendConvReply();
    }
  }

  askDeleteConvMessage(msg: ChatMessage): void {
    this.closeConvMessageMenu();
    if (this.editingConvMessageId === msg.id) this.cancelEditConvMessage();
    this.convMsgToDelete = msg;
  }

  cancelDeleteConvMessage(): void {
    this.convMsgToDelete = null;
  }

  async confirmDeleteConvMessage(): Promise<void> {
    const msg = this.convMsgToDelete;
    if (!msg?.id || !this.selectedConvId) { this.convMsgToDelete = null; return; }
    this.convMsgToDelete = null;
    await this.firebase.softDeleteChatMessage(this.selectedConvId, msg.id);
  }

  askDeleteConv(conv: ChatConversation): void {
    this.convToDelete = conv;
  }

  async confirmDeleteConv(): Promise<void> {
    const conv = this.convToDelete;
    if (!conv?.id || this.deletingConv) return;
    this.deletingConv = true;
    this.convToDelete = null;
    try {
      if (this.selectedConvId === conv.id) {
        this.selectedConvId = null;
        this.unsubConvMessages?.();
        this.convMessagesList = [];
      }
      await this.firebase.deleteConversation(conv.id);
    } finally {
      this.deletingConv = false;
      this.cdr.detectChanges();
    }
  }

  toggleConvMessageMenu(msg: ChatMessage, event: MouseEvent): void {
    event.stopPropagation();
    if (!msg.id) return;
    if (this.openConvMessageMenuId === msg.id) {
      this.openConvMessageMenuId = null;
      this.convMenuPos = null;
    } else {
      const btn = event.currentTarget as HTMLElement;
      const rect = btn.getBoundingClientRect();
      this.convMenuPos = { top: rect.bottom + 4, right: window.innerWidth - rect.right };
      this.openConvMessageMenuId = msg.id;
    }
    this.cdr.detectChanges();
  }

  closeConvMessageMenu(): void {
    this.openConvMessageMenuId = null;
    this.convMenuPos = null;
  }

  canEditConvMessage(msg: ChatMessage): boolean {
    return msg.sender === 'owner' && !msg.deletedAt && !msg.fileUrl && isChatMessageWithinEditWindow(msg.sentAt);
  }

  startEditConvMessage(msg: ChatMessage): void {
    if (!msg.id || !this.canEditConvMessage(msg)) return;
    this.closeConvMessageMenu();
    this.editingConvMessageId = msg.id;
    this.editConvMessageText = msg.text;
  }

  cancelEditConvMessage(): void {
    this.editingConvMessageId = null;
    this.editConvMessageText = '';
  }

  async saveEditedConvMessage(msg: ChatMessage): Promise<void> {
    const text = this.editConvMessageText.trim();
    if (!this.canEditConvMessage(msg)) {
      this.cancelEditConvMessage();
      return;
    }
    if (!msg.id || !this.selectedConvId || !text || this.savingConvEdit) return;
    this.savingConvEdit = true;
    this.cdr.detectChanges();
    try {
      await this.firebase.updateChatMessage(this.selectedConvId, msg.id, text);
      this.cancelEditConvMessage();
    } finally {
      this.savingConvEdit = false;
      this.cdr.detectChanges();
    }
  }

  onConvEditKeydown(event: KeyboardEvent, msg: ChatMessage): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.cancelEditConvMessage();
      return;
    }
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void this.saveEditedConvMessage(msg);
    }
  }

  private scrollConvToBottom(): void {
    window.setTimeout(() => {
      const el = document.querySelector<HTMLDivElement>('[data-conv-msgs]');
      if (el) el.scrollTop = el.scrollHeight;
    }, 60);
  }

  ngOnDestroy(): void {
    void this.firebase.setOwnerOnline(false);
    this.lineChartInstance?.destroy();
    this.themeObserver?.disconnect();
    this.leafletMap?.remove();
    this.mapMarkers.clear();
    this.unsubConversations?.();
    this.unsubConvMessages?.();
    this.unsubTestEmail?.();
    clearTimeout(this.adminToastTimer);
    this.knownUnreadByConv.clear();
  }

  showAdminToast(username: string, convId: string): void {
    clearTimeout(this.adminToastTimer);
    this.adminToastConvName = username;
    this.adminToastConvId = convId;
    this.adminToastMsg = `Nova mensagem de ${username}`;
    this.adminToastTimer = setTimeout(() => {
      this.adminToastMsg = '';
      this.cdr.detectChanges();
    }, 8000);
    this.cdr.detectChanges();
  }

  openAdminToastConv(): void {
    clearTimeout(this.adminToastTimer);
    this.adminToastMsg = '';
    const conv = this.conversations.find(c => c.id === this.adminToastConvId);
    if (conv) {
      this.activeTab = 'chat';
      this.selectConversation(conv);
    }
    this.cdr.detectChanges();
  }

  dismissAdminToast(): void {
    clearTimeout(this.adminToastTimer);
    this.adminToastMsg = '';
    this.cdr.detectChanges();
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
    this.mapMarkers.clear();
    if (!withCoords.length || !this.mapEl?.nativeElement) {
      this.leafletMap?.remove();
      this.leafletMap = undefined;
      return;
    }
    if (this.leafletMap) {
      this.leafletMap.remove();
      this.leafletMap = undefined;
    }

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
      const marker = L.circleMarker([lat, lng], this.buildMapMarkerStyle(v, v.id === this.selectedVisitorId))
        .bindTooltip(markerContent, {
          direction: 'top',
          sticky: true,
          opacity: 0.95,
        })
        .bindPopup(markerContent)
        .addTo(this.leafletMap!);

      if (v.id) {
        this.mapMarkers.set(v.id, marker);
      }
    }

    const selectedVisitor = this.selectedVisitorId ? this.visitorMap.get(this.selectedVisitorId) : undefined;
    if (this.hasCoordinates(selectedVisitor)) {
      this.focusVisitorOnMap(selectedVisitor, false);
      return;
    }

    if (bounds.length === 1) {
      this.leafletMap.setView(bounds[0], 5);
    } else {
      this.leafletMap.fitBounds(bounds, { padding: [30, 30] });
    }
  }

  focusRowOnMap(row: AccessTableRow): void {
    const visitor = this.resolveRowMapVisitor(row);
    if (!this.hasCoordinates(visitor)) return;

    this.selectedAccessRowKey = row.key;
    this.selectedVisitorId = visitor.id ?? null;
    this.focusVisitorOnMap(visitor, true);
  }

  hasMapTarget(row: AccessTableRow): boolean {
    return this.resolveRowMapVisitor(row) != null;
  }

  rowMapHint(row: AccessTableRow): string | null {
    return this.hasMapTarget(row) ? 'Clique para focar este acesso no mapa' : null;
  }

  confirmDelete(row: AccessTableRow): void {
    this.deleteTarget = row;
  }

  cancelDelete(): void {
    if (this.deleting) return;
    this.deleteTarget = null;
  }

  async executeDelete(): Promise<void> {
    if (this.deleteTarget == null || this.deleteTarget.visitorIds.length === 0 || this.deleting) return;
    this.deleting = true;
    try {
      const targetVisitorIds = new Set(this.deleteTarget.visitorIds);
      await this.firebase.deleteVisitorsByIds([...targetVisitorIds]);
      this.visitors = this.visitors.filter(v => !v.id || !targetVisitorIds.has(v.id));
      this.aiMatches = this.aiMatches.filter(m => !m.visitorId || !targetVisitorIds.has(m.visitorId));
      this.devMatches = this.devMatches.filter(m => !m.visitorId || !targetVisitorIds.has(m.visitorId));
      this.analyticsEvents = this.analyticsEvents.filter(e => !e.visitorId || !targetVisitorIds.has(e.visitorId));
      this.rebuildDashboardState();
      this.deleteTarget = null;
      this.initLineChart();
      this.initMap();
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

  get paginatedAccessRows(): AccessTableRow[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.accessRows.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.accessRows.length / this.pageSize));
  }

  get pageStart(): number {
    if (this.accessRows.length === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get pageEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.accessRows.length);
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage -= 1;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage += 1;
    }
  }

  private buildAccessRows(): AccessTableRow[] {
    const seenVisitors = new Set<string>();
    const visitorRowKeys = new Map<string, string>();
    const rows = new Map<string, AccessTableRow>();
    const orphanRows: AccessTableRow[] = [];

    for (const visitor of this.visitors) {
      if (!visitor.id) continue;
      seenVisitors.add(visitor.id);
      const ip = visitor.ip?.trim() || undefined;
      const resolution = this.buildResolutionLabel(visitor);
      const key = ip ? `ip:${ip}|res:${resolution}` : `visitor:${visitor.id}|res:${resolution}`;
      visitorRowKeys.set(visitor.id, key);

      const currentRow = rows.get(key);
      const visitCount = Math.max(visitor.visitCount ?? 1, 1);
      const lastSeen = new Date(visitor.lastSeen);

      if (!currentRow) {
        rows.set(key, {
          key,
          date: lastSeen,
          ip,
          resolution,
          accessCount: visitCount,
          visitorIds: [visitor.id],
          visitor,
        });
        continue;
      }

      currentRow.accessCount += visitCount;
      if (!currentRow.visitorIds.includes(visitor.id)) {
        currentRow.visitorIds.push(visitor.id);
      }
      if (lastSeen.getTime() >= currentRow.date.getTime()) {
        currentRow.date = lastSeen;
        currentRow.visitor = visitor;
      }
    }

    // matches sem visitante associado (dados antigos sem visitorId)
    for (const m of this.aiMatches) {
      if (!m.visitorId || !seenVisitors.has(m.visitorId)) {
        orphanRows.push({
          key: `legacy-ai:${m.id ?? orphanRows.length}`,
          date: new Date(m.createdAt),
          resolution: '-',
          accessCount: 0,
          visitorIds: [],
          aiMatch: m,
        });
        continue;
      }

      const key = visitorRowKeys.get(m.visitorId);
      if (!key) continue;
      const row = rows.get(key);
      if (!row) continue;
      if (!row.aiMatch || new Date(m.createdAt).getTime() > new Date(row.aiMatch.createdAt).getTime()) {
        row.aiMatch = m;
      }
      const createdAt = new Date(m.createdAt);
      if (createdAt.getTime() > row.date.getTime()) {
        row.date = createdAt;
      }
    }
    for (const m of this.devMatches) {
      if (!m.visitorId || !seenVisitors.has(m.visitorId)) {
        orphanRows.push({
          key: `legacy-dev:${m.id ?? orphanRows.length}`,
          date: new Date(m.createdAt),
          resolution: '-',
          accessCount: 0,
          visitorIds: [],
          devMatch: m,
        });
        continue;
      }

      const key = visitorRowKeys.get(m.visitorId);
      if (!key) continue;
      const row = rows.get(key);
      if (!row) continue;
      if (!row.devMatch || new Date(m.createdAt).getTime() > new Date(row.devMatch.createdAt).getTime()) {
        row.devMatch = m;
      }
      const createdAt = new Date(m.createdAt);
      if (createdAt.getTime() > row.date.getTime()) {
        row.date = createdAt;
      }
    }

    return [...rows.values(), ...orphanRows]
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  private rebuildDashboardState(): void {
    this.accessRows = this.buildAccessRows();
    this.visitorMap = new Map(this.visitors.filter(v => v.id).map(v => [v.id!, v]));
    this.uniqueCountries = new Set(this.visitors.map(v => v.country).filter(Boolean)).size;
    this.mobileCount = this.visitors.filter(v => this.isMobile(v.userAgent)).length;
    this.hasMapCoords = this.visitors.some(v => v.lat != null && v.lng != null);
    this.currentPage = Math.min(this.currentPage, this.totalPages);
    this.syncSelectedMapTarget();
    this.computeExtraStats();
    this.computeAnalyticsInsights();
  }

  private buildResolutionLabel(visitor: VisitorRecord): string {
    if (visitor.screenWidth != null && visitor.screenHeight != null) {
      return `${visitor.screenWidth}x${visitor.screenHeight}`;
    }
    return 'sem resolução';
  }

  private computeAnalyticsInsights(): void {
    this.analyticsEventCount = this.analyticsEvents.length;

    if (!this.analyticsEvents.length) {
      this.usingFallback = true;
      this.computeInsightsFallback();
      return;
    }

    this.usingFallback = false;

    const pageVisitsBySession = new Map<string, number>();
    const sessionSource = new Map<string, string>();
    const sectionSessions = new Map<string, Set<string>>();
    const sourceVisits = new Map<string, Set<string>>();
    const sourceProjectClicks = new Map<string, Set<string>>();
    const sourceContactIntents = new Map<string, Set<string>>();
    const sourceDirectContacts = new Map<string, Set<string>>();
    const sourceResumeDownloads = new Map<string, Set<string>>();
    const ctaRows = new Map<string, { label: string; category: string; section: string; clicks: number; sessions: Set<string> }>();
    const featureStarts = new Map<string, Set<string>>();
    const featureCompletes = new Map<string, { sessions: Set<string>; values: number[] }>();
    const firstActionsBySession = new Map<string, number>();

    const sortedEvents = [...this.analyticsEvents].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    for (const event of sortedEvents) {
      if (!event.sessionId) continue;

      const sessionId = event.sessionId;
      const source = event.source || 'Direto';
      if (!sessionSource.has(sessionId)) {
        sessionSource.set(sessionId, source);
      }

      if (event.eventType === 'page_visit') {
        if (!pageVisitsBySession.has(sessionId)) {
          pageVisitsBySession.set(sessionId, event.createdAt.getTime());
        }
        this.addSessionToMap(sourceVisits, source, sessionId);
      }

      if (event.eventType === 'section_view' && event.section) {
        this.addSessionToMap(sectionSessions, event.section, sessionId);
      }

      if (event.eventType === 'cta_click') {
        const category = this.getEventCategory(event);
        const key = event.target || event.eventName;
        const existing = ctaRows.get(key) ?? {
          label: this.ctaLabel(key),
          category,
          section: event.section || 'detalhes',
          clicks: 0,
          sessions: new Set<string>(),
        };
        existing.clicks += 1;
        existing.sessions.add(sessionId);
        existing.section = event.section || existing.section;
        existing.category = category;
        ctaRows.set(key, existing);

        if ((category === 'project' || category === 'contact' || category === 'direct_contact' || category === 'resume')
          && !firstActionsBySession.has(sessionId)) {
          firstActionsBySession.set(sessionId, event.createdAt.getTime());
        }

        if (category === 'project') this.addSessionToMap(sourceProjectClicks, source, sessionId);
        if (category === 'contact' || category === 'direct_contact') this.addSessionToMap(sourceContactIntents, source, sessionId);
        if (category === 'direct_contact') this.addSessionToMap(sourceDirectContacts, source, sessionId);
        if (category === 'resume') this.addSessionToMap(sourceResumeDownloads, source, sessionId);
      }

      if (event.eventType === 'feature_start') {
        this.addSessionToMap(featureStarts, event.eventName, sessionId);
        if (!firstActionsBySession.has(sessionId)) {
          firstActionsBySession.set(sessionId, event.createdAt.getTime());
        }
      }

      if (event.eventType === 'feature_complete') {
        const feature = featureCompletes.get(event.eventName) ?? { sessions: new Set<string>(), values: [] };
        feature.sessions.add(sessionId);
        if (typeof event.value === 'number') {
          feature.values.push(event.value);
        }
        featureCompletes.set(event.eventName, feature);
        if (!firstActionsBySession.has(sessionId)) {
          firstActionsBySession.set(sessionId, event.createdAt.getTime());
        }
      }
    }

    const totalVisitSessions = pageVisitsBySession.size;
    const allSources = new Set<string>([
      ...sourceVisits.keys(),
      ...sourceProjectClicks.keys(),
      ...sourceContactIntents.keys(),
      ...sourceDirectContacts.keys(),
      ...sourceResumeDownloads.keys(),
    ]);

    this.sourceConversions = [...allSources].map(source => {
      const visits = sourceVisits.get(source)?.size ?? 0;
      const projectClicks = sourceProjectClicks.get(source)?.size ?? 0;
      const contactIntents = sourceContactIntents.get(source)?.size ?? 0;
      const directContacts = sourceDirectContacts.get(source)?.size ?? 0;
      const resumeDownloads = sourceResumeDownloads.get(source)?.size ?? 0;
      return {
        source,
        visits,
        projectClicks,
        contactIntents,
        directContacts,
        resumeDownloads,
        conversionRate: visits > 0 ? Math.round((directContacts / visits) * 100) : 0,
      };
    }).sort((a, b) => b.visits - a.visits || b.directContacts - a.directContacts);

    this.ctaPerformance = [...ctaRows.entries()]
      .map(([key, row]) => {
        const impressions = row.section === 'detalhes'
          ? totalVisitSessions
          : (sectionSessions.get(row.section)?.size ?? totalVisitSessions);
        const uniqueSessions = row.sessions.size;
        return {
          key,
          label: row.label,
          category: row.category,
          clicks: row.clicks,
          uniqueSessions,
          impressions,
          ctr: impressions > 0 ? Math.round((uniqueSessions / impressions) * 100) : 0,
        } satisfies CtaPerformanceRow;
      })
      .sort((a, b) => b.uniqueSessions - a.uniqueSessions || b.clicks - a.clicks);

    const orderedSections = [
      'detalhes',
      'escolaridade',
      'experiencia',
      'habilidades',
      'projetos',
      'dev-match',
      'certificacoes',
      'contato',
    ];
    this.sectionReachRows = orderedSections.map(section => {
      const sessions = sectionSessions.get(section)?.size ?? 0;
      return {
        key: section,
        label: this.sectionLabel(section),
        sessions,
        reachRate: totalVisitSessions > 0 ? Math.round((sessions / totalVisitSessions) * 100) : 0,
      };
    });

    const projectSessions = sectionSessions.get('projetos')?.size ?? 0;
    const contactSectionSessions = sectionSessions.get('contato')?.size ?? 0;
    const contactIntentSessions = new Set<string>([
      ...(this.collectSessionsByCategory(ctaRows, 'contact')),
      ...(this.collectSessionsByCategory(ctaRows, 'direct_contact')),
    ]).size;
    const directContactSessions = this.collectSessionsByCategory(ctaRows, 'direct_contact').length;

    this.contactFunnelSteps = [
      { label: 'Sessões', value: totalVisitSessions, color: '#7c3aed' },
      { label: 'Viram Projetos', value: projectSessions, color: '#8b5cf6' },
      { label: 'Viram Contato', value: contactSectionSessions, color: '#a855f7' },
      { label: 'Clicaram CTA', value: contactIntentSessions, color: '#c084fc' },
      { label: 'Contato Direto', value: directContactSessions, color: '#22d3ee' },
    ];

    const durations: number[] = [];
    const durationsBySource = new Map<string, number[]>();
    for (const [sessionId, visitTs] of pageVisitsBySession.entries()) {
      const actionTs = firstActionsBySession.get(sessionId);
      if (actionTs == null || actionTs < visitTs) continue;

      const diffSeconds = Math.max(0, Math.round((actionTs - visitTs) / 1000));
      durations.push(diffSeconds);
      const source = sessionSource.get(sessionId) ?? 'Direto';
      const sourceDurations = durationsBySource.get(source) ?? [];
      sourceDurations.push(diffSeconds);
      durationsBySource.set(source, sourceDurations);
    }

    this.firstActionAvgSeconds = durations.length > 0
      ? Math.round(durations.reduce((sum, value) => sum + value, 0) / durations.length)
      : 0;
    const sortedDurations = [...durations].sort((a, b) => a - b);
    this.firstActionMedianSeconds = sortedDurations.length > 0
      ? sortedDurations[Math.floor(sortedDurations.length / 2)]
      : 0;
    this.firstActionBySource = [...durationsBySource.entries()]
      .map(([source, values]) => ({
        source,
        sessions: values.length,
        avgSeconds: Math.round(values.reduce((sum, value) => sum + value, 0) / values.length),
      }))
      .sort((a, b) => a.avgSeconds - b.avgSeconds)
      .slice(0, 5);

    const featureLabels: Record<string, string> = {
      dev_match: 'Monte seu Dev',
      ai_match: 'Match por IA',
    };
    this.featureUsageRows = Object.entries(featureLabels).map(([key, label]) => {
      const started = featureStarts.get(key)?.size ?? 0;
      const completionInfo = featureCompletes.get(key) ?? { sessions: new Set<string>(), values: [] };
      const completed = completionInfo.sessions.size;
      return {
        key,
        label,
        started,
        completed,
        abandoned: Math.max(0, started - completed),
        completionRate: started > 0 ? Math.round((completed / started) * 100) : 0,
        avgResult: completionInfo.values.length > 0
          ? Math.round(completionInfo.values.reduce((sum, value) => sum + value, 0) / completionInfo.values.length)
          : null,
      };
    });
  }

  private computeInsightsFallback(): void {
    // Origem: derivada do campo referrer dos visitantes
    const sourceCounts = new Map<string, number>();
    for (const visitor of this.visitors) {
      const source = this.resolveSourceFromReferrer(visitor.referrer);
      sourceCounts.set(source, (sourceCounts.get(source) ?? 0) + visitor.visitCount);
    }
    this.sourceConversions = [...sourceCounts.entries()]
      .map(([source, visits]) => ({
        source,
        visits,
        projectClicks: 0,
        contactIntents: 0,
        directContacts: 0,
        resumeDownloads: 0,
        conversionRate: 0,
      }))
      .sort((a, b) => b.visits - a.visits);

    // Funil: usa visitantes + uso de features
    const aiUniq = new Set(this.aiMatches.map(m => m.visitorId).filter(Boolean)).size;
    const devUniq = new Set(this.devMatches.map(m => m.visitorId).filter(Boolean)).size;
    this.contactFunnelSteps = [
      { label: 'Visitantes Únicos', value: this.visitors.length, color: '#7c3aed' },
      { label: 'Usaram IA Match',  value: aiUniq,               color: '#a855f7' },
      { label: 'Usaram Dev Match', value: devUniq,              color: '#22d3ee' },
    ];

    // Feature usage: baseada nos matches registrados
    const aiAvg = this.aiMatches.length > 0
      ? Math.round(this.aiMatches.reduce((s, m) => s + m.matchPercentage, 0) / this.aiMatches.length) : null;
    const devAvg = this.devMatches.length > 0
      ? Math.round(this.devMatches.reduce((s, m) => s + m.matchPercentage, 0) / this.devMatches.length) : null;

    this.featureUsageRows = [
      { key: 'ai_match',  label: 'Match por IA',  started: aiUniq,  completed: aiUniq,  abandoned: 0, completionRate: aiUniq  > 0 ? 100 : 0, avgResult: aiAvg },
      { key: 'dev_match', label: 'Monte seu Dev', started: devUniq, completed: devUniq, abandoned: 0, completionRate: devUniq > 0 ? 100 : 0, avgResult: devAvg },
    ];

    // Sem dados de eventos: CTR e seções não podem ser estimados
    this.ctaPerformance = [];
    this.sectionReachRows = [];
    this.firstActionAvgSeconds = 0;
    this.firstActionMedianSeconds = 0;
    this.firstActionBySource = [];
  }

  private resolveSourceFromReferrer(referrer?: string): string {
    if (!referrer) return 'Direto';
    try {
      const host = new URL(referrer).hostname.replace(/^www\./, '').toLowerCase();
      if (host.includes('linkedin')) return 'LinkedIn';
      if (host.includes('github'))   return 'GitHub';
      if (host.includes('google'))   return 'Google';
      if (host.includes('gupy'))     return 'Gupy';
      if (host.includes('openai') || host.includes('chatgpt')) return 'ChatGPT';
      return 'Outro';
    } catch {
      return 'Direto';
    }
  }

  private addSessionToMap(map: Map<string, Set<string>>, key: string, sessionId: string): void {    const sessions = map.get(key) ?? new Set<string>();
    sessions.add(sessionId);
    map.set(key, sessions);
  }

  private getEventCategory(event: AnalyticsEventRecord): string {
    const category = event.metadata?.['category'];
    return typeof category === 'string' ? category : 'uncategorized';
  }

  private collectSessionsByCategory(
    ctaRows: Map<string, { label: string; category: string; section: string; clicks: number; sessions: Set<string> }>,
    category: string,
  ): string[] {
    const sessions = new Set<string>();
    for (const row of ctaRows.values()) {
      if (row.category !== category) continue;
      row.sessions.forEach(session => sessions.add(session));
    }
    return [...sessions];
  }

  private ctaLabel(target: string): string {
    const labels: Record<string, string> = {
      hero_contact: 'Hero · Contato',
      resume_download: 'Hero · Baixar currículo',
      project_brulias: 'Projeto · Brulias',
      contact_email: 'Contato · Email',
      contact_whatsapp: 'Contato · WhatsApp',
      dev_match_contact_success: 'Dev Match · CTA forte',
      dev_match_contact_surprise: 'Dev Match · CTA alternativo',
      dev_match_contact: 'Dev Match · Contato (legado)',
      ai_match_contact: 'IA Match · Entrar em contato',
      'nav_dev-match': 'Header · Match',
      nav_projetos: 'Header · Projetos',
      nav_contato: 'Header · Contato',
    };
    return labels[target] ?? target;
  }

  private sectionLabel(section: string): string {
    const labels: Record<string, string> = {
      detalhes: 'Hero',
      escolaridade: 'Formação',
      experiencia: 'Experiência',
      habilidades: 'Skills',
      projetos: 'Projetos',
      'dev-match': 'Dev Match',
      certificacoes: 'Certificações',
      contato: 'Contato',
    };
    return labels[section] ?? section;
  }

  hasNetworkInfo(visitor?: VisitorRecord): boolean {
    return !!visitor && !!(
      visitor.networkOrg?.trim()
      || visitor.networkAsn?.trim()
      || visitor.networkType?.trim()
    );
  }

  networkSummary(visitor?: VisitorRecord): string {
    if (!visitor) return '';

    const owner = visitor.networkOrg?.trim();
    const asn = visitor.networkAsn?.trim();
    return [owner, asn].filter(Boolean).join(' · ');
  }

  networkKindLabel(visitor?: VisitorRecord): string {
    switch (this.networkKind(visitor)) {
      case 'business':
        return 'Empresa provável';
      case 'isp':
        return 'ISP / operadora';
      case 'hosting':
        return 'Hosting / cloud';
      case 'education':
        return 'Instituição de ensino';
      default:
        return 'Rede atribuída';
    }
  }

  networkKindTitle(visitor?: VisitorRecord): string {
    const summary = this.networkSummary(visitor);
    const suffix = summary ? ` Rede detectada: ${summary}.` : '';
    return `Estimativa baseada na organização dona do bloco de IP, não na empresa real do visitante.${suffix}`;
  }

  networkKindBackground(visitor?: VisitorRecord): string {
    switch (this.networkKind(visitor)) {
      case 'business':
        return 'rgba(34, 197, 94, 0.14)';
      case 'isp':
        return 'rgba(56, 189, 248, 0.14)';
      case 'hosting':
        return 'rgba(168, 85, 247, 0.14)';
      case 'education':
        return 'rgba(245, 158, 11, 0.14)';
      default:
        return 'rgba(148, 163, 184, 0.14)';
    }
  }

  networkKindForeground(visitor?: VisitorRecord): string {
    switch (this.networkKind(visitor)) {
      case 'business':
        return '#4ade80';
      case 'isp':
        return '#38bdf8';
      case 'hosting':
        return '#c084fc';
      case 'education':
        return '#fbbf24';
      default:
        return '#94a3b8';
    }
  }

  private networkKind(visitor?: VisitorRecord): 'business' | 'isp' | 'hosting' | 'education' | 'unknown' {
    const explicitType = visitor?.networkType?.trim().toLowerCase();
    if (explicitType) {
      if (/(business|enterprise|company|corp)/.test(explicitType)) return 'business';
      if (/(isp|carrier|mobile|telecom)/.test(explicitType)) return 'isp';
      if (/(hosting|cloud|proxy|datacenter)/.test(explicitType)) return 'hosting';
      if (/(education|edu|university|school|college)/.test(explicitType)) return 'education';
    }

    const owner = visitor?.networkOrg?.trim().toLowerCase() ?? '';
    if (!owner) return 'unknown';

    if (/(univers|college|school|institut|\bedu\b)/.test(owner)) return 'education';
    if (/(amazon|aws|google cloud|microsoft|azure|cloudflare|digitalocean|linode|vultr|oracle cloud|ovh|contabo|hostinger|server|hosting|datacenter|cloud)/.test(owner)) return 'hosting';
    if (/(claro|vivo|telef[oô]nica|telefonica|tim|oi|algar|embratel|comcast|verizon|at&t|telecom|internet|fibra|broadband|wireless|mobile|carrier|\bisp\b|communications?)/.test(owner)) return 'isp';
    if (/(\bltda\b|\bs\.a\.?\b|\bsa\b|\bllc\b|\binc\b|\bcorp\b|corporation|company|empresa|grupo|group|solutions?|solu[cç]oes|tecnologia|tech|systems?|software|holding|industr(?:y|ia))/ .test(owner)) return 'business';
    return 'unknown';
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

  private hasCoordinates(visitor?: VisitorRecord): visitor is VisitorRecord & { lat: number; lng: number } {
    return visitor?.lat != null && visitor.lng != null;
  }

  private resolveRowMapVisitor(row: AccessTableRow): VisitorRecord | undefined {
    if (this.hasCoordinates(row.visitor)) {
      return row.visitor;
    }

    let latestVisitor: VisitorRecord | undefined;
    for (const visitorId of row.visitorIds) {
      const candidate = this.visitorMap.get(visitorId);
      if (!this.hasCoordinates(candidate)) continue;
      if (!latestVisitor || new Date(candidate.lastSeen).getTime() > new Date(latestVisitor.lastSeen).getTime()) {
        latestVisitor = candidate;
      }
    }

    return latestVisitor;
  }

  private focusVisitorOnMap(visitor: VisitorRecord & { lat: number; lng: number }, animate: boolean): void {
    if (!this.leafletMap) return;

    this.updateMarkerSelection(visitor.id ?? null);

    const target: L.LatLngExpression = [visitor.lat, visitor.lng];
    if (animate) {
      this.leafletMap.flyTo(target, 7, { animate: true, duration: 0.8 });
    } else {
      this.leafletMap.setView(target, 7, { animate: false });
    }

    if (visitor.id) {
      this.mapMarkers.get(visitor.id)?.openPopup();
    }
  }

  private buildMapMarkerStyle(visitor: VisitorRecord, isSelected: boolean): L.CircleMarkerOptions {
    const defaultColor = this.isLightTheme() ? '#7c3aed' : '#22d3ee';
    const selectedColor = this.isLightTheme() ? '#ea580c' : '#fbbf24';
    const color = isSelected ? selectedColor : defaultColor;

    return {
      radius: this.mapMarkerRadius(visitor) + (isSelected ? 4 : 0),
      color,
      fillColor: color,
      fillOpacity: isSelected ? 0.95 : 0.75,
      weight: isSelected ? 3 : 1.5,
    };
  }

  private mapMarkerRadius(visitor: VisitorRecord): number {
    return visitor.visitCount > 5 ? 10 : visitor.visitCount > 2 ? 7 : 5;
  }

  private updateMarkerSelection(selectedVisitorId: string | null): void {
    for (const visitor of this.visitors) {
      if (!visitor.id) continue;
      const marker = this.mapMarkers.get(visitor.id);
      if (!marker) continue;

      const isSelected = visitor.id === selectedVisitorId;
      marker.setStyle(this.buildMapMarkerStyle(visitor, isSelected));
      if (!isSelected) {
        marker.closePopup();
      }
    }
  }

  private syncSelectedMapTarget(): void {
    if (!this.selectedVisitorId) {
      if (this.selectedAccessRowKey && !this.accessRows.some(row => row.key === this.selectedAccessRowKey)) {
        this.selectedAccessRowKey = null;
      }
      return;
    }

    const selectedVisitor = this.visitorMap.get(this.selectedVisitorId);
    if (!this.hasCoordinates(selectedVisitor)) {
      this.selectedVisitorId = null;
      this.selectedAccessRowKey = null;
      this.updateMarkerSelection(null);
      return;
    }

    const matchingRow = this.accessRows.find(row => this.resolveRowMapVisitor(row)?.id === this.selectedVisitorId);
    this.selectedAccessRowKey = matchingRow?.key ?? null;
  }

  private buildMapMarkerContent(visitor: VisitorRecord): string {
    const location = [visitor.city, visitor.region, visitor.country].filter(Boolean).join(', ') || 'Local não identificado';
    const lastAccess = this.formatMapAccessTime(visitor.lastSeen);
    const visitLabel = `${visitor.visitCount} ${visitor.visitCount === 1 ? 'visita' : 'visitas'}`;
    const networkSummary = this.networkSummary(visitor);
    const networkKind = this.hasNetworkInfo(visitor) ? this.networkKindLabel(visitor) : '';

    return [
      '<div style="min-width: 220px; line-height: 1.45;">',
      `  <div style="font-weight: 700; margin-bottom: 4px;">${this.escapeHtml(location)}</div>`,
      `  <div><strong>IP:</strong> ${this.escapeHtml(visitor.ip || 'indisponível')}</div>`,
      networkSummary ? `  <div><strong>Rede:</strong> ${this.escapeHtml(networkSummary)}</div>` : '',
      networkKind ? `  <div><strong>Tipo:</strong> ${this.escapeHtml(networkKind)}</div>` : '',
      `  <div><strong>Último acesso:</strong> ${this.escapeHtml(lastAccess)}</div>`,
      `  <div><strong>Visitas:</strong> ${this.escapeHtml(visitLabel)}</div>`,
      '</div>',
    ].filter(Boolean).join('');
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

  }
}
