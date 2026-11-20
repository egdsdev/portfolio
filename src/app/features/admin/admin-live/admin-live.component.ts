import {
  AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, ViewEncapsulation,
  computed, effect, inject, input, model, signal, untracked,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
import { AnalyticsEventRecord, FirebaseService, VisitorRecord } from '../../../core/services/firebase.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import {
  ScoreInfo, browserLabel, deviceLabel, escapeHtml, eventLabel, hasNetworkInfo, isOnline,
  locationLabel, networkKindMeta, networkKindTitle, networkSummary, relativeTime, sourceFromReferrer,
} from '../admin-utils';

type Period = 'online' | '24h' | '7d' | '30d' | 'all';
type SortKey = 'recent' | 'score' | 'visits';

interface PinGroup {
  key: string;
  lat: number;
  lng: number;
  label: string;
  visitors: VisitorRecord[];
}

interface Toast {
  id: number;
  visitorId: string;
  title: string;
  detail: string;
}

const PERIOD_MS: Record<Exclude<Period, 'online' | 'all'>, number> = {
  '24h': 86_400_000,
  '7d': 7 * 86_400_000,
  '30d': 30 * 86_400_000,
};

@Component({
  selector: 'app-admin-live',
  standalone: true,
  imports: [DatePipe, FormsModule, ConfirmDialogComponent],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="lv-root">
      <!-- Barra de filtros -->
      <div class="lv-toolbar">
        <div class="lv-chips" role="group" aria-label="Período">
          @for (p of periods; track p.key) {
            <button type="button" class="lv-chip" [class.is-active]="period() === p.key" (click)="period.set(p.key)">
              @if (p.key === 'online') { <span class="lv-dot is-online"></span> }
              {{ p.label }}
              @if (p.key === 'online') { <span class="lv-chip-count">{{ onlineCount() }}</span> }
            </button>
          }
        </div>

        <div class="lv-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
          <input type="search" placeholder="Cidade, IP, rede…" [ngModel]="search()" (ngModelChange)="search.set($event)" aria-label="Buscar visitante">
        </div>

        <div class="lv-toolbar-right">
          <label class="lv-toggle">
            <input type="checkbox" [ngModel]="onlyLeads()" (ngModelChange)="onlyLeads.set($event)">
            Só leads (score ≥ 30)
          </label>
          <select class="lv-select" [ngModel]="sort()" (ngModelChange)="sort.set($event)" aria-label="Ordenar">
            <option value="recent">Mais recentes</option>
            <option value="score">Maior score</option>
            <option value="visits">Mais visitas</option>
          </select>
        </div>
      </div>

      <div class="lv-body">
        <!-- Mapa -->
        <div class="lv-map-wrap">
          <div #mapEl class="lv-map"></div>

          <div class="lv-map-legend">
            <span><i style="background:#4ade80"></i>Quente</span>
            <span><i style="background:#fbbf24"></i>Morno</span>
            <span><i style="background:#a1a1aa"></i>Frio</span>
            <span><i class="lv-legend-online"></i>Online</span>
          </div>

          <button type="button" class="lv-map-fit" (click)="fitAll()" title="Ver todos">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>
          </button>

          @if (!loading() && withCoordsCount() === 0) {
            <div class="lv-map-empty">Nenhum visitante com localização neste filtro</div>
          }

          <!-- Painel de detalhes -->
          @if (selected(); as v) {
            @let si = scoreOf()(v);
            <aside class="lv-detail" aria-label="Detalhes do visitante">
              <header class="lv-detail-head">
                <div class="min-w-0">
                  <div class="flex items-center gap-2">
                    @if (isOnline(v)) { <span class="lv-dot is-online"></span> }
                    <h3 class="truncate">{{ locationLabel(v) }}</h3>
                  </div>
                  <p>{{ isOnline(v) ? 'Online agora' : 'Visto ' + relativeTime(v.lastSeen) }}</p>
                </div>
                <button type="button" class="lv-icon-btn" (click)="selectedId.set(null)" aria-label="Fechar">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6 6 18"/></svg>
                </button>
              </header>

              <div class="lv-detail-scroll">
                <div class="lv-score-card" [attr.data-tier]="si.tier">
                  <div class="lv-score-num">{{ si.score }}</div>
                  <div class="min-w-0">
                    <div class="lv-score-label">{{ si.label }}</div>
                    <div class="lv-score-reasons">{{ si.reasons.length ? si.reasons.join(' · ') : 'Sem sinais de interesse ainda' }}</div>
                  </div>
                </div>

                <dl class="lv-facts">
                  <div><dt>Visitas</dt><dd>{{ v.visitCount }}</dd></div>
                  <div><dt>Primeira</dt><dd>{{ v.firstSeen | date:'dd/MM/yy HH:mm' }}</dd></div>
                  <div><dt>Última</dt><dd>{{ v.lastSeen | date:'dd/MM/yy HH:mm' }}</dd></div>
                  <div><dt>Origem</dt><dd>{{ sourceFromReferrer(v.referrer) }}</dd></div>
                  <div><dt>Dispositivo</dt><dd>{{ deviceLabel(v) }} · {{ v.screenWidth }}×{{ v.screenHeight }}</dd></div>
                  @if (browserLabel(v.userAgent)) { <div><dt>Navegador</dt><dd>{{ browserLabel(v.userAgent) }}</dd></div> }
                  @if (v.language || v.timezone) { <div><dt>Idioma / fuso</dt><dd>{{ v.language }} {{ v.timezone ? '· ' + v.timezone : '' }}</dd></div> }
                  <div class="col-span-2">
                    <dt>IP</dt>
                    <dd class="flex items-center gap-2">
                      <span class="font-mono">{{ v.ip || '—' }}</span>
                      @if (v.ip) {
                        <button type="button" class="lv-link" (click)="copy(v.ip)">{{ copied() === v.ip ? 'copiado' : 'copiar' }}</button>
                      }
                    </dd>
                  </div>
                  @if (hasNetworkInfo(v)) {
                    @let nk = networkKindMeta(v);
                    <div class="col-span-2">
                      <dt>Rede</dt>
                      <dd>
                        {{ networkSummary(v) }}
                        <span class="lv-badge" [style.background]="nk.bg" [style.color]="nk.fg" [title]="networkKindTitle(v)">{{ nk.label }}</span>
                      </dd>
                    </div>
                  }
                </dl>

                <div class="lv-section-title">Linha do tempo <span>{{ selectedEvents().length }} eventos</span></div>
                @if (selectedSessions().length === 0) {
                  <p class="lv-muted">Nenhum evento registrado para este visitante.</p>
                } @else {
                  <ol class="lv-timeline">
                    @for (s of selectedSessions(); track s.id) {
                      <li class="lv-session">
                        <div class="lv-session-head">{{ s.start | date:'dd/MM HH:mm' }} · {{ s.source }}</div>
                        <ul>
                          @for (e of s.events; track e.id) {
                            @let el = eventLabel(e);
                            <li [class.is-strong]="el.strong">
                              <time>{{ e.createdAt | date:'HH:mm:ss' }}</time>
                              <span>{{ el.text }}</span>
                            </li>
                          }
                        </ul>
                      </li>
                    }
                  </ol>
                }
              </div>

              <footer class="lv-detail-foot">
                @if (v.lat != null) {
                  <button type="button" class="lv-btn" (click)="flyTo(v)">Centralizar</button>
                }
                <button type="button" class="lv-btn is-danger" (click)="deleteTarget.set(v)">Excluir</button>
              </footer>
            </aside>
          }
        </div>

        <!-- Lista -->
        <div class="lv-list-wrap">
          <div class="lv-list-head">
            <span><strong>{{ filtered().length }}</strong> visitantes</span>
            @if (locationFilter(); as lf) {
              <button type="button" class="lv-filter-pill" (click)="locationFilter.set(null)" title="Limpar filtro de local">
                {{ lf.label }} <span aria-hidden="true">×</span>
              </button>
            }
          </div>

          @if (loading()) {
            <div class="lv-muted p-6 text-center animate-pulse">Carregando…</div>
          } @else if (listed().length === 0) {
            <div class="lv-muted p-6 text-center">Nenhum visitante neste filtro.</div>
          }

          <ul class="lv-list" #listEl (keydown)="onListKey($event)">
            @for (v of listed(); track v.id) {
              @let si = scoreOf()(v);
              <li>
                <button type="button" class="lv-item"
                        [id]="'lv-' + v.id"
                        [class.is-selected]="selectedId() === v.id"
                        [class.is-flash]="flashIds().has(v.id!)"
                        (click)="select(v)"
                        (mouseenter)="hoveredId.set(v.id ?? null)"
                        (mouseleave)="hoveredId.set(null)">
                  <span class="lv-item-status">
                    <span class="lv-dot" [class.is-online]="isOnline(v)"></span>
                  </span>
                  <span class="lv-item-main">
                    <span class="lv-item-title">
                      {{ locationLabel(v) }}
                      @if (v.lat == null) { <span class="lv-nogeo" title="Sem coordenadas">sem mapa</span> }
                    </span>
                    <span class="lv-item-sub">
                      {{ deviceLabel(v) }} · {{ v.visitCount }} {{ v.visitCount === 1 ? 'visita' : 'visitas' }}
                      @if (hasNetworkInfo(v)) { · {{ networkKindMeta(v).label }} }
                    </span>
                  </span>
                  <span class="lv-item-meta">
                    <span class="lv-score" [attr.data-tier]="si.tier">{{ si.score }}</span>
                    <span class="lv-item-time">{{ isOnline(v) ? 'agora' : relativeTime(v.lastSeen, now()) }}</span>
                  </span>
                </button>
              </li>
            }
          </ul>
          @if (filtered().length > listed().length) {
            <button type="button" class="lv-more" (click)="limit.set(limit() + 100)">
              Mostrar mais ({{ filtered().length - listed().length }})
            </button>
          }
        </div>
      </div>

      <!-- Toasts de atividade em tempo real -->
      <div class="lv-toasts" aria-live="polite">
        @for (t of toasts(); track t.id) {
          <button type="button" class="lv-toast" (click)="openToast(t)">
            <span class="lv-dot is-online"></span>
            <span class="min-w-0 text-left">
              <strong>{{ t.title }}</strong>
              <span>{{ t.detail }}</span>
            </span>
          </button>
        }
      </div>

      @if (deleteTarget(); as d) {
        <app-confirm-dialog
          title="Excluir visitante"
          [message]="'Remover o visitante de ' + locationLabel(d) + ' (' + (d.ip || 'sem IP') + ') e os dados associados? Esta ação não pode ser desfeita.'"
          confirmLabel="Excluir"
          cancelLabel="Cancelar"
          (confirmed)="confirmDelete()"
          (cancelled)="deleteTarget.set(null)" />
      }
    </div>
  `,
  styles: [`
    .lv-root { --lv-panel: var(--surface); position: relative; display: flex; flex-direction: column; gap: 0.75rem; }

    .lv-toolbar { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem 0.75rem; }
    .lv-toolbar-right { display: flex; align-items: center; gap: 0.75rem; margin-left: auto; }
    .lv-chips { display: flex; gap: 0.25rem; padding: 0.25rem; border: 1px solid var(--border); border-radius: 0.75rem; background: var(--bg-raised); overflow-x: auto; }
    .lv-chip { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.4rem 0.75rem; border-radius: 0.55rem; font-size: 0.8125rem; color: var(--fg-muted); white-space: nowrap; transition: background .15s, color .15s; }
    .lv-chip:hover { color: var(--fg); }
    .lv-chip.is-active { background: var(--surface); color: var(--fg); box-shadow: inset 0 0 0 1px var(--border-hi); }
    .lv-chip-count { font-size: 0.6875rem; font-weight: 600; padding: 0 0.35rem; border-radius: 999px; background: rgba(74,222,128,.15); color: #4ade80; }

    .lv-search { position: relative; flex: 1 1 14rem; max-width: 22rem; }
    .lv-search svg { position: absolute; left: 0.7rem; top: 50%; width: 1rem; height: 1rem; transform: translateY(-50%); color: var(--fg-faint); }
    .lv-search input { width: 100%; padding: 0.55rem 0.75rem 0.55rem 2.1rem; border-radius: 0.65rem; border: 1px solid var(--border); background: var(--bg-raised); color: var(--fg); font-size: 0.8125rem; }
    .lv-search input:focus { outline: none; border-color: var(--border-hi); }

    .lv-toggle { display: inline-flex; align-items: center; gap: 0.45rem; font-size: 0.8125rem; color: var(--fg-muted); cursor: pointer; white-space: nowrap; }
    .lv-toggle input { accent-color: #4ade80; }
    .lv-select { padding: 0.5rem 0.6rem; border-radius: 0.6rem; border: 1px solid var(--border); background: var(--bg-raised); color: var(--fg); font-size: 0.8125rem; }

    .lv-body { display: grid; grid-template-columns: 1fr; gap: 0.75rem; min-height: 0; }
    .lv-map-wrap { position: relative; height: 55vh; min-height: 320px; border: 1px solid var(--border); border-radius: 0.875rem; overflow: hidden; background: #0b0b0d; }
    .lv-map { position: absolute; inset: 0; z-index: 0; background: #0b0b0d; }
    .lv-map .leaflet-tile-pane { filter: invert(1) hue-rotate(180deg) brightness(0.85) contrast(0.9) saturate(0.35); }
    .lv-list-wrap { display: flex; flex-direction: column; min-height: 0; border: 1px solid var(--border); border-radius: 0.875rem; background: var(--lv-panel); overflow: hidden; }

    @media (min-width: 1024px) {
      .lv-root { height: calc(100dvh - 7.5rem); }
      .lv-body { flex: 1; grid-template-columns: minmax(0, 1fr) 24rem; }
      .lv-map-wrap { height: auto; min-height: 0; }
      .lv-list-wrap { min-height: 0; }
    }
    @media (min-width: 1536px) { .lv-body { grid-template-columns: minmax(0, 1fr) 28rem; } }

    .lv-list-head { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; padding: 0.75rem 1rem; border-bottom: 1px solid var(--border); font-size: 0.8125rem; color: var(--fg-muted); }
    .lv-list-head strong { color: var(--fg); }
    .lv-filter-pill { display: inline-flex; align-items: center; gap: 0.35rem; max-width: 60%; padding: 0.2rem 0.6rem; border-radius: 999px; background: rgba(99,102,241,.15); color: var(--accent-fg); font-size: 0.75rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .lv-list { flex: 1; overflow-y: auto; max-height: 60vh; }
    @media (min-width: 1024px) { .lv-list { max-height: none; } }

    .lv-item { display: flex; align-items: center; gap: 0.75rem; width: 100%; padding: 0.7rem 1rem; text-align: left; border-bottom: 1px solid rgba(39,39,42,.6); transition: background .15s; }
    .lv-item:hover { background: rgba(255,255,255,.03); }
    .lv-item:focus-visible { outline: 2px solid var(--accent); outline-offset: -2px; }
    .lv-item.is-selected { background: rgba(99,102,241,.12); box-shadow: inset 3px 0 0 var(--accent); }
    .lv-item.is-flash { animation: lv-flash 2.4s ease-out; }
    @keyframes lv-flash { 0% { background: rgba(74,222,128,.22); } 100% { background: transparent; } }
    .lv-item-status { flex: none; width: 0.6rem; display: flex; justify-content: center; }
    .lv-item-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 0.15rem; }
    .lv-item-title { font-size: 0.875rem; color: var(--fg); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .lv-item-sub { font-size: 0.75rem; color: var(--fg-faint); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .lv-item-meta { flex: none; display: flex; flex-direction: column; align-items: flex-end; gap: 0.25rem; }
    .lv-item-time { font-size: 0.6875rem; color: var(--fg-faint); white-space: nowrap; }
    .lv-nogeo { margin-left: 0.35rem; font-size: 0.625rem; padding: 0 0.3rem; border-radius: 0.25rem; background: var(--bg-raised); color: var(--fg-faint); vertical-align: middle; }
    .lv-more { padding: 0.75rem; font-size: 0.8125rem; color: var(--fg-muted); border-top: 1px solid var(--border); }
    .lv-more:hover { color: var(--fg); }

    .lv-dot { display: inline-block; width: 0.5rem; height: 0.5rem; border-radius: 999px; background: var(--border-hi); flex: none; }
    .lv-dot.is-online { background: #4ade80; box-shadow: 0 0 0 0 rgba(74,222,128,.6); animation: lv-ping 1.8s infinite; }
    @keyframes lv-ping { 0% { box-shadow: 0 0 0 0 rgba(74,222,128,.55); } 70% { box-shadow: 0 0 0 7px rgba(74,222,128,0); } 100% { box-shadow: 0 0 0 0 rgba(74,222,128,0); } }

    .lv-score { min-width: 2rem; text-align: center; font-size: 0.75rem; font-weight: 700; padding: 0.1rem 0.45rem; border-radius: 999px; border: 1px solid; }
    [data-tier="hot"].lv-score { color: #4ade80; border-color: rgba(74,222,128,.35); background: rgba(74,222,128,.12); }
    [data-tier="warm"].lv-score { color: #fbbf24; border-color: rgba(251,191,36,.35); background: rgba(251,191,36,.12); }
    [data-tier="cold"].lv-score { color: var(--fg-muted); border-color: var(--border-hi); background: var(--bg-raised); }

    .lv-map-legend { position: absolute; left: 0.75rem; bottom: 0.75rem; z-index: 500; display: flex; flex-wrap: wrap; gap: 0.75rem; padding: 0.45rem 0.7rem; border-radius: 0.6rem; background: rgba(9,9,11,.82); backdrop-filter: blur(6px); border: 1px solid var(--border); font-size: 0.6875rem; color: var(--fg-muted); }
    .lv-map-legend span { display: inline-flex; align-items: center; gap: 0.35rem; }
    .lv-map-legend i { width: 0.6rem; height: 0.6rem; border-radius: 999px; display: inline-block; }
    .lv-legend-online { background: transparent; box-shadow: 0 0 0 2px #4ade80; }
    .lv-map-fit { position: absolute; top: 0.75rem; right: 0.75rem; z-index: 500; width: 2.25rem; height: 2.25rem; display: grid; place-items: center; border-radius: 0.6rem; background: rgba(9,9,11,.82); border: 1px solid var(--border); color: var(--fg-muted); }
    .lv-map-fit:hover { color: var(--fg); }
    .lv-map-fit svg { width: 1rem; height: 1rem; }
    .lv-map-empty { position: absolute; inset: 0; z-index: 400; display: grid; place-items: center; color: var(--fg-faint); font-size: 0.875rem; pointer-events: none; }

    /* Pins (HTML do divIcon fica fora da view, por isso encapsulation None) */
    .lv-pin-icon { background: none; border: none; }
    .lv-pin { --c: #a1a1aa; position: relative; width: 100%; height: 100%; display: grid; place-items: center; border-radius: 999px; background: color-mix(in srgb, var(--c) 30%, transparent); border: 2px solid var(--c); color: #09090b; font: 700 11px/1 Inter, system-ui, sans-serif; transition: transform .18s ease; }
    .lv-pin span { min-width: 1.1rem; padding: 0 0.2rem; border-radius: 999px; background: var(--c); text-align: center; line-height: 1.1rem; }
    .lv-pin[data-tier="hot"] { --c: #4ade80; }
    .lv-pin[data-tier="warm"] { --c: #fbbf24; }
    .lv-pin.is-online::after { content: ''; position: absolute; inset: -6px; border-radius: 999px; border: 2px solid #4ade80; animation: lv-ring 1.6s ease-out infinite; }
    @keyframes lv-ring { 0% { transform: scale(.7); opacity: 1; } 100% { transform: scale(1.5); opacity: 0; } }
    .lv-pin.is-hover { transform: scale(1.25); }
    .lv-pin.is-selected { transform: scale(1.35); box-shadow: 0 0 0 4px rgba(99,102,241,.55); }
    .lv-pin.is-flash { animation: lv-pop .6s ease-out 3; }
    @keyframes lv-pop { 50% { transform: scale(1.6); } }
    .leaflet-tooltip.lv-tip { background: rgba(9,9,11,.92); border: 1px solid var(--border-hi); color: var(--fg); border-radius: 0.5rem; padding: 0.35rem 0.6rem; font-size: 0.75rem; box-shadow: none; }
    .leaflet-tooltip.lv-tip::before { display: none; }
    .lv-root .leaflet-control-zoom a { background: rgba(9,9,11,.85); color: var(--fg); border-color: var(--border); }
    .lv-root .leaflet-control-attribution { background: rgba(9,9,11,.7); color: var(--fg-faint); }
    .lv-root .leaflet-control-attribution a { color: var(--fg-muted); }

    /* Painel de detalhes */
    .lv-detail { position: absolute; z-index: 600; top: 0.75rem; right: 0.75rem; bottom: 0.75rem; width: min(24rem, calc(100% - 1.5rem)); display: flex; flex-direction: column; border-radius: 0.875rem; background: rgba(17,17,19,.96); backdrop-filter: blur(8px); border: 1px solid var(--border-hi); box-shadow: 0 20px 50px rgba(0,0,0,.5); animation: lv-in .2s ease-out; }
    @keyframes lv-in { from { opacity: 0; transform: translateX(12px); } }
    @media (max-width: 1023px) {
      .lv-detail { position: fixed; top: auto; left: 0; right: 0; bottom: 0; width: auto; max-height: 78dvh; border-radius: 1rem 1rem 0 0; animation-name: lv-up; }
      @keyframes lv-up { from { transform: translateY(24px); opacity: 0; } }
    }
    .lv-detail-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 0.75rem; padding: 1rem 1rem 0.75rem; border-bottom: 1px solid var(--border); }
    .lv-detail-head h3 { font-size: 1rem; font-weight: 600; color: var(--fg); }
    .lv-detail-head p { font-size: 0.75rem; color: var(--fg-faint); margin-top: 0.15rem; }
    .lv-detail-scroll { flex: 1; overflow-y: auto; padding: 1rem; display: flex; flex-direction: column; gap: 1rem; }
    .lv-detail-foot { display: flex; gap: 0.5rem; padding: 0.75rem 1rem; border-top: 1px solid var(--border); }
    .lv-icon-btn { width: 2rem; height: 2rem; display: grid; place-items: center; border-radius: 0.5rem; color: var(--fg-muted); flex: none; }
    .lv-icon-btn:hover { background: var(--surface); color: var(--fg); }
    .lv-icon-btn svg { width: 1rem; height: 1rem; }
    .lv-btn { flex: 1; padding: 0.55rem 0.75rem; border-radius: 0.6rem; border: 1px solid var(--border-hi); font-size: 0.8125rem; color: var(--fg); }
    .lv-btn:hover { background: var(--surface); }
    .lv-btn.is-danger { color: #f87171; border-color: rgba(248,113,113,.35); }
    .lv-btn.is-danger:hover { background: rgba(248,113,113,.1); }
    .lv-link { font-size: 0.75rem; color: var(--accent-fg); }

    .lv-score-card { display: flex; align-items: center; gap: 0.85rem; padding: 0.85rem; border-radius: 0.75rem; border: 1px solid var(--border); background: var(--bg-raised); }
    .lv-score-num { font: 700 1.75rem/1 var(--font-display); letter-spacing: -0.03em; min-width: 2.75rem; text-align: center; }
    [data-tier="hot"] > .lv-score-num { color: #4ade80; }
    [data-tier="warm"] > .lv-score-num { color: #fbbf24; }
    .lv-score-label { font-size: 0.8125rem; color: var(--fg); font-weight: 600; }
    .lv-score-reasons { font-size: 0.75rem; color: var(--fg-muted); margin-top: 0.15rem; }

    .lv-facts { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem 1rem; }
    .lv-facts dt { font-size: 0.6875rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--fg-faint); }
    .lv-facts dd { font-size: 0.8125rem; color: var(--fg); margin-top: 0.15rem; word-break: break-word; }
    .lv-badge { display: inline-block; margin-left: 0.35rem; padding: 0.05rem 0.45rem; border-radius: 999px; font-size: 0.6875rem; font-weight: 600; }

    .lv-section-title { display: flex; justify-content: space-between; font-size: 0.6875rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--fg-faint); }
    .lv-muted { font-size: 0.8125rem; color: var(--fg-faint); }
    .lv-timeline { display: flex; flex-direction: column; gap: 0.85rem; }
    .lv-session-head { font-size: 0.75rem; color: var(--fg-muted); font-weight: 600; margin-bottom: 0.35rem; }
    .lv-session ul { border-left: 1px solid var(--border-hi); margin-left: 0.25rem; padding-left: 0.75rem; display: flex; flex-direction: column; gap: 0.3rem; }
    .lv-session li { display: flex; gap: 0.6rem; font-size: 0.78rem; color: var(--fg-muted); }
    .lv-session li time { flex: none; font-family: var(--font-mono); font-size: 0.7rem; color: var(--fg-faint); padding-top: 0.1rem; }
    .lv-session li.is-strong { color: var(--fg); }
    .lv-session li.is-strong span::before { content: '★ '; color: #fbbf24; }

    .lv-toasts { position: fixed; z-index: 700; left: 1rem; bottom: 1rem; display: flex; flex-direction: column; gap: 0.5rem; pointer-events: none; }
    @media (min-width: 1024px) { .lv-toasts { left: calc(15rem + 1rem); } }
    @media (max-width: 1023px) { .lv-toasts { bottom: 5rem; } }
    .lv-toast { pointer-events: auto; display: flex; align-items: center; gap: 0.7rem; max-width: 20rem; padding: 0.65rem 0.9rem; border-radius: 0.75rem; background: rgba(17,17,19,.96); border: 1px solid rgba(74,222,128,.35); box-shadow: 0 12px 30px rgba(0,0,0,.45); animation: lv-in .25s ease-out; }
    .lv-toast strong { display: block; font-size: 0.8125rem; color: var(--fg); }
    .lv-toast span span, .lv-toast span > span { display: block; font-size: 0.75rem; color: var(--fg-muted); }
  `],
})
export class AdminLiveComponent implements AfterViewInit, OnDestroy {
  private firebase = inject(FirebaseService);

  readonly visitors = input.required<VisitorRecord[]>();
  readonly events = input<AnalyticsEventRecord[]>([]);
  readonly loading = input(false);
  readonly scoreOf = input.required<(v: VisitorRecord) => ScoreInfo>();
  readonly selectedId = model<string | null>(null);

  @ViewChild('mapEl') private mapEl!: ElementRef<HTMLDivElement>;

  readonly periods: { key: Period; label: string }[] = [
    { key: 'online', label: 'Online' },
    { key: '24h', label: '24h' },
    { key: '7d', label: '7 dias' },
    { key: '30d', label: '30 dias' },
    { key: 'all', label: 'Tudo' },
  ];

  readonly period = signal<Period>('7d');
  readonly search = signal('');
  readonly onlyLeads = signal(false);
  readonly sort = signal<SortKey>('recent');
  readonly limit = signal(100);
  readonly hoveredId = signal<string | null>(null);
  readonly locationFilter = signal<{ key: string; label: string } | null>(null);
  readonly flashIds = signal<Set<string>>(new Set());
  readonly toasts = signal<Toast[]>([]);
  readonly deleteTarget = signal<VisitorRecord | null>(null);
  readonly copied = signal<string | null>(null);
  /** Relógio para "há X min" e status online. */
  readonly now = signal(Date.now());

  // helpers expostos ao template
  readonly isOnline = (v: VisitorRecord) => isOnline(v, this.now());
  readonly relativeTime = relativeTime;
  readonly locationLabel = locationLabel;
  readonly deviceLabel = deviceLabel;
  readonly browserLabel = browserLabel;
  readonly hasNetworkInfo = hasNetworkInfo;
  readonly networkSummary = networkSummary;
  readonly networkKindMeta = networkKindMeta;
  readonly networkKindTitle = networkKindTitle;
  readonly sourceFromReferrer = sourceFromReferrer;
  readonly eventLabel = eventLabel;

  readonly onlineCount = computed(() => this.visitors().filter(v => isOnline(v, this.now())).length);

  /** Filtros que valem para mapa e lista. */
  readonly filtered = computed(() => {
    const now = this.now();
    const period = this.period();
    const q = this.search().trim().toLowerCase();
    const onlyLeads = this.onlyLeads();
    const scoreOf = this.scoreOf();

    let list = this.visitors().filter(v => {
      if (period === 'online' && !isOnline(v, now)) return false;
      if (period !== 'online' && period !== 'all' && now - new Date(v.lastSeen).getTime() > PERIOD_MS[period]) return false;
      if (onlyLeads && scoreOf(v).score < 30) return false;
      if (q) {
        const hay = [v.city, v.region, v.country, v.ip, v.networkOrg, v.networkAsn].filter(Boolean).join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    const sort = this.sort();
    list = [...list].sort((a, b) => {
      if (sort === 'score') return scoreOf(b).score - scoreOf(a).score || +new Date(b.lastSeen) - +new Date(a.lastSeen);
      if (sort === 'visits') return b.visitCount - a.visitCount;
      const onlineDiff = Number(isOnline(b, now)) - Number(isOnline(a, now));
      return onlineDiff || +new Date(b.lastSeen) - +new Date(a.lastSeen);
    });
    return list;
  });

  /** Lista = filtros + local clicado no mapa. */
  readonly listedAll = computed(() => {
    const lf = this.locationFilter();
    return lf ? this.filtered().filter(v => this.groupKey(v) === lf.key) : this.filtered();
  });
  readonly listed = computed(() => this.listedAll().slice(0, this.limit()));

  readonly groups = computed(() => {
    const map = new Map<string, PinGroup>();
    for (const v of this.filtered()) {
      const key = this.groupKey(v);
      if (!key) continue;
      let g = map.get(key);
      if (!g) {
        g = { key, lat: v.lat!, lng: v.lng!, label: locationLabel(v), visitors: [] };
        map.set(key, g);
      }
      g.visitors.push(v);
    }
    return [...map.values()];
  });

  readonly withCoordsCount = computed(() => this.groups().length);

  readonly selected = computed(() => {
    const id = this.selectedId();
    return id ? this.visitors().find(v => v.id === id) ?? null : null;
  });

  readonly selectedEvents = computed(() => {
    const id = this.selectedId();
    return id ? this.events().filter(e => e.visitorId === id) : [];
  });

  /** Eventos agrupados por sessão, sessão mais recente primeiro. */
  readonly selectedSessions = computed(() => {
    const bySession = new Map<string, AnalyticsEventRecord[]>();
    for (const e of this.selectedEvents()) {
      const key = e.sessionId || 'sem-sessao';
      bySession.set(key, [...(bySession.get(key) ?? []), e]);
    }
    return [...bySession.entries()]
      .map(([id, events]) => {
        const sorted = [...events].sort((a, b) => +a.createdAt - +b.createdAt);
        return { id, start: sorted[0].createdAt, source: sorted[0].source, events: sorted };
      })
      .sort((a, b) => +b.start - +a.start);
  });

  private map?: L.Map;
  private markers = new Map<string, L.Marker>();
  private resizeObs?: ResizeObserver;
  private clock?: ReturnType<typeof setInterval>;
  private lastFlownId: string | null = null;
  private hasFitted = false;
  private prevSnapshot?: Map<string, { lastSeen: number; visits: number }>;
  private toastSeq = 0;

  constructor() {
    // Reconcilia pins com filtros/seleção/hover.
    effect(() => {
      const groups = this.groups();
      const selected = this.selectedId();
      const hovered = this.hoveredId();
      const flash = this.flashIds();
      this.now();
      untracked(() => this.syncMarkers(groups, selected, hovered, flash));
    });

    // Seleção vinda de fora (lista de leads) ou da lista: voa até o ponto.
    effect(() => {
      const v = this.selected();
      untracked(() => {
        if (!v) { this.lastFlownId = null; return; }
        if (v.id === this.lastFlownId) return;
        this.lastFlownId = v.id ?? null;
        this.flyTo(v);
        this.revealInList(v);
      });
    });

    // Detecta chegadas/retornos em tempo real.
    effect(() => {
      const visitors = this.visitors();
      untracked(() => this.detectActivity(visitors));
    });

    // Volta para o início da lista quando o filtro muda.
    effect(() => {
      this.filtered();
      this.locationFilter();
      untracked(() => this.limit.set(100));
    });
  }

  ngAfterViewInit(): void {
    this.map = L.map(this.mapEl.nativeElement, {
      zoomControl: true,
      worldCopyJump: true,
      minZoom: 2,
    }).setView([-15.8, -47.9], 4);

    // OSM padrão escurecido via CSS (.lv-map .leaflet-tile-pane) — sem chave de API.
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(this.map);

    this.resizeObs = new ResizeObserver(() => this.map?.invalidateSize());
    this.resizeObs.observe(this.mapEl.nativeElement);

    this.clock = setInterval(() => this.now.set(Date.now()), 30_000);

    this.syncMarkers(this.groups(), this.selectedId(), this.hoveredId(), this.flashIds());
    const v = this.selected();
    if (v) this.flyTo(v, false);
  }

  ngOnDestroy(): void {
    clearInterval(this.clock);
    this.resizeObs?.disconnect();
    this.map?.remove();
    this.markers.clear();
  }

  select(v: VisitorRecord): void {
    this.selectedId.set(this.selectedId() === v.id ? null : v.id ?? null);
  }

  fitAll(): void {
    const groups = this.groups();
    if (!this.map || groups.length === 0) return;
    this.locationFilter.set(null);
    const bounds = L.latLngBounds(groups.map(g => [g.lat, g.lng] as L.LatLngTuple));
    this.map.flyToBounds(bounds, { padding: [40, 40], maxZoom: 6, duration: 0.6 });
  }

  flyTo(v: VisitorRecord, animate = true): void {
    if (!this.map || v.lat == null || v.lng == null) return;
    const zoom = Math.max(this.map.getZoom(), 9);
    // No desktop o painel de detalhes cobre a direita: desloca o centro para o ponto ficar visível.
    const panelOpen = this.selectedId() === v.id && window.matchMedia('(min-width: 1024px)').matches;
    const offsetX = panelOpen ? Math.min(24 * 16, this.mapEl.nativeElement.clientWidth * 0.5) / 2 + 6 : 0;
    const target = this.map.unproject(this.map.project([v.lat, v.lng], zoom).add([offsetX, 0]), zoom);
    if (animate) this.map.flyTo(target, zoom, { duration: 0.7 });
    else this.map.setView(target, zoom);
  }

  onListKey(event: KeyboardEvent): void {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    const list = this.listed();
    if (list.length === 0) return;
    event.preventDefault();
    const idx = list.findIndex(v => v.id === this.selectedId());
    const next = event.key === 'ArrowDown' ? Math.min(idx + 1, list.length - 1) : Math.max(idx - 1, 0);
    this.selectedId.set(list[next].id ?? null);
    document.getElementById('lv-' + list[next].id)?.focus();
  }

  openToast(t: Toast): void {
    this.toasts.update(list => list.filter(x => x.id !== t.id));
    this.period.set('all');
    this.locationFilter.set(null);
    this.selectedId.set(t.visitorId);
  }

  async copy(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      this.copied.set(text);
      setTimeout(() => this.copied.set(null), 1500);
    } catch { /* clipboard indisponível (http) */ }
  }

  async confirmDelete(): Promise<void> {
    const v = this.deleteTarget();
    this.deleteTarget.set(null);
    if (!v?.id) return;
    if (this.selectedId() === v.id) this.selectedId.set(null);
    try {
      await this.firebase.deleteVisitor(v.id);
    } catch (err) {
      console.error('[AdminLive] deleteVisitor', err);
    }
  }

  // ── internos ───────────────────────────────────────────────────────────

  private groupKey(v: VisitorRecord): string {
    return v.lat != null && v.lng != null ? `${v.lat.toFixed(2)},${v.lng.toFixed(2)}` : '';
  }

  private syncMarkers(groups: PinGroup[], selectedId: string | null, hoveredId: string | null, flash: Set<string>): void {
    if (!this.map) return;
    const scoreOf = this.scoreOf();
    const now = this.now();
    const seen = new Set<string>();

    for (const g of groups) {
      seen.add(g.key);
      const tiers = g.visitors.map(v => scoreOf(v).tier);
      const tier = tiers.includes('hot') ? 'hot' : tiers.includes('warm') ? 'warm' : 'cold';
      const online = g.visitors.some(v => isOnline(v, now));
      const has = (id: string | null) => !!id && g.visitors.some(v => v.id === id);
      const flashing = g.visitors.some(v => v.id && flash.has(v.id));
      const count = g.visitors.length;
      const size = Math.round(Math.min(44, 18 + Math.log2(count) * 6));
      const classes = ['lv-pin', online ? 'is-online' : '', has(selectedId) ? 'is-selected' : '', has(hoveredId) ? 'is-hover' : '', flashing ? 'is-flash' : '']
        .filter(Boolean).join(' ');
      const html = `<div class="${classes}" data-tier="${tier}">${count > 1 ? `<span>${count}</span>` : ''}</div>`;
      const icon = L.divIcon({ className: 'lv-pin-icon', html, iconSize: [size, size], iconAnchor: [size / 2, size / 2] });
      const onlineN = g.visitors.filter(v => isOnline(v, now)).length;
      const tip = `<strong>${escapeHtml(g.label)}</strong><br>${count} ${count === 1 ? 'visitante' : 'visitantes'}${onlineN ? ` · ${onlineN} online` : ''}`;

      let m = this.markers.get(g.key);
      if (!m) {
        m = L.marker([g.lat, g.lng], { icon, riseOnHover: true, keyboard: false })
          .bindTooltip(tip, { className: 'lv-tip', direction: 'top', offset: [0, -size / 2] })
          .on('click', () => this.onPinClick(g.key))
          .addTo(this.map);
        this.markers.set(g.key, m);
      } else {
        m.setIcon(icon);
        m.setTooltipContent(tip);
      }
      m.setZIndexOffset(has(selectedId) ? 1000 : online ? 500 : 0);
    }

    for (const [key, m] of this.markers) {
      if (!seen.has(key)) {
        m.remove();
        this.markers.delete(key);
      }
    }

    if (!this.hasFitted && groups.length > 0 && !this.selectedId()) {
      this.hasFitted = true;
      const bounds = L.latLngBounds(groups.map(g => [g.lat, g.lng] as L.LatLngTuple));
      this.map.fitBounds(bounds, { padding: [40, 40], maxZoom: 6 });
    }
  }

  private onPinClick(key: string): void {
    const g = this.groups().find(x => x.key === key);
    if (!g) return;
    if (g.visitors.length === 1) {
      this.locationFilter.set(null);
      this.selectedId.set(g.visitors[0].id ?? null);
      return;
    }
    this.locationFilter.set({ key, label: `${g.label} · ${g.visitors.length}` });
    this.map?.flyTo([g.lat, g.lng], Math.max(this.map.getZoom(), 9), { duration: 0.6 });
  }

  private revealInList(v: VisitorRecord): void {
    const lf = this.locationFilter();
    if (lf && lf.key !== this.groupKey(v)) this.locationFilter.set(null);
    if (!this.filtered().some(x => x.id === v.id)) this.period.set('all');
    const idx = this.listedAll().findIndex(x => x.id === v.id);
    if (idx >= this.limit()) this.limit.set(idx + 20);
    setTimeout(() => document.getElementById('lv-' + v.id)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }), 60);
  }

  private detectActivity(visitors: VisitorRecord[]): void {
    const next = new Map(visitors.filter(v => v.id).map(v => [v.id!, { lastSeen: +new Date(v.lastSeen), visits: v.visitCount }]));
    const prev = this.prevSnapshot;
    this.prevSnapshot = next;
    if (!prev || prev.size === 0) return;

    const flashed: string[] = [];
    for (const v of visitors) {
      if (!v.id) continue;
      const before = prev.get(v.id);
      if (!before) {
        flashed.push(v.id);
        this.pushToast(v, 'Novo visitante', `${locationLabel(v)} · ${deviceLabel(v)}`);
      } else if (v.visitCount > before.visits) {
        flashed.push(v.id);
        this.pushToast(v, 'Visitante voltou', `${locationLabel(v)} · ${v.visitCount}ª visita`);
      } else if (+new Date(v.lastSeen) > before.lastSeen) {
        flashed.push(v.id);
      }
    }
    if (flashed.length === 0) return;

    this.now.set(Date.now());
    this.flashIds.update(s => new Set([...s, ...flashed]));
    setTimeout(() => this.flashIds.update(s => {
      const copy = new Set(s);
      flashed.forEach(id => copy.delete(id));
      return copy;
    }), 2500);
  }

  private pushToast(v: VisitorRecord, title: string, detail: string): void {
    const t: Toast = { id: ++this.toastSeq, visitorId: v.id!, title, detail };
    this.toasts.update(list => [t, ...list].slice(0, 3));
    setTimeout(() => this.toasts.update(list => list.filter(x => x.id !== t.id)), 7000);
  }
}
