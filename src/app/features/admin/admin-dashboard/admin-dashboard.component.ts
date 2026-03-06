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
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>


        <!-- Gráficos -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <!-- Gráfico de linha (Chart.js) -->
          <div class="admin-card border rounded-xl p-5">
            <p class="text-xs text-gray-500 uppercase tracking-widest mb-4 font-semibold">📈 Acessos — Últimos 7 dias</p>
            <canvas #chartCanvas style="width:100%;max-height:220px"></canvas>
          </div>

          <!-- Mapa Leaflet -->
          <div class="admin-card border rounded-xl p-5">
            <p class="text-xs text-gray-500 uppercase tracking-widest mb-4 font-semibold">🌍 Localização dos Acessos</p>
            @if (loading) {
              <div class="h-64 flex items-center justify-center text-gray-600 text-sm animate-pulse">Carregando mapa...</div>
            } @else if (!hasMapCoords) {
              <div class="h-64 flex items-center justify-center text-gray-600 text-sm">Sem dados de localização</div>
            } @else {
              <div #mapEl class="leaflet-map w-full rounded-lg" style="height:260px"></div>
            }
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
      this.hasMapCoords = visitors.some(v => v.lat != null && v.lng != null);
    } catch {
      this.aiMatches = [];
      this.devMatches = [];
      this.visitors = [];
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
      setTimeout(() => {
        this.initLineChart();
        this.initMap();
      }, 50);
    }
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
    this.themeObserver = new MutationObserver(() => this.updateChartTheme());
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

    this.leafletMap = L.map(this.mapEl.nativeElement, { zoomControl: true, scrollWheelZoom: false });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(this.leafletMap);

    const bounds: [number, number][] = [];
    for (const v of withCoords) {
      const lat = v.lat!;
      const lng = v.lng!;
      bounds.push([lat, lng]);
      const label = [v.city, v.country].filter(Boolean).join(', ') || v.ip;
      L.circleMarker([lat, lng], {
        radius: v.visitCount > 5 ? 10 : v.visitCount > 2 ? 7 : 5,
        color: '#22d3ee',
        fillColor: '#22d3ee',
        fillOpacity: 0.75,
        weight: 1.5,
      }).bindPopup(`<b>${label}</b><br>${v.visitCount} visita(s)`).addTo(this.leafletMap!);
    }
    if (bounds.length === 1) {
      this.leafletMap.setView(bounds[0], 5);
    } else {
      this.leafletMap.fitBounds(bounds, { padding: [30, 30] });
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
}
