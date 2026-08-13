import { Component, inject, OnInit, AfterViewInit, OnDestroy, ChangeDetectorRef, ElementRef, ViewChild, NgZone } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FirebaseService, AiMatchRecord, VisitorRecord, DevMatchRecord, AnalyticsEventRecord, ChatConversation, ChatMessage, isChatMessageWithinEditWindow } from '../../../core/services/firebase.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import * as L from 'leaflet';
import {
  Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip, Legend,
  BarController, BarElement,
} from 'chart.js';

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip, Legend, BarController, BarElement);

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

interface SourceQualityRow {
  source: string;
  sessions: number;
  readExperience: number;
  conversions: number;
  /** % das sessões da origem que chegaram na experiência. */
  qualityRate: number;
}

interface VisitorSignals {
  readExperience: boolean;
  deepRead: boolean;
  resumeDownload: boolean;
  directContact: boolean;
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
      <main class="max-w-screen-2xl mx-auto px-6 pb-12 space-y-6">

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
              Visão geral
            </button>
            <button (click)="activeTab = 'leads'"
                    [class.bg-gray-700]="activeTab === 'leads'"
                    [class.text-white]="activeTab === 'leads'"
                    [class.text-gray-500]="activeTab !== 'leads'"
                    class="px-5 py-2 rounded-lg text-sm font-medium transition-all duration-150 flex items-center gap-2">
              Visitantes
              @if (hotLeads.length > 0) {
                <span class="inline-flex items-center justify-center px-1.5 h-4 rounded-full bg-amber-500 text-gray-900 text-[9px] font-bold">
                  {{ hotLeads.length }}
                </span>
              }
            </button>
            <button (click)="activeTab = 'tests'"
                    [class.bg-gray-700]="activeTab === 'tests'"
                    [class.text-white]="activeTab === 'tests'"
                    [class.text-gray-500]="activeTab !== 'tests'"
                    class="px-5 py-2 rounded-lg text-sm font-medium transition-all duration-150">
              Testes
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

