import {
  Component, OnInit, inject, ChangeDetectorRef, ChangeDetectionStrategy
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

interface Repo {
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  updated_at: string;
  topics: string[];
}

interface GithubUser {
  public_repos: number;
  followers: number;
  following: number;
}

interface LangStat {
  name: string;
  count: number;
  pct: number;
  color: string;
}

const LANG_COLORS: Record<string, string> = {
  PHP:        '#4f5d95',
  TypeScript: '#2b7489',
  JavaScript: '#f1e05a',
  Python:     '#3572A5',
  HTML:       '#e34c26',
  CSS:        '#563d7c',
  Vue:        '#41b883',
  Shell:      '#89e051',
  SCSS:       '#c6538c',
  'C#':       '#178600',
  Java:       '#b07219',
  Dockerfile: '#384d54',
};

const DEFAULT_COLOR = '#64748b';

@Component({
  selector: 'app-github-stats',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section id="github" class="py-24 px-8">
      <div class="max-w-6xl mx-auto">

        <!-- Cabeçalho -->
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold bg-linear-to-r from-blue-400 to-cyan-400 text-transparent bg-clip-text inline-block">
            GitHub
          </h2>
          <div class="mt-3 mx-auto w-16 h-px bg-linear-to-r from-blue-400 to-cyan-400 rounded-full"></div>
          <p class="text-gray-400 text-sm mt-4 font-mono">
            <a href="https://github.com/egdsdev" target="_blank" rel="noopener noreferrer"
               class="hover:text-cyan-400 transition-colors">
              @egdsdev
            </a>
          </p>
        </div>

        @if (loading) {
          <!-- Skeleton -->
          <div class="flex flex-col items-center gap-3 text-gray-500">
            <svg class="animate-spin w-6 h-6 text-cyan-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
            <span class="text-sm font-mono">carregando dados do GitHub...</span>
          </div>
        } @else {

          <!-- Métricas rápidas -->
          <div class="grid grid-cols-3 gap-4 mb-12 max-w-md mx-auto">
            <div class="gh-stat-card text-center p-4 rounded-2xl">
              <div class="text-2xl font-bold font-mono text-cyan-400">{{ user?.public_repos ?? '—' }}</div>
              <div class="text-xs text-gray-400 mt-1 tracking-wide uppercase">Repositórios</div>
            </div>
            <div class="gh-stat-card text-center p-4 rounded-2xl">
              <div class="text-2xl font-bold font-mono text-cyan-400">{{ totalStars }}</div>
              <div class="text-xs text-gray-400 mt-1 tracking-wide uppercase">Stars</div>
            </div>
            <div class="gh-stat-card text-center p-4 rounded-2xl">
              <div class="text-2xl font-bold font-mono text-cyan-400">{{ user?.followers ?? '—' }}</div>
              <div class="text-xs text-gray-400 mt-1 tracking-wide uppercase">Seguidores</div>
            </div>
          </div>

          <div class="grid md:grid-cols-2 gap-8">

            <!-- Linguagens -->
            <div class="gh-card rounded-2xl p-6">
              <h3 class="text-sm font-semibold text-gray-300 uppercase tracking-widest mb-5 flex items-center gap-2">
                <span class="text-base">📊</span> Linguagens Mais Usadas
              </h3>

              <!-- barra de distribuição -->
              <div class="flex h-2.5 rounded-full overflow-hidden mb-5 gap-px">
                @for (lang of langStats; track lang.name) {
                  <div class="h-full transition-all duration-700 rounded-sm"
                       [style.width.%]="lang.pct"
                       [style.background-color]="lang.color"
                       [title]="lang.name + ' ' + lang.pct + '%'">
                  </div>
                }
              </div>

              <!-- legenda -->
              <div class="flex flex-col gap-2.5">
                @for (lang of langStats; track lang.name) {
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <span class="w-2.5 h-2.5 rounded-full shrink-0"
                            [style.background-color]="lang.color"></span>
                      <span class="text-sm text-gray-300">{{ lang.name }}</span>
                    </div>
                    <span class="text-xs font-mono text-gray-400">{{ lang.pct }}%</span>
                  </div>
                }
              </div>
            </div>

            <!-- Repositórios em destaque -->
            <div class="flex flex-col gap-4">
              <h3 class="text-sm font-semibold text-gray-300 uppercase tracking-widest flex items-center gap-2">
                <span class="text-base">📁</span> Repositórios em Destaque
              </h3>
              @for (repo of topRepos; track repo.name) {
                <a [href]="repo.html_url" target="_blank" rel="noopener noreferrer"
                   class="gh-repo-card group rounded-2xl p-5 flex flex-col gap-2 transition-all duration-300 hover:-translate-y-0.5">
                  <div class="flex items-start justify-between gap-2">
                    <span class="font-semibold text-gray-100 group-hover:text-cyan-400 transition-colors text-sm leading-snug">
                      {{ repo.name }}
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-gray-500 group-hover:text-cyan-400 shrink-0 mt-0.5 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                    </svg>
                  </div>

                  @if (repo.description) {
                    <p class="text-xs text-gray-400 leading-relaxed line-clamp-2">{{ repo.description }}</p>
                  }

                  <div class="flex items-center gap-4 mt-1">
                    @if (repo.language) {
                      <span class="flex items-center gap-1.5 text-xs text-gray-400">
                        <span class="w-2 h-2 rounded-full"
                              [style.background-color]="langColor(repo.language)"></span>
                        {{ repo.language }}
                      </span>
                    }
                    @if (repo.stargazers_count > 0) {
                      <span class="flex items-center gap-1 text-xs text-gray-400">
                        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                        </svg>
                        {{ repo.stargazers_count }}
                      </span>
                    }
                    @if (repo.forks_count > 0) {
                      <span class="flex items-center gap-1 text-xs text-gray-400">
                        <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M8 7h.01M12 7h.01M16 7h.01M8 12h.01M12 12h.01M8 17h.01"/>
                        </svg>
                        {{ repo.forks_count }}
                      </span>
                    }
                  </div>
                </a>
              }
            </div>

          </div>

          <!-- Heatmap de contribuições -->
          <div class="gh-card rounded-2xl p-6 mt-8">
            <h3 class="text-sm font-semibold text-gray-300 uppercase tracking-widest mb-5 flex items-center gap-2">
              <span class="text-base">🟩</span> Atividade Recente
            </h3>
            <div class="overflow-x-auto">
              <div class="flex gap-1 min-w-max">
                @for (week of activityGrid; track $index) {
                  <div class="flex flex-col gap-1">
                    @for (day of week; track $index) {
                      <div class="w-3 h-3 rounded-sm transition-colors"
                           [class]="day.level === 0 ? 'bg-gray-800 border border-gray-700/50' :
                                    day.level === 1 ? 'bg-cyan-900/70' :
                                    day.level === 2 ? 'bg-cyan-700/80' :
                                    day.level === 3 ? 'bg-cyan-500' : 'bg-cyan-400'"
                           [title]="day.date + (day.count ? ' · ' + day.count + ' evento(s)' : '')">
                      </div>
                    }
                  </div>
                }
              </div>
            </div>
            <div class="flex items-center justify-end gap-1.5 mt-3">
              <span class="text-xs text-gray-500">Menos</span>
              <div class="w-3 h-3 rounded-sm bg-gray-800 border border-gray-700/50"></div>
              <div class="w-3 h-3 rounded-sm bg-cyan-900/70"></div>
              <div class="w-3 h-3 rounded-sm bg-cyan-700/80"></div>
              <div class="w-3 h-3 rounded-sm bg-cyan-500"></div>
              <div class="w-3 h-3 rounded-sm bg-cyan-400"></div>
              <span class="text-xs text-gray-500">Mais</span>
            </div>
          </div>

        }
      </div>
    </section>
  `,
  styles: [`
    .gh-stat-card {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.07);
    }

    .gh-card {
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(51, 65, 85, 0.6);
      backdrop-filter: blur(8px);
    }

    .gh-repo-card {
      background: rgba(30, 41, 59, 0.4);
      border: 1px solid rgba(51, 65, 85, 0.5);
    }

    .gh-repo-card:hover {
      background: rgba(30, 41, 59, 0.7);
      border-color: rgba(34, 211, 238, 0.2);
      box-shadow: 0 4px 16px rgba(34, 211, 238, 0.05);
    }

    :host-context(html.light) .gh-stat-card {
      background: #ffffff;
      border-color: #ede9fe;
      box-shadow: 0 2px 8px rgba(109, 40, 217, 0.06);
    }

    :host-context(html.light) .gh-stat-card .text-cyan-400 {
      color: #7c3aed !important;
    }

    :host-context(html.light) .gh-card {
      background: #ffffff;
      border-color: #ede9fe;
      box-shadow: 0 2px 8px rgba(109, 40, 217, 0.06);
    }

    :host-context(html.light) .gh-repo-card {
      background: #faf8ff;
      border-color: #ede9fe;
    }

    :host-context(html.light) .gh-repo-card:hover {
      border-color: rgba(124, 58, 237, 0.3);
      box-shadow: 0 4px 16px rgba(124, 58, 237, 0.07);
    }

    :host-context(html.light) .w-3.h-3.rounded-sm.bg-gray-800 {
      background: #f1f5f9 !important;
      border-color: #e2e8f0 !important;
    }

    :host-context(html.light) .bg-cyan-900-light  { background-color: rgba(124,58,237,0.15) !important; }
    :host-context(html.light) .bg-cyan-700-light  { background-color: rgba(124,58,237,0.35) !important; }
    :host-context(html.light) .bg-cyan-500      { background-color: rgba(124,58,237,0.65) !important; }
    :host-context(html.light) .bg-cyan-400      { background-color: #7c3aed !important; }
  `]
})
export class GithubStatsComponent implements OnInit {
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  loading = true;
  user: GithubUser | null = null;
  topRepos: Repo[] = [];
  langStats: LangStat[] = [];
  totalStars = 0;
  activityGrid: { date: string; count: number; level: number }[][] = [];

  private readonly USERNAME = 'egdsdev';
  private readonly BASE = 'https://api.github.com';

  ngOnInit() {
    const headers = { 'Accept': 'application/vnd.github.v3+json' };

    forkJoin({
      user: this.http.get<GithubUser>(`${this.BASE}/users/${this.USERNAME}`, { headers })
        .pipe(catchError(() => of(null))),
      repos: this.http.get<Repo[]>(
        `${this.BASE}/users/${this.USERNAME}/repos?per_page=100&sort=updated`, { headers }
      ).pipe(catchError(() => of([]))),
      events: this.http.get<any[]>(
        `${this.BASE}/users/${this.USERNAME}/events/public?per_page=100`, { headers }
      ).pipe(catchError(() => of([]))),
    }).subscribe(({ user, repos, events }) => {
      this.user = user;
      this.processRepos(repos as Repo[]);
      this.processEvents(events as any[]);
      this.loading = false;
      this.cdr.markForCheck();
    });
  }

  private processRepos(repos: Repo[]) {
    // Total de stars
    this.totalStars = repos.reduce((acc, r) => acc + r.stargazers_count, 0);

    // Top repos: prioriza starred, depois atualizado recentemente, exclui forks implícitos sem stars
    this.topRepos = [...repos]
      .sort((a, b) => b.stargazers_count - a.stargazers_count || new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 4);

    // Linguagens
    const counts: Record<string, number> = {};
    repos.forEach(r => {
      if (r.language) counts[r.language] = (counts[r.language] ?? 0) + 1;
    });
    const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
    this.langStats = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, count]) => ({
        name,
        count,
        pct: Math.round((count / total) * 100),
        color: LANG_COLORS[name] ?? DEFAULT_COLOR,
      }));

    // Garante que soma = 100%
    const diff = 100 - this.langStats.reduce((a, l) => a + l.pct, 0);
    if (this.langStats.length > 0) this.langStats[0].pct += diff;
  }

  private processEvents(events: any[]) {
    // Monta grid de 16 semanas × 7 dias (112 células)
    const today = new Date();
    const totalDays = 16 * 7;
    const dayMap: Record<string, number> = {};

    // Conta eventos por dia (PushEvent tem mais peso)
    events.forEach(e => {
      const d = e.created_at?.slice(0, 10);
      if (d) dayMap[d] = (dayMap[d] ?? 0) + (e.type === 'PushEvent' ? (e.payload?.commits?.length ?? 1) : 1);
    });

    const cells: { date: string; count: number; level: number }[] = [];
    for (let i = totalDays - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const count = dayMap[key] ?? 0;
      const level = count === 0 ? 0 : count <= 2 ? 1 : count <= 5 ? 2 : count <= 10 ? 3 : 4;
      cells.push({ date: key, count, level });
    }

    // Agrupa em semanas de 7 dias
    const weeks: typeof cells[] = [];
    for (let i = 0; i < cells.length; i += 7) {
      weeks.push(cells.slice(i, i + 7));
    }
    this.activityGrid = weeks;
  }

  langColor(lang: string): string {
    return LANG_COLORS[lang] ?? DEFAULT_COLOR;
  }
}
