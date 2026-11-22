import { Component, inject, OnInit, AfterViewInit, OnDestroy, ChangeDetectorRef, ElementRef, ViewChild, NgZone } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FirebaseService, VisitorRecord, AnalyticsEventRecord } from '../../../core/services/firebase.service';
import { AdminLiveComponent } from '../admin-live/admin-live.component';
import {
  ScoreInfo, ctaLabel, hasNetworkInfo, isMobile, isTablet, networkKindMeta, networkSummary, scoreTier,
  sectionLabel, sourceFromReferrer,
} from '../admin-utils';
import {
  Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip, Legend,
} from 'chart.js';

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip, Legend);

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

type AdminTab = 'live' | 'leads' | 'analytics' | 'tests';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [DatePipe, FormsModule, RouterLink, AdminLiveComponent],
  template: `
    <div class="adm">
      <!-- Sidebar (desktop) -->
      <aside class="adm-side">
        <a routerLink="/" class="adm-brand">
          <span class="adm-brand-mark">EG</span>
          <span>Painel</span>
        </a>
        <nav class="adm-nav" aria-label="Seções do painel">
          @for (t of tabs; track t.key) {
            <button type="button" class="adm-nav-item" [class.is-active]="activeTab === t.key" (click)="setTab(t.key)">
              <span class="adm-nav-icon" [innerHTML]="t.icon"></span>
              <span class="flex-1 text-left">{{ t.label }}</span>
              @if (t.key === 'live' && activeNowCount > 0) { <span class="adm-badge is-live">{{ activeNowCount }}</span> }
              @if (t.key === 'leads' && hotLeads.length > 0) { <span class="adm-badge">{{ hotLeads.length }}</span> }
            </button>
          }
        </nav>
        <div class="adm-side-foot">
          <button type="button" (click)="togglePushNotifications()" [disabled]="pushLoading" class="adm-side-btn">
            <span class="adm-status-dot" [class.is-on]="pushEnabled"></span>
            {{ pushLoading ? 'Ativando…' : pushEnabled ? 'Push ativo' : 'Ativar push' }}
          </button>
          <a routerLink="/" class="adm-side-btn">↗ Ver site</a>
          <button type="button" (click)="logout()" class="adm-side-btn">Sair</button>
        </div>
      </aside>

      <!-- Topbar (mobile) -->
      <header class="adm-topbar">
        <a routerLink="/" class="adm-brand"><span class="adm-brand-mark">EG</span><span>Painel</span></a>
        <div class="flex items-center gap-2">
          <span class="adm-live-pill"><span class="adm-status-dot is-on is-pulse"></span>{{ activeNowCount }} online</span>
          <button type="button" (click)="logout()" class="adm-side-btn !w-auto">Sair</button>
        </div>
      </header>

      <main class="adm-main admin-page">
        <div class="adm-page-head">
          <div>
            <h1>{{ currentTab.label }}</h1>
            <p>{{ currentTab.hint }}</p>
          </div>
          <div class="adm-sync" [class.is-error]="syncError">
            <span class="adm-status-dot" [class.is-on]="!syncError && !loading" [class.is-pulse]="!syncError && !loading"></span>
            @if (syncError) { Sem conexão em tempo real }
            @else if (loading) { Conectando… }
            @else { Tempo real · atualizado {{ lastSyncAt | date:'HH:mm:ss' }} }
          </div>
        </div>

        @if (activeTab === 'live') {
          <app-admin-live
            [visitors]="visitors"
            [events]="analyticsEvents"
            [loading]="loading"
            [scoreOf]="scoreInfoFn"
            [(selectedId)]="selectedVisitorId" />
        }

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

        <!-- Gráficos -->
        <div class="grid grid-cols-1 gap-6">

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
                  <div class="bars">
                    @for (h of heatTopHours; track h.label) {
                  <div class="bar-row">
                    <div class="bar-head">
                      <span class="bar-label">{{ h.label }}</span>
                      <span class="bar-value">{{ h.count }}<small>eventos</small></span>
                    </div>
                    <div class="bar-track"><div class="bar-fill" [style.width.%]="h.pct"></div></div>
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
                <div class="bars">
                  @for (v of topReturnList; track $index) {
                  <div class="bar-row">
                    <div class="bar-head">
                      <span class="bar-label">{{ v.city || v.ip }}</span>
                      <span class="bar-value">{{ v.visitCount }}<small>visitas</small></span>
                    </div>
                    <div class="bar-track"><div class="bar-fill" [style.width.%]="topReturnList[0].visitCount > 0 ? (v.visitCount / topReturnList[0].visitCount) * 100 : 0"></div></div>
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
              <div class="bars">
                @for (step of funnelBars; track step.label; let i = $index) {
                  <div class="bar-row">
                    <div class="bar-head">
                      <span class="bar-label"><span class="bar-index">{{ i + 1 }}</span>{{ step.label }}</span>
                      <span class="bar-value">{{ step.value }}<small>{{ step.pct }}%</small></span>
                    </div>
                    <div class="bar-track"><div class="bar-fill" [style.width.%]="step.pct"></div></div>
                    @if (step.dropPct !== null && step.dropPct > 0) {
                      <p class="bar-note">−{{ step.dropPct }}% em relação à etapa anterior</p>
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
              <div class="bars">
                @for (row of ctaPerformance.slice(0, 12); track row.key) {
                  <div class="bar-row">
                    <div class="bar-head">
                      <span class="bar-label">{{ row.label }}</span>
                      <span class="bar-value">{{ row.ctr }}%<small>{{ row.clicks }} cliques · {{ row.uniqueSessions }} sessões</small></span>
                    </div>
                    <div class="bar-track"><div class="bar-fill" [style.width.%]="row.ctr"></div></div>
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
            <p class="text-xs text-gray-500 mb-4">Profundidade real de leitura da página por sessão.</p>
            @if (!loading && sectionReachRows.length > 0) {
              <div class="bars">
                @for (row of sectionReachRows; track row.key) {
                  <div class="bar-row">
                    <div class="bar-head">
                      <span class="bar-label">{{ row.label }}</span>
                      <span class="bar-value">{{ row.reachRate }}%<small>{{ row.sessions }} sessões</small></span>
                    </div>
                    <div class="bar-track"><div class="bar-fill" [style.width.%]="row.reachRate"></div></div>
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
            <p class="text-xs text-gray-500 uppercase tracking-widest mb-1 font-semibold">Origem × Qualidade</p>
            <p class="text-xs text-gray-500 mb-4">
              Não é só quem traz mais visita — é quem traz visita que lê a experiência e entra em contato.
            </p>
            @if (!loading && sourceQuality.length > 0) {
              <div class="bars">
                @for (row of sourceQuality; track row.source) {
                  <div class="bar-row">
                    <div class="bar-head">
                      <span class="bar-label">{{ row.source }}</span>
                      <span class="bar-value">{{ row.qualityRate }}%<small>qualificadas</small></span>
                    </div>
                    <div class="bar-track"><div class="bar-fill" [style.width.%]="row.qualityRate"></div></div>
                    <p class="bar-note">
                      {{ row.sessions }} sessões · {{ row.readExperience }} leram experiência ·
                      <span [class.text-green-400]="row.conversions > 0">{{ row.conversions }} converteram</span>
                    </p>
                  </div>
                }
              </div>
              <p class="text-xs text-gray-600 mt-4">
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
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div class="admin-card rounded-xl p-5 border border-red-500/30 bg-red-500/5">
              <p class="text-sm font-semibold text-red-500 mb-2">🔥 Leads quentes</p>
              <p class="text-4xl font-bold text-red-500">{{ hotLeads.length }}</p>
              <p class="text-xs font-medium text-red-400 mt-2">Score ≥ 60</p>
            </div>
            <div class="admin-card rounded-xl p-5 border border-amber-500/30 bg-amber-500/5">
              <p class="text-sm font-semibold text-amber-500 mb-2">🌡 Leads mornos</p>
              <p class="text-4xl font-bold text-amber-500">{{ warmLeads.length }}</p>
              <p class="text-xs font-medium text-amber-400 mt-2">Score 30–59</p>
            </div>
            <div class="admin-card rounded-xl p-5 border border-blue-500/30 bg-blue-500/5">
              <p class="text-sm font-semibold text-blue-500 mb-2">❄️ Leads frios</p>
              <p class="text-4xl font-bold text-blue-500">{{ visitors.length - hotLeads.length - warmLeads.length }}</p>
              <p class="text-xs font-medium text-blue-400 mt-2">Score &lt; 30</p>
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
                    <th class="text-left px-4 py-3">Rede</th>
                    <th class="text-left px-4 py-3">Por quê</th>
                    <th class="text-left px-4 py-3 whitespace-nowrap">Última visita</th>
                  </tr>
                </thead>
                <tbody>
                  @for (v of paginatedLeads; track v.id) {
                    @let score = computeVisitorScore(v);
                    @let sl = scoreLabel(score);
                    <tr class="border-b border-gray-800/40 hover:bg-gray-800/30 transition-colors cursor-pointer"
                        tabindex="0" title="Abrir no mapa ao vivo"
                        (click)="openVisitor(v)" (keydown.enter)="openVisitor(v)">
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
                      <td class="px-4 py-3 text-xs text-gray-400 max-w-56">
                        @if (hasNetworkInfo(v)) {
                          @let nk = networkKindMeta(v);
                          <div class="truncate" [title]="networkSummary(v)">{{ networkSummary(v) }}</div>
                          <span class="inline-block mt-1 rounded-full px-2 py-0.5 text-[11px] font-semibold" [style.background]="nk.bg" [style.color]="nk.fg">{{ nk.label }}</span>
                        } @else { <span class="text-gray-700">—</span> }
                      </td>
                      <td class="px-4 py-3 text-xs text-gray-400">{{ scoreReasons(v).join(' · ') || '—' }}</td>
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

      <!-- Navegação inferior (mobile) -->
      <nav class="adm-bottom" aria-label="Seções do painel">
        @for (t of tabs; track t.key) {
          <button type="button" [class.is-active]="activeTab === t.key" (click)="setTab(t.key)">
            <span class="adm-nav-icon" [innerHTML]="t.icon"></span>
            <span>{{ t.short }}</span>
            @if (t.key === 'leads' && hotLeads.length > 0) { <span class="adm-bottom-badge">{{ hotLeads.length }}</span> }
          </button>
        }
      </nav>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .adm { min-height: 100dvh; background: var(--bg); color: var(--fg); }

    .adm-side { display: none; }
    .adm-topbar { position: sticky; top: 0; z-index: 40; display: flex; align-items: center; justify-content: space-between; height: 3.5rem; padding: 0 1rem; background: rgba(9,9,11,.85); backdrop-filter: blur(10px); border-bottom: 1px solid var(--border); }
    .adm-main { padding: 1.25rem 1rem 6rem; display: flex; flex-direction: column; gap: 1.5rem; min-width: 0; }

    @media (min-width: 1024px) {
      .adm-side { position: fixed; inset: 0 auto 0 0; width: 15rem; z-index: 40; display: flex; flex-direction: column; gap: 1.5rem; padding: 1.25rem 0.85rem; border-right: 1px solid var(--border); background: var(--bg-raised); }
      .adm-topbar, .adm-bottom { display: none !important; }
      .adm-main { margin-left: 15rem; padding: 1.5rem 2rem 2.5rem; }
    }

    .adm-brand { display: inline-flex; align-items: center; gap: 0.6rem; padding: 0 0.4rem; font-weight: 600; font-size: 0.9375rem; color: var(--fg); }
    .adm-brand-mark { display: grid; place-items: center; width: 1.9rem; height: 1.9rem; border-radius: 0.55rem; background: var(--fg); color: var(--bg); font: 700 0.75rem/1 var(--font-display); letter-spacing: -0.02em; }

    .adm-nav { display: flex; flex-direction: column; gap: 0.2rem; }
    .adm-nav-item { display: flex; align-items: center; gap: 0.7rem; padding: 0.6rem 0.7rem; border-radius: 0.6rem; font-size: 0.875rem; color: var(--fg-muted); transition: background .15s, color .15s; }
    .adm-nav-item:hover { color: var(--fg); background: rgba(255,255,255,.03); }
    .adm-nav-item.is-active { color: var(--fg); background: var(--surface); box-shadow: inset 0 0 0 1px var(--border); }
    .adm-nav-icon { display: inline-grid; place-items: center; width: 1.1rem; height: 1.1rem; flex: none; }
    .adm-nav-icon svg { width: 100%; height: 100%; }
    .adm-badge { font-size: 0.6875rem; font-weight: 700; padding: 0.05rem 0.45rem; border-radius: 999px; background: rgba(251,191,36,.15); color: #fbbf24; }
    .adm-badge.is-live { background: rgba(74,222,128,.15); color: #4ade80; }

    .adm-side-foot { margin-top: auto; display: flex; flex-direction: column; gap: 0.25rem; padding-top: 1rem; border-top: 1px solid var(--border); }
    .adm-side-btn { display: flex; align-items: center; gap: 0.6rem; width: 100%; padding: 0.5rem 0.7rem; border-radius: 0.55rem; font-size: 0.8125rem; color: var(--fg-muted); text-align: left; transition: background .15s, color .15s; }
    .adm-side-btn:hover { color: var(--fg); background: rgba(255,255,255,.03); }
    .adm-side-btn:disabled { opacity: .5; }

    .adm-status-dot { display: inline-block; width: 0.5rem; height: 0.5rem; border-radius: 999px; background: var(--fg-faint); flex: none; }
    .adm-status-dot.is-on { background: #4ade80; }
    .adm-status-dot.is-pulse { animation: adm-ping 1.8s infinite; }
    @keyframes adm-ping { 0% { box-shadow: 0 0 0 0 rgba(74,222,128,.5); } 70% { box-shadow: 0 0 0 6px rgba(74,222,128,0); } 100% { box-shadow: 0 0 0 0 rgba(74,222,128,0); } }
    .adm-live-pill { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.25rem 0.6rem; border-radius: 999px; border: 1px solid var(--border); font-size: 0.75rem; color: var(--fg-muted); }

    .adm-page-head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 0.75rem 1.5rem; }
    .adm-page-head h1 { font: 600 1.5rem/1.15 var(--font-display); letter-spacing: -0.02em; }
    .adm-page-head p { font-size: 0.8125rem; color: var(--fg-faint); margin-top: 0.25rem; }
    .adm-sync { display: inline-flex; align-items: center; gap: 0.5rem; font-size: 0.75rem; color: var(--fg-faint); }
    .adm-sync.is-error { color: #f87171; }
    .adm-sync.is-error .adm-status-dot { background: #f87171; }

    .adm-bottom { position: fixed; z-index: 40; left: 0; right: 0; bottom: 0; display: grid; grid-template-columns: repeat(4, 1fr); padding: 0.35rem 0.5rem calc(0.35rem + env(safe-area-inset-bottom)); background: rgba(9,9,11,.92); backdrop-filter: blur(10px); border-top: 1px solid var(--border); }
    .adm-bottom button { position: relative; display: flex; flex-direction: column; align-items: center; gap: 0.2rem; padding: 0.4rem 0; font-size: 0.6875rem; color: var(--fg-faint); border-radius: 0.5rem; }
    .adm-bottom button.is-active { color: var(--fg); }
    .bars { display: flex; flex-direction: column; gap: 0.9rem; }
    .bar-head { display: flex; align-items: baseline; justify-content: space-between; gap: 0.75rem; margin-bottom: 0.4rem; }
    .bar-label { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.8125rem; color: var(--fg); }
    .bar-index { display: inline-block; width: 1.1rem; font-family: var(--font-mono); font-size: 0.6875rem; color: var(--fg-faint); }
    .bar-value { flex: none; font-size: 0.8125rem; font-weight: 600; color: var(--fg); font-variant-numeric: tabular-nums; white-space: nowrap; }
    .bar-value small { margin-left: 0.45rem; font-size: 0.75rem; font-weight: 400; color: var(--fg-faint); }
    .bar-track { height: 0.5rem; border-radius: 999px; background: var(--bg-raised); box-shadow: inset 0 0 0 1px var(--border); overflow: hidden; }
    .bar-fill { height: 100%; min-width: 2px; border-radius: 999px; background: #d4d4d8; transition: width .6s ease; }
    .bar-note { margin-top: 0.35rem; font-size: 0.6875rem; color: var(--fg-faint); }
    .adm-bottom-badge { position: absolute; top: 0.1rem; left: calc(50% + 0.4rem); font-size: 0.625rem; font-weight: 700; padding: 0 0.3rem; border-radius: 999px; background: #fbbf24; color: #09090b; }
  `],
})
export class AdminDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  private lineChartInstance?: Chart;
  private themeObserver?: MutationObserver;

  private firebase = inject(FirebaseService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private zone = inject(NgZone);
  @ViewChild('convMsgContainer') convMsgContainer?: ElementRef<HTMLDivElement>;

  visitors: VisitorRecord[] = [];
  analyticsEvents: AnalyticsEventRecord[] = [];
  loading = true;
  selectedVisitorId: string | null = null;

  // ── Navegação ────────────────────────────────────────────────────────
  private sanitizer = inject(DomSanitizer);
  readonly tabs: { key: AdminTab; label: string; short: string; hint: string; icon: SafeHtml }[] = ([
    { key: 'live', label: 'Ao vivo', short: 'Ao vivo', hint: 'Mapa e visitantes atualizando em tempo real. Clique em um ponto ou em uma linha para ver detalhes.',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>' },
    { key: 'leads', label: 'Leads', short: 'Leads', hint: 'Visitantes ordenados por interesse. Clique em uma linha para abrir no mapa.',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/></svg>' },
    { key: 'analytics', label: 'Análises', short: 'Análises', hint: 'Engajamento, origem do tráfego e funil — recalculados a cada novo evento.',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 5-6"/></svg>' },
    { key: 'tests', label: 'Ferramentas', short: 'Ferram.', hint: 'Teste de push, email e token FCM.',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z"/></svg>' },
  ] as const).map(t => ({ ...t, icon: this.sanitizer.bypassSecurityTrustHtml(t.icon) }));  // SVGs estáticos, sem entrada de usuário

  get currentTab() {
    return this.tabs.find(t => t.key === this.activeTab) ?? this.tabs[0];
  }

  setTab(tab: AdminTab): void {
    this.activeTab = tab;
    this.cdr.detectChanges();
    // Canvases ficam ocultos fora da aba; recria ao abrir para pegar o tamanho real.
    if (tab === 'analytics') setTimeout(() => this.initCharts(), 0);
  }

  /** Abre o visitante na aba ao vivo (mapa + detalhes). */
  openVisitor(v: VisitorRecord): void {
    this.selectedVisitorId = v.id ?? null;
    this.setTab('live');
  }

  async logout(): Promise<void> {
    await this.firebase.logout();
    void this.router.navigate(['/']);
  }

  // helpers de rede usados no template
  readonly hasNetworkInfo = hasNetworkInfo;
  readonly networkSummary = networkSummary;
  readonly networkKindMeta = networkKindMeta;

  // ── Tempo real ───────────────────────────────────────────────────────
  syncError = false;
  lastSyncAt = new Date();
  private rawVisitors: VisitorRecord[] = [];
  private rawEvents: AnalyticsEventRecord[] = [];
  private visitorsReady = false;
  private eventsReady = false;
  private rebuildTimer?: ReturnType<typeof setTimeout>;
  private unsubVisitors?: () => void;
  private unsubEvents?: () => void;
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
  /** dono do site + servidor dos testes automatizados: fora de todas as métricas */
  private readonly OWNER_IPS = ['45.179.22.183', '138.255.215.188', '177.104.188.141'];

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
  activeTab: AdminTab = 'live';

  // ── Score de visitante ───────────────────────────────────────────────
  /** Recriada a cada rebuild para o componente ao vivo recalcular. */
  scoreInfoFn: (v: VisitorRecord) => ScoreInfo = v => this.buildScoreInfo(v);

  private buildScoreInfo(v: VisitorRecord): ScoreInfo {
    const score = this.computeVisitorScore(v);
    return { score, tier: scoreTier(score), label: this.scoreLabel(score).label, reasons: this.scoreReasons(v) };
  }

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

  exportLeadsCsv(): void {
    const rows = [
      ['IP', 'Cidade', 'País', 'Visitas', 'Score', 'Categoria', 'Primeira Visita', 'Última Visita'],
      ...this.visitors
        .map(v => {
          const score = this.computeVisitorScore(v);
          const { label } = this.scoreLabel(score);
          return [
            v.ip, v.city ?? '', v.country ?? '',
            v.visitCount, score, label.replace(/[🔥🌡❄️ ]/g, '').trim(),
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

  pushEnabled = false;
  pushLoading = false;

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

  async ngOnInit(): Promise<void> {
    void this.firebase.setOwnerOnline(true);
    // Verifica se já tem token FCM salvo
    const token = await this.firebase.getSavedFCMToken();
    this.pushEnabled = !!token;
    this.savedFcmToken = token;
    this.checkPushPermission();
    const onError = (err: unknown) => this.zone.run(() => {
      console.error('[Dashboard] realtime', err);
      this.syncError = true;
      this.loading = false;
      this.cdr.detectChanges();
    });

    this.unsubVisitors = this.firebase.listenVisitors(visitors => this.zone.run(() => {
      this.rawVisitors = visitors;
      this.visitorsReady = true;
      this.scheduleRebuild();
    }), onError);

    this.unsubEvents = this.firebase.listenAnalyticsEvents(events => this.zone.run(() => {
      this.rawEvents = events;
      this.eventsReady = true;
      this.scheduleRebuild();
    }), onError);

    // Listener visitantes ativos agora (presence)
    this.unsubActiveNow = this.firebase.listenActiveVisitors((count: number) => {
      this.zone.run(() => {
        this.activeNowCount = count;
        this.cdr.detectChanges();
      });
    });
  }

  ngAfterViewInit(): void {}

  /** Agrupa rajadas de snapshots (visitante + evento chegam juntos) num único recálculo. */
  private scheduleRebuild(): void {
    if (!this.visitorsReady || !this.eventsReady) return;
    clearTimeout(this.rebuildTimer);
    this.rebuildTimer = setTimeout(() => this.applySnapshot(), this.loading ? 0 : 400);
  }

  private applySnapshot(): void {
    const ignoredVisitorIds = new Set(
      this.rawVisitors.filter(v => v.id && this.OWNER_IPS.includes(v.ip)).map(v => v.id!),
    );
    this.visitors = this.rawVisitors.filter(v => !this.OWNER_IPS.includes(v.ip));
    this.analyticsEvents = this.rawEvents.filter(event => {
      if (event.ip && this.OWNER_IPS.includes(event.ip)) return false;
      if (event.visitorId && ignoredVisitorIds.has(event.visitorId)) return false;
      return true;
    });

    this.loading = false;
    this.syncError = false;
    this.lastSyncAt = new Date();
    this.rebuildDashboardState();
    this.scoreInfoFn = v => this.buildScoreInfo(v);
    this.cdr.detectChanges();
    if (this.activeTab === 'analytics') this.initCharts();
  }

  private initCharts(): void {
    this.initLineChart();
  }

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
  ngOnDestroy(): void {
    void this.firebase.setOwnerOnline(false);
    this.lineChartInstance?.destroy();
    this.themeObserver?.disconnect();
    this.unsubVisitors?.();
    this.unsubEvents?.();
    clearTimeout(this.rebuildTimer);
    this.unsubTestEmail?.();
    this.unsubActiveNow?.();
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
    const totalDays = Math.floor((end.getTime() - start.getTime()) / 86_400_000) + 1;

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

  private rebuildDashboardState(): void {
    this.computeExtraStats();
    this.computeAnalyticsInsights();
    this.computeJourneyMap();
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
          label: ctaLabel(key),
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
      'intro',
      'detalhes',
      'experiencia',
      'cases',
      'habilidades',
      'escolaridade',
      'contato',
    ];
    this.sectionReachRows = orderedSections.map(section => {
      const sessions = sectionSessions.get(section)?.size ?? 0;
      return {
        key: section,
        label: sectionLabel(section),
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
      const source = sourceFromReferrer(visitor.referrer);
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
      if (isTablet(v.userAgent)) tablet++;
      else if (isMobile(v.userAgent)) mobile++;
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