        <!-- KPIs: o que importa para saber se o portfolio esta cumprindo o papel -->
        <div class="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <div class="admin-card rounded-xl p-4 border">
            <p class="text-xs text-gray-500 mb-1">Visitantes únicos</p>
            <p class="text-3xl font-bold text-gray-100">{{ visitors.length }}</p>
            <p class="text-xs text-gray-600 mt-1">{{ activeNowCount }} online agora</p>
          </div>
          <div class="admin-card rounded-xl p-4 border">
            <p class="text-xs text-gray-500 mb-1">Leram a experiência</p>
            <p class="text-3xl font-bold text-gray-100">{{ experienceReachRate }}%</p>
            <p class="text-xs text-gray-600 mt-1">{{ experienceSessions }} de {{ totalSessions }} sessões</p>
          </div>
          <div class="admin-card rounded-xl p-4 border">
            <p class="text-xs text-gray-500 mb-1">Leitura profunda</p>
            <p class="text-3xl font-bold text-gray-100">{{ deepReadSessions }}</p>
            <p class="text-xs text-gray-600 mt-1">abriram "mais entregas"</p>
          </div>
          <div class="admin-card rounded-xl p-4 border">
            <p class="text-xs text-gray-500 mb-1">Currículos baixados</p>
            <p class="text-3xl font-bold text-gray-100">{{ resumeDownloads }}</p>
            <p class="text-xs text-gray-600 mt-1">sinal mais forte de interesse</p>
          </div>
          <div class="admin-card rounded-xl p-4 border">
            <p class="text-xs text-gray-500 mb-1">Contatos diretos</p>
            <p class="text-3xl font-bold" [class]="directContacts > 0 ? 'text-green-400' : 'text-gray-100'">{{ directContacts }}</p>
            <p class="text-xs text-gray-600 mt-1">email, WhatsApp ou LinkedIn</p>
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
                    <th class="text-left px-4 py-3 whitespace-nowrap">Score</th>
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
                            <div class="text-xs text-gray-400 max-w-44 truncate" [title]="networkSummary(r.visitor)">
                              {{ networkSummary(r.visitor) }}
                            </div>
                            <span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold"
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
                      <td class="px-4 py-3 whitespace-nowrap">
                        @if (r.visitor) {
                          @let s = computeVisitorScore(r.visitor);
                          @let sl = scoreLabel(s);
                          <span class="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full border"
                                [class]="sl.bg + ' ' + sl.color"
                                [title]="sl.label">
                            {{ s }}
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
          <div class="admin-card border rounded-xl p-5 space-y-3">
            <div class="flex items-center justify-between flex-wrap gap-2">
              <p class="text-xs text-gray-500 uppercase tracking-widest font-semibold">Acessos por período</p>
              <div class="flex items-center gap-2 flex-wrap">
                <div class="flex gap-1">
                  @for (p of [{d:7,l:'7d'},{d:14,l:'14d'},{d:30,l:'30d'},{d:90,l:'90d'}]; track p.l) {
                    <button (click)="setChartPreset(p.d)"
                            class="px-2 py-1 text-xs font-semibold rounded border transition-colors cursor-pointer"
                            [class]="chartPresetDays === p.d ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300' : 'border-gray-700 text-gray-500 hover:text-gray-300'">
                      {{ p.l }}
                    </button>
                  }
                </div>
                <div class="flex items-center gap-1">
                  <input type="date" [(ngModel)]="chartDateStart" (change)="onChartRangeChange()"
                         class="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-gray-300 focus:outline-none focus:border-cyan-500/50" />
                  <span class="text-gray-600 text-xs">–</span>
                  <input type="date" [(ngModel)]="chartDateEnd" (change)="onChartRangeChange()"
                         class="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-gray-300 focus:outline-none focus:border-cyan-500/50" />
                </div>
                <button (click)="showPeriodCompare = !showPeriodCompare; onChartRangeChange()"
                        class="px-2 py-1 text-xs font-semibold rounded border transition-colors cursor-pointer"
                        [class]="showPeriodCompare ? 'bg-purple-500/20 border-purple-500/50 text-purple-300' : 'border-gray-700 text-gray-500 hover:text-gray-300'">
                  ≈ Comparar
                </button>
              </div>
            </div>
            <canvas #chartCanvas style="width:100%;max-height:220px"></canvas>
          </div>

          <!-- Mapa Leaflet -->
          <div class="admin-card border rounded-xl p-5">
            <p class="text-xs text-gray-500 uppercase tracking-widest mb-4 font-semibold">Localização dos Acessos</p>
            <p class="text-xs text-gray-500 mb-4">Clique em uma linha da tabela para aproximar o mapa nesse acesso.</p>
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
          <p class="text-xs text-gray-500 mb-4">Dia da semana × hora — todas as interações registradas</p>
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
                    <div class="text-xs text-gray-500 text-right pr-2 shrink-0" style="width:54px">{{ row.label }}</div>
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
                  <span class="text-xs text-gray-500 mr-1">Menos</span>
                  @for (l of legendSteps; track l) {
                    <div class="rounded-sm" style="width:14px;height:14px" [style.background-color]="heatLegendColor(l)"></div>
                  }
                  <span class="text-xs text-gray-500 ml-1">Mais</span>
                </div>
              </div>

              <!-- Painel de resumo -->
              <div class="flex-1 flex flex-col justify-between gap-5 min-w-[180px]">
                <!-- KPIs -->
                <div class="grid grid-cols-3 gap-3">
                  <div class="admin-card border rounded-lg p-3 text-center">
                    <p class="text-xs text-gray-500 uppercase tracking-wider mb-1">Total</p>
                    <p class="text-2xl font-bold" [style.color]="accentColor">{{ heatTotalHits }}</p>
                    <p class="text-xs text-gray-500 mt-0.5">eventos</p>
                  </div>
                  <div class="admin-card border rounded-lg p-3 text-center">
                    <p class="text-xs text-gray-500 uppercase tracking-wider mb-1">Hora pico</p>
                    <p class="text-2xl font-bold" [style.color]="accentColor">{{ heatPeakHour }}h</p>
                    <p class="text-xs text-gray-500 mt-0.5">mais acessos</p>
                  </div>
                  <div class="admin-card border rounded-lg p-3 text-center">
                    <p class="text-xs text-gray-500 uppercase tracking-wider mb-1">Dia ativo</p>
                    <p class="text-2xl font-bold" [style.color]="accentColor">{{ heatPeakDay }}</p>
                    <p class="text-xs text-gray-500 mt-0.5">mais acessos</p>
                  </div>
                </div>

                <!-- Top 5 horas -->
                <div>
                  <p class="text-xs text-gray-500 uppercase tracking-wider mb-3">Top 5 horas mais ativas</p>
                  <div class="space-y-2">
                    @for (h of heatTopHours; track h.label) {
                      <div class="flex items-center gap-2">
                        <span class="text-xs text-gray-400 w-6 shrink-0 text-right">{{ h.label }}</span>
                        <div class="flex-1 h-2 rounded-full bg-gray-800 overflow-hidden">
                          <div class="h-full rounded-full transition-all" [style.width.%]="h.pct" [style.background-color]="accentColor"></div>
                        </div>
                        <span class="text-xs font-bold tabular-nums w-6 text-right" [style.color]="accentColor">{{ h.count }}</span>
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
                <p class="text-xs text-gray-500 uppercase tracking-wider mb-2">Top recorrentes</p>
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
            <p class="text-xs text-gray-500 mb-4">
              {{ usingFallback ? 'Origem dos visitantes por campo referrer. Cliques em CTA disponíveis após acumulação de eventos.' : 'Sessões por canal e quantas delas geram projeto, contato e download de currículo.' }}
            </p>
            @if (!loading && sourceConversions.length > 0) {
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="text-xs text-gray-500 uppercase tracking-wider border-b border-gray-800/50">
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
            <p class="text-xs text-gray-500 mb-4">Quanto tempo uma sessão leva para clicar ou iniciar algo relevante.</p>
            @if (!loading && (firstActionAvgSeconds > 0 || firstActionBySource.length > 0)) {
              <div class="grid grid-cols-2 gap-3 mb-5">
                <div class="admin-card border rounded-lg p-3 text-center">
                  <p class="text-xs text-gray-500 uppercase tracking-wider mb-1">Média</p>
                  <p class="text-2xl font-bold" [style.color]="accentColor">{{ firstActionAvgSeconds }}s</p>
                </div>
                <div class="admin-card border rounded-lg p-3 text-center">
                  <p class="text-xs text-gray-500 uppercase tracking-wider mb-1">Mediana</p>
                  <p class="text-2xl font-bold" [style.color]="accentColor">{{ firstActionMedianSeconds }}s</p>
                </div>
              </div>
              <div class="space-y-3">
                @for (row of firstActionBySource; track row.source) {
                  <div class="flex items-center justify-between gap-4">
                    <div>
                      <p class="text-sm text-gray-300">{{ row.source }}</p>
                      <p class="text-xs text-gray-500">{{ row.sessions }} sessões</p>
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
            <p class="text-xs text-gray-500 uppercase tracking-widest mb-1 font-semibold">Funil de recrutamento</p>
            <p class="text-xs text-gray-500 mb-5">Da visita ao contato — cada etapa mostra quanto sobrou da anterior.</p>
            @if (!loading && funnelBars.length > 0) {
              <div class="space-y-4">
                @for (step of funnelBars; track step.label; let i = $index) {
                  <div>
                    <div class="flex items-baseline justify-between gap-3 mb-1.5">
                      <div class="flex items-baseline gap-2 min-w-0">
                        <span class="text-xs text-gray-600 font-mono shrink-0">{{ i + 1 }}</span>
                        <span class="text-sm text-gray-200 truncate">{{ step.label }}</span>
                      </div>
                      <div class="flex items-baseline gap-2 shrink-0">
                        <span class="text-lg font-bold" [style.color]="step.color">{{ step.value }}</span>
                        <span class="text-xs text-gray-500 w-10 text-right">{{ step.pct }}%</span>
                      </div>
                    </div>
                    <div class="h-2.5 bg-gray-800 rounded-full overflow-hidden">
                      <div class="h-full rounded-full transition-all duration-700"
                           [style.width.%]="step.pct"
                           [style.background-color]="step.color"></div>
                    </div>
                    @if (step.dropPct !== null && step.dropPct > 0) {
                      <p class="text-xs text-gray-600 mt-1">
                        −{{ step.dropPct }}% em relação à etapa anterior
                      </p>
                    }
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
            <p class="text-xs text-gray-500 mb-4">CTA = botão ou link de ação. Ex.: contato, currículo, WhatsApp, projetos e atalhos do header.</p>
            @if (!loading && ctaPerformance.length > 0) {
              <div [style.height.px]="Math.max(200, Math.min(ctaPerformance.length, 12) * 44)">
                <canvas #ctaChartCanvas style="width:100%;height:100%"></canvas>
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
            <p class="text-xs text-gray-500 mb-4">Profundidade real de leitura da página por sessão.</p>
            @if (!loading && sectionReachRows.length > 0) {
              <div [style.height.px]="Math.max(180, sectionReachRows.length * 44)">
                <canvas #sectionChartCanvas style="width:100%;height:100%"></canvas>
              </div>
            } @else if (!loading) {
              <div class="py-8 text-center text-gray-600 text-sm">Sem seções visualizadas ainda</div>
            } @else {
              <div class="py-8 text-center text-gray-500 text-sm animate-pulse">Carregando...</div>
            }
          </div>

          <div class="admin-card border rounded-xl p-5">
            <p class="text-xs text-gray-500 uppercase tracking-widest mb-1 font-semibold">Origem × Qualidade</p>
            <p class="text-xs text-gray-500 mb-4">
              Não é só quem traz mais visita — é quem traz visita que lê a experiência e entra em contato.
            </p>
            @if (!loading && sourceQuality.length > 0) {
              <div class="space-y-3">
                @for (row of sourceQuality; track row.source) {
                  <div class="admin-card border rounded-lg p-3">
                    <div class="flex items-center justify-between gap-3 mb-2">
                      <p class="text-sm text-gray-200 font-semibold">{{ row.source }}</p>
                      <span class="text-xs px-2 py-0.5 rounded-full"
                            [class]="row.qualityRate >= 30 ? 'bg-green-500/15 text-green-400'
                                   : row.qualityRate >= 10 ? 'bg-amber-500/15 text-amber-400'
                                   : 'bg-gray-700/60 text-gray-400'">
                        {{ row.qualityRate }}% qualificadas
                      </span>
                    </div>
                    <!-- Barra: sessões que chegaram na experiência vs total -->
                    <div class="h-2 bg-gray-800 rounded-full overflow-hidden mb-2">
                      <div class="h-full rounded-full transition-all duration-700 bg-gray-300"
                           [style.width.%]="row.qualityRate"></div>
                    </div>
                    <div class="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                      <span>{{ row.sessions }} sessões</span>
                      <span>{{ row.readExperience }} leram experiência</span>
                      <span [class.text-green-400]="row.conversions > 0">{{ row.conversions }} converteram</span>
                    </div>
                  </div>
                }
              </div>
              <p class="text-xs text-gray-600 mt-3">
                "Qualificada" = a sessão chegou até a seção de experiência.
                "Converteu" = baixou o currículo ou clicou em um canal de contato.
              </p>
            } @else if (!loading) {
              <div class="py-8 text-center text-gray-600 text-sm">Sem tráfego suficiente ainda</div>
            } @else {
              <div class="py-8 text-center text-gray-500 text-sm animate-pulse">Carregando...</div>
            }
          </div>
        </div>

        </div>
        <!-- fim: Aba Analytics -->

        <!-- ── Aba: Leads ────────────────────────────────────────────── -->
        <div [class.hidden]="activeTab !== 'leads'" class="space-y-6">
          <div class="flex items-center justify-between flex-wrap gap-3">
            <p class="text-xs text-gray-500 uppercase tracking-widest font-semibold">Leads por score</p>
            <button (click)="exportLeadsCsv()"
                    class="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-700 hover:border-cyan-500/50 text-xs text-gray-400 hover:text-cyan-300 transition-colors cursor-pointer">
              ↓ Exportar CSV
            </button>
          </div>

          <!-- Cards de resumo -->
          <div class="grid grid-cols-3 gap-3">
            <div class="admin-card rounded-xl p-5 border border-red-500/30 bg-red-500/5">
              <p class="text-sm font-semibold text-red-500 mb-2">🔥 Leads quentes</p>
              <p class="text-4xl font-bold text-red-500">{{ hotLeads.length }}</p>
              <p class="text-xs font-medium text-red-400 mt-2">Score ≥ 70</p>
            </div>
            <div class="admin-card rounded-xl p-5 border border-amber-500/30 bg-amber-500/5">
              <p class="text-sm font-semibold text-amber-500 mb-2">🌡 Leads mornos</p>
              <p class="text-4xl font-bold text-amber-500">{{ warmLeads.length }}</p>
              <p class="text-xs font-medium text-amber-400 mt-2">Score 40–69</p>
            </div>
            <div class="admin-card rounded-xl p-5 border border-blue-500/30 bg-blue-500/5">
              <p class="text-sm font-semibold text-blue-500 mb-2">❄️ Leads frios</p>
              <p class="text-4xl font-bold text-blue-500">{{ visitors.length - hotLeads.length - warmLeads.length }}</p>
              <p class="text-xs font-medium text-blue-400 mt-2">Score &lt; 40</p>
            </div>
          </div>

          <!-- Tabela de leads -->
          <div class="admin-card border rounded-xl overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="text-xs text-gray-500 uppercase tracking-wider border-b border-gray-800">
                    <th class="text-left px-4 py-3">Score</th>
                    <th class="text-left px-4 py-3">IP</th>
                    <th class="text-left px-4 py-3">Localização</th>
                    <th class="text-left px-4 py-3 whitespace-nowrap">Visitas</th>
                    <th class="text-left px-4 py-3 whitespace-nowrap">Match IA</th>
                    <th class="text-left px-4 py-3 whitespace-nowrap">Match Dev</th>
                    <th class="text-left px-4 py-3 whitespace-nowrap">Chat</th>
                    <th class="text-left px-4 py-3 whitespace-nowrap">Última visita</th>
                  </tr>
                </thead>
                <tbody>
                  @for (v of paginatedLeads; track v.id) {
                    @let score = computeVisitorScore(v);
                    @let sl = scoreLabel(score);
                    <tr class="border-b border-gray-800/40 hover:bg-gray-800/30 transition-colors">
                      <td class="px-4 py-3">
                        <span class="inline-flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-full border {{ sl.bg }} {{ sl.color }}">
                          {{ score }}
                        </span>
                      </td>
                      <td class="px-4 py-3 text-xs text-gray-500 font-mono">{{ v.ip }}</td>
                      <td class="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                        {{ v.city }}{{ v.city && v.country ? ', ' : '' }}{{ v.country }}
                      </td>
                      <td class="px-4 py-3 text-xs text-cyan-400 font-semibold">{{ v.visitCount }}x</td>
                      <td class="px-4 py-3 text-xs">
                        @let aiM = getAiMatchFor(v.id);
                        @if (aiM) {
                          <span [class]="aiM.matchPercentage >= 70 ? 'text-green-400' : aiM.matchPercentage >= 50 ? 'text-yellow-400' : 'text-red-400'">{{ aiM.matchPercentage }}%</span>
                        } @else { <span class="text-gray-700">—</span> }
                      </td>
                      <td class="px-4 py-3 text-xs">
                        @let devM = getDevMatchFor(v.id);
                        @if (devM) {
                          <span [class]="devM.matchPercentage >= 70 ? 'text-green-400' : devM.matchPercentage >= 50 ? 'text-yellow-400' : 'text-red-400'">{{ devM.matchPercentage }}%</span>
                        } @else { <span class="text-gray-700">—</span> }
                      </td>
                      <td class="px-4 py-3 text-xs">
                        @let conv = getConvForIp(v.ip);
                        @if (conv) {
                          <span class="text-violet-400">💬 {{ conv.username }}</span>
                        } @else { <span class="text-gray-700">—</span> }
                      </td>
                      <td class="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{{ v.lastSeen | date:'dd/MM/yy HH:mm' }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
            <!-- Paginação -->
            <div class="flex flex-col gap-3 border-t border-gray-800/40 px-4 py-3 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">
              <div class="flex items-center gap-2">
                <span>Linhas por página:</span>
                <select [(ngModel)]="leadsPageSize" (ngModelChange)="onLeadsPageSizeChange()"
                        class="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-gray-300 focus:outline-none focus:border-cyan-500/50 cursor-pointer">
                  <option [value]="10">10</option>
                  <option [value]="15">15</option>
                  <option [value]="25">25</option>
                  <option [value]="50">50</option>
                </select>
                <span>· Exibindo {{ leadsPageStart }}–{{ leadsPageEnd }} de {{ sortedLeads.length }}</span>
              </div>
              <div class="flex items-center gap-2 self-end sm:self-auto">
                <button type="button" (click)="leadsPrevPage()" [disabled]="leadsPage === 1"
                        class="rounded-md border border-gray-700 px-3 py-1.5 transition-colors hover:border-gray-500 hover:text-gray-300 disabled:cursor-not-allowed disabled:opacity-40">
                  Anterior
                </button>
                <span class="min-w-24 text-center">Página {{ leadsPage }} de {{ leadsTotalPages }}</span>
                <button type="button" (click)="leadsNextPage()" [disabled]="leadsPage >= leadsTotalPages"
                        class="rounded-md border border-gray-700 px-3 py-1.5 transition-colors hover:border-gray-500 hover:text-gray-300 disabled:cursor-not-allowed disabled:opacity-40">
                  Próxima
                </button>
              </div>
            </div>
          </div>

          <!-- Mapa de jornada -->
          @if (journeyPaths.length > 0) {
            <div class="admin-card border rounded-xl p-5 space-y-4">
              <div class="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <p class="text-xs text-gray-500 uppercase tracking-widest font-semibold">Jornadas mais comuns</p>
                  <p class="text-xs text-gray-500 mt-0.5">Sequências de seções visualizadas por sessão, ordenadas por frequência</p>
                </div>
                <button (click)="generateJourneyInsight()"
                        [disabled]="journeyAiLoading"
                        class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-violet-600/40 bg-violet-500/10 text-violet-300 text-xs font-medium hover:bg-violet-500/20 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0">
                  @if (journeyAiLoading) {
                    <span class="inline-block w-3 h-3 border-2 border-violet-300/30 border-t-violet-300 rounded-full animate-spin"></span>
                    Analisando…
                  } @else {
                    ✦ Analisar com IA
                  }
                </button>
              </div>

              <!-- Lista de jornadas com chips -->
              <div class="space-y-3">
                @for (j of journeyPaths; track j.path; let i = $index) {
                  <div class="group flex items-start gap-3 p-3 rounded-xl transition-colors hover:bg-gray-800/40"
                       [class]="i === 0 ? 'bg-cyan-500/5 border border-cyan-500/15' : ''">
                    <!-- Posição + barra de frequência -->
                    <div class="flex flex-col items-center gap-1 pt-0.5 shrink-0 w-8">
                      <span class="text-xs font-bold tabular-nums"
                            [class]="i === 0 ? 'text-cyan-400' : i === 1 ? 'text-gray-400' : 'text-gray-600'">
                        #{{ i + 1 }}
                      </span>
                      <div class="w-1 rounded-full" [style.height.px]="Math.max(4, Math.round(j.pct * 0.5))"
                           [style.background-color]="i === 0 ? '#22d3ee' : i === 1 ? '#a855f7' : '#374151'"></div>
                    </div>
                    <!-- Chips de seções -->
                    <div class="flex-1 min-w-0">
                      <div class="flex flex-wrap items-center gap-1 mb-1.5">
                        @for (step of j.path.split(' → '); track step; let si = $index; let last = $last) {
                          <span class="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border"
                                [class]="si === 0
                                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                                  : last
                                    ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                                    : 'bg-gray-700/60 border-gray-600/50 text-gray-400'">
                            {{ step }}
                          </span>
                          @if (!last) {
                            <span class="text-gray-600 text-[10px] select-none">→</span>
                          }
                        }
                      </div>
                      <!-- Barra de frequência relativa -->
                      <div class="flex items-center gap-2">
                        <div class="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
                          <div class="h-full rounded-full transition-all duration-700"
                               [style.width.%]="j.pct"
                               [style.background-color]="i === 0 ? '#22d3ee' : i === 1 ? '#a855f7' : '#4b5563'">
                          </div>
                        </div>
                        <span class="text-xs text-gray-500 tabular-nums shrink-0">{{ j.count }}x · {{ j.pct }}%</span>
                      </div>
                    </div>
                  </div>
                }
              </div>

              <!-- AI Insight -->
              @if (journeyAiError) {
                <div class="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-xs text-red-400">{{ journeyAiError }}</div>
              }
              @if (journeyAiParsed) {
                @let ai = journeyAiParsed;
                <div class="rounded-xl border p-4 space-y-3 mt-2"
                     [class]="ai.assessment === 'good'
                       ? 'border-green-500/20 bg-green-500/5'
                       : ai.assessment === 'attention'
                         ? 'border-amber-500/20 bg-amber-500/5'
                         : 'border-cyan-500/15 bg-cyan-500/5'">
                  <div class="flex items-center gap-2">
                    <span class="text-base">
                      {{ ai.assessment === 'good' ? '✅' : ai.assessment === 'attention' ? '⚠️' : '💡' }}
                    </span>
                    <p class="text-xs font-semibold"
                       [class]="ai.assessment === 'good' ? 'text-green-300' : ai.assessment === 'attention' ? 'text-amber-300' : 'text-cyan-300'">
                      Análise IA — Jornadas de Navegação
                    </p>
                  </div>
                  <p class="text-xs text-gray-300 leading-relaxed">{{ ai.summary }}</p>
                  <div class="space-y-2">
                    <div class="flex gap-2">
                      <span class="text-xs font-semibold text-gray-500 uppercase tracking-wide shrink-0 w-16 pt-0.5">Indica</span>
                      <p class="text-xs text-gray-400 leading-relaxed">{{ ai.insight }}</p>
                    </div>
                    <div class="flex gap-2">
                      <span class="text-xs font-semibold text-violet-400 uppercase tracking-wide shrink-0 w-16 pt-0.5">Ação</span>
                      <p class="text-xs text-gray-300 leading-relaxed">{{ ai.action }}</p>
                    </div>
                  </div>
                </div>
              }
            </div>
          }
        </div>
        <!-- fim: Aba Leads -->

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
  @ViewChild('ctaChartCanvas') ctaChartCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('sectionChartCanvas') sectionChartCanvas?: ElementRef<HTMLCanvasElement>;
  private leafletMap?: L.Map;
  private mapMarkers = new Map<string, L.CircleMarker>();
  private lineChartInstance?: Chart;
  private ctaChartInstance?: Chart;
  private sectionChartInstance?: Chart;
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

  // ── Métricas de recrutamento ─────────────────────────────────────────────
  totalSessions = 0;
  experienceSessions = 0;
  experienceReachRate = 0;
  deepReadSessions = 0;
  resumeDownloads = 0;
  directContacts = 0;
  sourceQuality: SourceQualityRow[] = [];
  /** Sinais por visitante, usados pelo score. */
  visitorSignals = new Map<string, VisitorSignals>();
  contactFunnelSteps: { label: string; value: number; color: string }[] = [];
  firstActionAvgSeconds = 0;
  firstActionMedianSeconds = 0;
  firstActionBySource: TimeToActionRow[] = [];
  analyticsEventCount = 0;
  usingFallback = false;

  readonly Math = Math;
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

  // ── Date range do gráfico ─────────────────────────────────────────────
  chartDateStart: string = new Date(Date.now() - 6 * 86_400_000).toISOString().slice(0, 10);
  chartDateEnd: string   = new Date().toISOString().slice(0, 10);
  chartPresetDays = 7;

  toIsoDate(d: Date): string {
    return d.toISOString().slice(0, 10);
  }

  setChartPreset(days: number): void {
    this.chartPresetDays = days;
    this.chartDateStart = this.toIsoDate(new Date(Date.now() - (days - 1) * 86_400_000));
    this.chartDateEnd   = this.toIsoDate(new Date());
    this.initLineChart();
  }

  onChartRangeChange(): void {
    this.chartPresetDays = 0;
    this.initLineChart();
  }
  activeTab: 'analytics' | 'chat' | 'leads' | 'tests' = 'analytics';

  // ── Score de visitante ───────────────────────────────────────────────
  visitorScores = new Map<string, number>();

  /**
   * Score de interesse (0-100) a partir do que o visitante realmente fez.
   * Ponderado do sinal mais fraco (voltar ao site) ao mais forte (contato direto).
   */
  computeVisitorScore(v: VisitorRecord): number {
    let score = 0;

    // Recorrência: voltar ao portfolio costuma indicar processo em andamento.
    if (v.visitCount >= 4) score += 25;
    else if (v.visitCount >= 2) score += 15;

    const signals = v.id ? this.visitorSignals.get(v.id) : undefined;
    if (signals) {
      if (signals.readExperience) score += 15;   // chegou na experiência
      if (signals.deepRead) score += 20;         // abriu "mais entregas"
      if (signals.resumeDownload) score += 20;   // baixou o currículo
      if (signals.directContact) score += 30;    // email/WhatsApp/LinkedIn
    }

    return Math.min(100, score);
  }

  scoreLabel(score: number): { label: string; color: string; bg: string } {
    if (score >= 60) return { label: 'Alto interesse', color: 'text-green-400', bg: 'bg-green-500/15 border-green-500/30' };
    if (score >= 30) return { label: 'Interesse moderado', color: 'text-amber-400', bg: 'bg-amber-500/15 border-amber-500/30' };
    return { label: 'Visita superficial', color: 'text-gray-400', bg: 'bg-gray-700/40 border-gray-600/40' };
  }

  /** Explica de onde veio o score — o painel precisa ser auditável. */
  scoreReasons(v: VisitorRecord): string[] {
    const out: string[] = [];
    if (v.visitCount >= 4) out.push(`${v.visitCount} visitas`);
    else if (v.visitCount >= 2) out.push(`${v.visitCount} visitas`);

    const signals = v.id ? this.visitorSignals.get(v.id) : undefined;
    if (signals?.readExperience) out.push('leu experiência');
    if (signals?.deepRead) out.push('leitura profunda');
    if (signals?.resumeDownload) out.push('baixou CV');
    if (signals?.directContact) out.push('contato direto');
    return out;
  }

  get hotLeads(): VisitorRecord[] {
    return this.visitors.filter(v => this.computeVisitorScore(v) >= 60)
      .sort((a, b) => this.computeVisitorScore(b) - this.computeVisitorScore(a));
  }

  get warmLeads(): VisitorRecord[] {
    return this.visitors.filter(v => {
      const s = this.computeVisitorScore(v);
      return s >= 30 && s < 60;
    }).sort((a, b) => this.computeVisitorScore(b) - this.computeVisitorScore(a));
  }

  // ── Paginação da tabela de leads ────────────────────────────────────────────────
  leadsPage = 1;
  leadsPageSize = 15;

  get sortedLeads(): VisitorRecord[] {
    return [...this.visitors].sort((a, b) => this.computeVisitorScore(b) - this.computeVisitorScore(a));
  }

  get leadsTotalPages(): number {
    return Math.max(1, Math.ceil(this.sortedLeads.length / this.leadsPageSize));
  }

  get paginatedLeads(): VisitorRecord[] {
    const start = (this.leadsPage - 1) * this.leadsPageSize;
    return this.sortedLeads.slice(start, start + this.leadsPageSize);
  }

  get leadsPageStart(): number {
    return this.sortedLeads.length === 0 ? 0 : (this.leadsPage - 1) * this.leadsPageSize + 1;
  }

  get leadsPageEnd(): number {
    return Math.min(this.leadsPage * this.leadsPageSize, this.sortedLeads.length);
  }

  leadsNextPage(): void {
    if (this.leadsPage < this.leadsTotalPages) this.leadsPage++;
  }

  leadsPrevPage(): void {
    if (this.leadsPage > 1) this.leadsPage--;
  }

  onLeadsPageSizeChange(): void {
    this.leadsPage = 1;
  }

  // ── Journey AI insight ─────────────────────────────────────────────────────
  journeyAiInsight = '';
  journeyAiLoading = false;
  journeyAiError = '';

  async generateJourneyInsight(): Promise<void> {
    if (!this.journeyPaths.length || this.journeyAiLoading) return;
    this.journeyAiLoading = true;
    this.journeyAiInsight = '';
    this.journeyAiError = '';
    this.cdr.detectChanges();

    const top = this.journeyPaths.slice(0, 6)
      .map((j, i) => `${i + 1}. "${j.path}" — ${j.count}x (${j.pct}%)`)
      .join('\n');

    const prompt = `Você é um especialista em UX e analytics de portfolios de desenvolvedores.
Analise as jornadas de navegação mais comuns dos visitantes e fornecer um feedback curto e prático para o dono do portfolio.

JORNADAS MAIS COMUNS (formato: sequência de seções → contagem de sessões):
${top}

Total de sessões analisadas: ${this.journeyPaths.reduce((s, j) => s + j.count, 0)}

Responda em JSON com esta estrutura exata (sem markdown):
{
  "assessment": "ok | attention | good",
  "summary": "<2-3 frases descrevendo o padrão geral de navegação>",
  "insight": "<o que isso indica sobre o comportamento do visitante>",
  "action": "<1-2 recomendações práticas para o dono do portfolio>"
}
Resposta em português brasileiro, tom direto e profissional.`;

    try {
      const text = await this.firebase.analyzeJourneys(prompt);
      const parsed = JSON.parse(text || '{}') as {
        assessment: string; summary: string; insight: string; action: string;
      };
      this.journeyAiInsight = JSON.stringify(parsed);
    } catch (e) {
      this.journeyAiError = 'Falha ao gerar análise. Tente novamente.';
    } finally {
      this.journeyAiLoading = false;
      this.cdr.detectChanges();
    }
  }

  get journeyAiParsed(): { assessment: string; summary: string; insight: string; action: string } | null {
    if (!this.journeyAiInsight) return null;
    try { return JSON.parse(this.journeyAiInsight); } catch { return null; }
  }

  getAiMatchFor(visitorId?: string): AiMatchRecord | undefined {
    return this.aiMatches.find(m => m.visitorId === visitorId);
  }

  getDevMatchFor(visitorId?: string): DevMatchRecord | undefined {
    return this.devMatches.find(m => m.visitorId === visitorId);
  }

  getConvForIp(ip: string): ChatConversation | undefined {
    return this.conversations.find(c => c.ip === ip);
  }

  exportLeadsCsv(): void {
    const rows = [
      ['IP', 'Cidade', 'País', 'Visitas', 'Score', 'Categoria', 'AI Match %', 'Dev Match %', 'Primeira Visita', 'Última Visita'],
      ...this.visitors
        .map(v => {
          const score = this.computeVisitorScore(v);
          const { label } = this.scoreLabel(score);
          const aiM = this.aiMatches.find(m => m.visitorId === v.id);
          const devM = this.devMatches.find(m => m.visitorId === v.id);
          return [
            v.ip, v.city ?? '', v.country ?? '',
            v.visitCount, score, label.replace(/[🔥🌡❄️ ]/g, '').trim(),
            aiM?.matchPercentage ?? '', devM?.matchPercentage ?? '',
            v.firstSeen.toLocaleDateString('pt-BR'),
            v.lastSeen.toLocaleDateString('pt-BR'),
          ];
        })
        .sort((a, b) => (b[4] as number) - (a[4] as number)),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  }

  // ── Visitantes ativos agora ───────────────────────────────────────────
  activeNowCount = 0;
  private unsubActiveNow?: () => void;

  // ── Mapa de jornada ───────────────────────────────────────────────────
  journeyPaths: { path: string; count: number; pct: number }[] = [];

  private computeJourneyMap(): void {
    const sessionPaths = new Map<string, string[]>();
    const sorted = [...this.analyticsEvents]
      .filter(e => e.eventType === 'section_view' && e.section)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    for (const e of sorted) {
      const existing = sessionPaths.get(e.sessionId) ?? [];
      const last = existing[existing.length - 1];
      if (last !== e.section) existing.push(e.section!);
      sessionPaths.set(e.sessionId, existing);
    }

    const pathCounts = new Map<string, number>();
    for (const sections of sessionPaths.values()) {
      if (sections.length < 2) continue;
      const key = sections.join(' → ');
      pathCounts.set(key, (pathCounts.get(key) ?? 0) + 1);
    }

    const total = [...pathCounts.values()].reduce((s, v) => s + v, 0) || 1;
    this.journeyPaths = [...pathCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([path, count]) => ({ path, count, pct: Math.round((count / total) * 100) }));
  }

  // ── Comparação de períodos ─────────────────────────────────────────────
  showPeriodCompare = false;

  get chartCompareStart(): string {
    const start = new Date(this.chartDateStart + 'T00:00:00');
    const end   = new Date(this.chartDateEnd   + 'T00:00:00');
    const days  = Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1;
    return this.toIsoDate(new Date(start.getTime() - days * 86_400_000));
  }

  get chartCompareEnd(): string {
    return this.toIsoDate(new Date(new Date(this.chartDateStart + 'T00:00:00').getTime() - 86_400_000));
  }

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
      this.initCtaChart();
      this.initSectionChart();
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

    // Listener visitantes ativos agora (presence)
    this.unsubActiveNow = this.firebase.listenActiveVisitors((count: number) => {
      this.zone.run(() => {
        this.activeNowCount = count;
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
    this.ctaChartInstance?.destroy();
    this.sectionChartInstance?.destroy();
    this.themeObserver?.disconnect();
    this.leafletMap?.remove();
    this.mapMarkers.clear();
    this.unsubConversations?.();
    this.unsubConvMessages?.();
    this.unsubTestEmail?.();
    this.unsubActiveNow?.();
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


  private chartColors() {
    return {
      accent:     '#e4e4e7',
      areaStart:  'rgba(228,228,231,0.16)',
      areaEnd:    'rgba(228,228,231,0)',
      grid:       '#27272a',
      tickColor:  '#71717a',
    };
  }

  private initLineChart(): void {
    if (!this.chartCanvas?.nativeElement) return;
    this.lineChartInstance?.destroy();

    const start = new Date(this.chartDateStart + 'T00:00:00');
    const end   = new Date(this.chartDateEnd   + 'T23:59:59');
    const totalDays = Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1;

    const days = Array.from({ length: totalDays }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });

    const sameDay = (d1: Date, d2: Date) =>
      d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();

    const labels = days.map(d => d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }));
    const counts = days.map(day =>
      this.visitors.filter(v => sameDay(new Date(v.lastSeen), day)).length
    );

    const c = this.chartColors();
    const ctx = this.chartCanvas.nativeElement.getContext('2d')!;
    const grad = ctx.createLinearGradient(0, 0, 0, 220);
    grad.addColorStop(0, c.areaStart);
    grad.addColorStop(1, c.areaEnd);

    const datasets: any[] = [{
      label: 'Período atual',
      data: counts,
      borderColor: c.accent,
      backgroundColor: grad,
      borderWidth: 2,
      pointBackgroundColor: c.accent,
      pointRadius: 4,
      pointHoverRadius: 6,
      fill: true,
      tension: 0.35,
    }];

    if (this.showPeriodCompare) {
      const prevStart = new Date(this.chartCompareStart + 'T00:00:00');
      const prevCounts = days.map((_, i) => {
        const prevDay = new Date(prevStart);
        prevDay.setDate(prevStart.getDate() + i);
        return this.visitors.filter(v => sameDay(new Date(v.lastSeen), prevDay)).length;
      });
      datasets.push({
        label: 'Período anterior',
        data: prevCounts,
        borderColor: 'rgba(161,161,170,0.7)',
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderDash: [5, 4],
        pointBackgroundColor: 'rgba(139,92,246,0.7)',
        pointRadius: 3,
        fill: false,
        tension: 0.35,
      });
    }

    this.lineChartInstance = new Chart(ctx, {
      type: 'line',
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { display: this.showPeriodCompare, labels: { color: c.tickColor, boxWidth: 12, font: { size: 10 } } },
          tooltip: { mode: 'index', intersect: false },
        },
        scales: {
          x: { grid: { color: c.grid }, ticks: { color: c.tickColor, font: { size: 11 }, maxTicksLimit: 14 } },
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
      this.initCtaChart();
      this.initSectionChart();
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
    this.computeJourneyMap();
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
    const firstActionsBySession = new Map<string, number>();
    const deepReadSessionSet = new Set<string>();
    const resumeSessionSet = new Set<string>();
    const directContactSessionSet = new Set<string>();
    this.visitorSignals.clear();

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
        if (event.section === 'experiencia' && event.visitorId) {
          this.markSignal(event.visitorId, 'readExperience');
        }
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
        if (category === 'direct_contact') {
          this.addSessionToMap(sourceDirectContacts, source, sessionId);
          directContactSessionSet.add(sessionId);
          if (event.visitorId) this.markSignal(event.visitorId, 'directContact');
        }
        if (category === 'resume') {
          this.addSessionToMap(sourceResumeDownloads, source, sessionId);
          resumeSessionSet.add(sessionId);
          if (event.visitorId) this.markSignal(event.visitorId, 'resumeDownload');
        }
      }

      if (event.eventType === 'experience_expand') {
        deepReadSessionSet.add(sessionId);
        if (event.visitorId) this.markSignal(event.visitorId, 'deepRead');
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
      'experiencia',
      'habilidades',
      'escolaridade',
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

    // ── Funil de recrutamento: da visita ao contato ────────────────────────
    const experienceSessionCount = sectionSessions.get('experiencia')?.size ?? 0;
    const contactSectionSessions = sectionSessions.get('contato')?.size ?? 0;

    this.totalSessions = totalVisitSessions;
    this.experienceSessions = experienceSessionCount;
    this.experienceReachRate = totalVisitSessions > 0
      ? Math.round((experienceSessionCount / totalVisitSessions) * 100)
      : 0;
    this.deepReadSessions = deepReadSessionSet.size;
    this.resumeDownloads = resumeSessionSet.size;
    this.directContacts = directContactSessionSet.size;

    this.contactFunnelSteps = [
      { label: 'Sessões', value: totalVisitSessions, color: '#e4e4e7' },
      { label: 'Leram a experiência', value: experienceSessionCount, color: '#c4c4c8' },
      { label: 'Leitura profunda', value: deepReadSessionSet.size, color: '#a1a1aa' },
      { label: 'Chegaram no contato', value: contactSectionSessions, color: '#818188' },
      { label: 'Baixaram CV ou contataram', value: new Set([...resumeSessionSet, ...directContactSessionSet]).size, color: '#4ade80' },
    ];

    // ── Origem × qualidade ────────────────────────────────────────────────
    // Qualidade = a origem traz gente que realmente lê e converte,
    // não apenas volume de acessos.
    const sourceExperience = new Map<string, Set<string>>();
    const sourceConverted = new Map<string, Set<string>>();
    for (const [sessionId, source] of sessionSource.entries()) {
      if (sectionSessions.get('experiencia')?.has(sessionId)) {
        this.addSessionToMap(sourceExperience, source, sessionId);
      }
      if (resumeSessionSet.has(sessionId) || directContactSessionSet.has(sessionId)) {
        this.addSessionToMap(sourceConverted, source, sessionId);
      }
    }

    this.sourceQuality = [...sourceVisits.entries()]
      .map(([source, sessions]) => {
        const total = sessions.size;
        const readExperience = sourceExperience.get(source)?.size ?? 0;
        return {
          source,
          sessions: total,
          readExperience,
          conversions: sourceConverted.get(source)?.size ?? 0,
          qualityRate: total > 0 ? Math.round((readExperience / total) * 100) : 0,
        } satisfies SourceQualityRow;
      })
      .sort((a, b) => b.conversions - a.conversions || b.qualityRate - a.qualityRate || b.sessions - a.sessions);

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

  }

  /**
   * Sem eventos de navegação gravados só dá para contar visitantes e origem
   * pelo referrer. Nada de funil ou taxas — seria número inventado.
   */
  private computeInsightsFallback(): void {
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

    this.sourceQuality = [];
    this.contactFunnelSteps = [];
    this.ctaPerformance = [];
    this.sectionReachRows = [];
    this.totalSessions = 0;
    this.experienceSessions = 0;
    this.experienceReachRate = 0;
    this.deepReadSessions = 0;
    this.resumeDownloads = 0;
    this.directContacts = 0;
    this.firstActionAvgSeconds = 0;
    this.firstActionMedianSeconds = 0;
    this.firstActionBySource = [];
    this.visitorSignals.clear();
  }

  /** Registra um sinal de interesse do visitante (usado pelo score). */
  private markSignal(visitorId: string, signal: keyof VisitorSignals): void {
    const current = this.visitorSignals.get(visitorId)
      ?? { readExperience: false, deepRead: false, resumeDownload: false, directContact: false };
    current[signal] = true;
    this.visitorSignals.set(visitorId, current);
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
        return '#a1a1aa';
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
    return '#e4e4e7';
  }

  heatLegendColor(t: number): string {
    return this.heatColorByIntensity(t);
  }

  pct(ratio: number): number {
    return Math.round(ratio * 100);
  }

  // ── Funil SVG ─────────────────────────────────────────────────────────
  /** Funil em barras: cada etapa como % do topo, com a queda em relação à anterior. */
  get funnelBars() {
    const steps = this.contactFunnelSteps;
    if (!steps.length) return [];
    const topValue = steps[0].value || 1;
    return steps.map((step, i) => ({
      label: step.label,
      value: step.value,
      color: step.color,
      pct: Math.round((step.value / topValue) * 100),
      dropPct: i > 0
        ? Math.round((1 - step.value / (steps[i - 1].value || 1)) * 100)
        : null,
    }));
  }

  // ── Charts horizontais de barra ────────────────────────────────────────
  private initCtaChart(): void {
    const el = this.ctaChartCanvas?.nativeElement;
    if (!el || !this.ctaPerformance.length) return;
    this.ctaChartInstance?.destroy();

    const isDark = !document.documentElement.classList.contains('light');
    const gridColor  = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)';
    const tickColor  = isDark ? '#9ca3af' : '#374151';
    const categoryColors: Record<string, string> = {
      project: '#a1a1aa', direct_contact: '#4ade80', resume: '#fbbf24',
      navigation: '#71717a', contact: '#e4e4e7',
    };
    const rows = this.ctaPerformance.slice(0, 12);
    const labels = rows.map(r => r.label.length > 22 ? r.label.slice(0, 20) + '…' : r.label);
    const colors = rows.map(r => categoryColors[r.category] ?? '#a1a1aa');

    const ctaDatalabels = {
      id: 'ctaBarDatalabels',
      afterDatasetsDraw(chart: any) {
        const ctx2 = chart.ctx as CanvasRenderingContext2D;
        const dark = !document.documentElement.classList.contains('light');
        const labelPrimary   = dark ? '#e5e7eb' : '#1f2937';
        const labelSecondary = dark ? '#6b7280' : '#6b7280';
        chart.data.datasets.forEach((_: any, di: number) => {
          const meta = chart.getDatasetMeta(di);
          meta.data.forEach((bar: any, j: number) => {
            const val = chart.data.datasets[di].data[j] as number;
            if (val <= 0) return;
            const clicks = rows[j]?.clicks ?? '';
            ctx2.save();
            ctx2.fillStyle = labelPrimary;
            ctx2.font = 'bold 12px Inter, ui-sans-serif, sans-serif';
            ctx2.textAlign = 'left';
            ctx2.textBaseline = 'middle';
            const x = Math.min(bar.x + 6, chart.chartArea.right - 58);
            ctx2.fillText(`${val}%`, x, bar.y);
            ctx2.fillStyle = labelSecondary;
            ctx2.font = '11px Inter, ui-sans-serif, sans-serif';
            ctx2.fillText(`${clicks}×`, x + 34, bar.y);
            ctx2.restore();
          });
        });
      },
    };

    this.ctaChartInstance = new Chart(el, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'CTR %',
          data: rows.map(r => r.ctr),
          backgroundColor: colors.map(c => c + '33'),
          borderColor: colors,
          borderWidth: 1.5,
          borderRadius: 4,
          borderSkipped: false,
        }],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { right: 16 } },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => ` ${ctx.parsed.x}% CTR · ${rows[ctx.dataIndex].clicks} cliques`,
            },
          },
        },
        scales: {
          x: {
            beginAtZero: true, max: 100,
            grid: { color: gridColor },
            ticks: { color: tickColor, font: { size: 13 }, callback: v => v + '%' },
          },
          y: {
            grid: { color: 'transparent' },
            ticks: { color: tickColor, font: { size: 13 } },
          },
        },
      },
      plugins: [ctaDatalabels],
    });
  }

  private initSectionChart(): void {
    const el = this.sectionChartCanvas?.nativeElement;
    if (!el || !this.sectionReachRows.length) return;
    this.sectionChartInstance?.destroy();

    const isDark = !document.documentElement.classList.contains('light');
    const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)';
    const tickColor = isDark ? '#9ca3af' : '#374151';
    const accent = this.accentColor;
    const rows = this.sectionReachRows;

    const sectionDatalabels = {
      id: 'sectionBarDatalabels',
      afterDatasetsDraw(chart: any) {
        const ctx2 = chart.ctx as CanvasRenderingContext2D;
        const dark = !document.documentElement.classList.contains('light');
        const labelPrimary   = dark ? '#e5e7eb' : '#1f2937';
        const labelSecondary = dark ? '#6b7280' : '#6b7280';
        chart.data.datasets.forEach((_: any, di: number) => {
          const meta = chart.getDatasetMeta(di);
          meta.data.forEach((bar: any, j: number) => {
            const val = chart.data.datasets[di].data[j] as number;
            if (val <= 0) return;
            const sessions = rows[j]?.sessions ?? '';
            ctx2.save();
            ctx2.fillStyle = labelPrimary;
            ctx2.font = 'bold 12px Inter, ui-sans-serif, sans-serif';
            ctx2.textAlign = 'left';
            ctx2.textBaseline = 'middle';
            const x = Math.min(bar.x + 6, chart.chartArea.right - 68);
            ctx2.fillText(`${val}%`, x, bar.y);
            ctx2.fillStyle = labelSecondary;
            ctx2.font = '11px Inter, ui-sans-serif, sans-serif';
            ctx2.fillText(`${sessions} sess.`, x + 34, bar.y);
            ctx2.restore();
          });
        });
      },
    };

    this.sectionChartInstance = new Chart(el, {
      type: 'bar',
      data: {
        labels: rows.map(r => r.label),
        datasets: [{
          label: 'Alcance %',
          data: rows.map(r => r.reachRate),
          backgroundColor: accent + '33',
          borderColor: accent,
          borderWidth: 1.5,
          borderRadius: 4,
          borderSkipped: false,
        }],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { right: 16 } },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => ` ${ctx.parsed.x}% · ${rows[ctx.dataIndex].sessions} sessões`,
            },
          },
        },
        scales: {
          x: {
            beginAtZero: true, max: 100,
            grid: { color: gridColor },
            ticks: { color: tickColor, font: { size: 13 }, callback: v => v + '%' },
          },
          y: {
            grid: { color: 'transparent' },
            ticks: { color: tickColor, font: { size: 13 } },
          },
        },
      },
      plugins: [sectionDatalabels],
    });
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
    const defaultColor = '#a1a1aa';
    const selectedColor = '#4ade80';
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

  /** Escala monocromática: quanto mais acessos, mais claro o bloco. */
  private heatColorByIntensity(t: number): string {
    if (t <= 0) return 'rgb(24,24,27)';
    const v = Math.round(63 + t * 165);
    return `rgba(${v},${v},${v + 3},${+(0.35 + t * 0.65).toFixed(2)})`;
  }

  private computeExtraStats(): void {
    const dayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    // ── Heatmap ────────────────────────────────────────────────────────────
    const grid: number[][] = Array.from({ length: 7 }, () => new Array(24).fill(0));
    // Só acessos reais — usa o evento de visita quando houver, senão lastSeen.
    const times: Date[] = this.analyticsEvents.length > 0
      ? this.analyticsEvents
          .filter(e => e.eventType === 'page_visit')
          .map(e => new Date(e.createdAt))
      : this.visitors.map(v => new Date(v.lastSeen));
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
          color: this.heatColorByIntensity(count / maxVal),
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
    const deviceItems = [
      { label: 'Desktop', value: desktop, color: '#e4e4e7' },
      { label: 'Mobile',  value: mobile,  color: '#a1a1aa' },
      { label: 'Tablet',  value: tablet,  color: '#52525b' },
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
