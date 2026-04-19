import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AnalyticsService } from '../../core/services/analytics.service';
import { FirebaseService } from '../../core/services/firebase.service';

interface SkillEntry {
  name: string;
  matched: boolean;
  score: number;
}

const ELIAS_SKILLS: Record<string, number> = {
  'php': 95, 'laravel': 95, 'python': 80, 'node': 80, 'nodejs': 80, 'node.js': 80,
  'express': 75, 'django': 40, 'fastapi': 50, 'rest': 90, 'api': 90, 'graphql': 55,
  'soap': 85, 'websocket': 70,
  'vue': 85, 'vuejs': 85, 'vue.js': 85, 'react': 75, 'angular': 85, 'typescript': 85,
  'javascript': 90, 'html': 90, 'css': 85, 'tailwind': 90, 'bootstrap': 85,
  'next': 50, 'nextjs': 50, 'nuxt': 60, 'nuxtjs': 60, 'inertia': 75,
  'postgresql': 92, 'postgres': 92, 'mysql': 90, 'sql server': 88, 'mssql': 88,
  'mongodb': 75, 'redis': 72, 'sqlite': 85, 'oracle': 50, 'procedures': 85,
  'sql': 92, 'nosql': 75,
  'docker': 80, 'aws': 72, 'azure': 70, 'gcp': 45, 'kubernetes': 38, 'k8s': 38,
  'ci/cd': 75, 'github actions': 78, 'gitlab ci': 65, 'terraform': 35, 'ansible': 30,
  'linux': 80, 'nginx': 75, 'apache': 70,
  'power bi': 88, 'powerbi': 88, 'dax': 82, 'pentaho': 85, 'etl': 82,
  'tableau': 40, 'looker': 30, 'metabase': 60,
  'openai': 75, 'gemini': 72, 'chatgpt': 70, 'llm': 72, 'ia': 72, 'ai': 72,
  'machine learning': 35, 'tensorflow': 28, 'pytorch': 25, 'pandas': 55, 'numpy': 50,
  'ddd': 65, 'clean architecture': 65, 'microservices': 65, 'microservicos': 65,
  'cqrs': 55, 'solid': 80, 'design patterns': 78, 'event sourcing': 52,
  'scrum': 85, 'kanban': 85, 'agile': 85, 'tdd': 65, 'bdd': 55,
  'git': 92, 'github': 90, 'gitlab': 80, 'figma': 40, 'jira': 80,
  'remoto': 100, 'remote': 100, 'ingles': 72, 'english': 72,
  'mentoria': 85, 'lideranca': 75, 'comunicacao': 85,
};

function findSkillScore(input: string): number | null {
  const n = input.toLowerCase().trim();
  if (ELIAS_SKILLS[n] !== undefined) return ELIAS_SKILLS[n];
  for (const [key, val] of Object.entries(ELIAS_SKILLS)) {
    if (n.includes(key) || key.includes(n)) return val;
  }
  return null;
}

@Component({
  selector: 'app-dev-match',
  standalone: true,
  imports: [FormsModule],
  template: `
    <section id="dev-match" class="py-16 px-4 flex flex-col items-center gap-4">
      <p class="text-gray-500 text-sm text-center max-w-xs">Quer saber se eu me encaixo na sua vaga?</p>
      <button (click)="openModal()"
              class="dev-match-open-btn group relative flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-base tracking-wide transition-all duration-300">
        <svg class="w-5 h-5 transition-transform group-hover:rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Monte seu Dev Ideal
        <span class="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full animate-ping opacity-75"></span>
        <span class="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full"></span>
      </button>
    </section>

    @if (modalOpen()) {
      <div class="fixed inset-0 z-[9998] flex items-center justify-center p-3 sm:p-6"
           (click)="closeModal()">
        <div class="absolute inset-0 bg-black/75 backdrop-blur-sm"></div>

        <div class="relative w-full max-w-5xl bg-gray-900 border border-gray-700/60 rounded-3xl shadow-2xl
                    overflow-hidden flex flex-col max-h-[92vh] animate-modal-in"
             (click)="$event.stopPropagation()">

          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-800 shrink-0">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-sm">🧙</div>
              <div>
                <h2 class="text-white font-bold text-base leading-none">Monte seu Dev Ideal</h2>
                <p class="text-gray-500 text-xs mt-0.5">Descubra o match com Elias</p>
              </div>
            </div>
            <button (click)="closeModal()"
                    class="w-8 h-8 flex items-center justify-center rounded-xl text-gray-600 hover:text-gray-300 hover:bg-gray-800 transition-all text-lg leading-none">
              ✕
            </button>
          </div>

          <div class="flex flex-col lg:flex-row flex-1 overflow-hidden">

            <div class="lg:w-1/2 flex flex-col p-6 border-b lg:border-b-0 lg:border-r border-gray-800 overflow-y-auto">
              <p class="text-gray-400 text-sm mb-4 leading-relaxed">
                Digite as tecnologias, frameworks ou habilidades que a vaga exige. Pressione
                <kbd class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-mono border border-gray-700 text-gray-400">Enter</kbd>
                ou vírgula para adicionar.
              </p>

              <div class="relative mb-4">
                <input
                  type="text"
                  [value]="currentInput()"
                  (input)="onRawInput($event)"
                  (keydown)="onKeydown($event)"
                  placeholder="Ex: Laravel, Vue.js, Docker..."
                  maxlength="40"
                  class="w-full bg-gray-800/70 border border-gray-700/60 rounded-xl px-4 py-3 pr-10 text-sm text-gray-200 placeholder-gray-600 outline-none focus:border-blue-500/60 transition-colors"
                />
                @if (currentInput().length > 0) {
                  <button (click)="addCurrentInput()"
                          class="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 hover:text-blue-300 transition-colors text-xs font-bold">
                    ↵
                  </button>
                }
              </div>

              @if (skills().length > 0) {
                <div class="flex flex-wrap gap-2 mb-5">
                  @for (skill of skills(); track skill.name) {
                    <span class="skill-chip flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                          [class.chip-match]="skill.matched"
                          [class.chip-miss]="!skill.matched">
                      <span>{{ skill.name }}</span>
                      <span class="font-bold opacity-80">
                        @if (skill.matched) { {{ skill.score }}% }
                        @else { ✗ }
                      </span>
                      <button (click)="removeSkill(skill.name)"
                              class="skill-remove-btn w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] leading-none ml-0.5 shrink-0">
                        ×
                      </button>
                    </span>
                  }
                </div>
              }

              @if (skills().length === 0) {
                <div class="mb-5">
                  <p class="text-gray-600 text-xs mb-2">Sugestões rápidas:</p>
                  <div class="flex flex-wrap gap-1.5">
                    @for (s of suggestions; track s) {
                      <button (click)="addSuggestion(s)"
                              class="px-2.5 py-1 rounded-full border border-dashed border-gray-700 text-gray-500 hover:border-blue-500/50 hover:text-blue-400 transition-all text-xs">
                        {{ s }}
                      </button>
                    }
                  </div>
                </div>
              }

              @if (skills().length > 0) {
                <div class="mt-auto pt-4 border-t border-gray-800">
                  <div class="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Match geral</span>
                    <span class="font-mono font-bold" [style.color]="matchColor()">{{ matchPercent() }}%</span>
                  </div>
                  <div class="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div class="h-full rounded-full transition-all duration-700"
                         [style.width]="matchPercent() + '%'"
                         [style.background]="matchColor()"></div>
                  </div>
                  <p class="text-xs mt-2 font-semibold transition-colors duration-500" [style.color]="matchColor()">
                    {{ matchLabel() }}
                  </p>

                  <div class="mt-3 space-y-1.5">
                    @for (skill of skills(); track skill.name) {
                      <div class="flex items-center gap-2 text-xs">
                        <span class="w-2 h-2 rounded-full shrink-0"
                              [class.bg-green-400]="skill.score >= 70"
                              [class.bg-yellow-400]="skill.score >= 40 && skill.score < 70"
                              [class.bg-red-400]="skill.score > 0 && skill.score < 40"
                              [class.bg-gray-600]="!skill.matched"></span>
                        <span class="text-gray-400 flex-1 truncate">{{ skill.name }}</span>
                        <span class="font-mono shrink-0"
                              [class.text-green-400]="skill.score >= 70"
                              [class.text-yellow-400]="skill.score >= 40 && skill.score < 70"
                              [class.text-red-400]="skill.score > 0 && skill.score < 40"
                              [class.text-gray-600]="!skill.matched">
                          {{ skill.matched ? skill.score + '%' : 'não sei ainda' }}
                        </span>
                      </div>
                    }
                  </div>

                  @if (matchPercent() >= 60) {
                    <div class="mt-4 p-3 rounded-xl bg-cyan-500/8 border border-cyan-500/20 text-center">
                      @if (matchPercent() >= 85) {
                        <p class="text-cyan-300 text-xs font-semibold mb-2">🚀 Match perfeito! Elias é o dev certo!</p>
                      } @else {
                        <p class="text-cyan-300 text-xs font-semibold mb-2">🎯 Elias é uma excelente escolha!</p>
                      }
                      <a href="#contato" (click)="onContactClick(); closeModal()"
                         class="inline-block px-5 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-bold rounded-full hover:scale-105 transition-transform">
                        Entrar em contato
                      </a>
                    </div>
                  }
                  @if (matchPercent() < 60 && matchPercent() > 0) {
                    <div class="mt-4 p-3 rounded-xl bg-amber-500/8 border border-amber-500/20 text-center">
                      <p class="text-amber-300 text-xs font-semibold mb-1">🌱 Elias aprende tudo rapidamente</p>
                      <p class="text-gray-500 text-xs mb-2">O que não domino hoje, domino em semanas.</p>
                      <a href="#contato" (click)="onContactClick(); closeModal()"
                         class="inline-block px-5 py-2 border border-amber-500/40 text-amber-300 text-xs font-bold rounded-full hover:bg-amber-500/10 transition-all">
                        Vamos conversar mesmo assim?
                      </a>
                    </div>
                  }
                </div>
              }
            </div>

            <div class="lg:w-1/2 flex flex-col items-center justify-center p-6 bg-gray-900/50 relative overflow-hidden min-h-[320px]">
              <div class="absolute inset-0 pointer-events-none transition-all duration-1000"
                   [style.background]="'radial-gradient(ellipse at 50% 80%, ' + matchColor() + '18 0%, transparent 65%)'"></div>

              @if (skills().length > 0) {
                <div class="absolute top-4 right-4 text-right animate-fade-in">
                  <div class="text-3xl font-black leading-none transition-colors duration-700" [style.color]="matchColor()">
                    {{ matchPercent() }}<span class="text-base font-semibold">%</span>
                  </div>
                  <div class="text-gray-500 text-[10px] uppercase tracking-widest font-mono">match</div>
                </div>
              }

              <div class="relative flex items-center justify-center" style="width: 200px; height: 340px;">
                <svg viewBox="0 0 200 340" width="200" height="340" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <clipPath id="silhouette-clip">
                      <path fill-rule="evenodd" d="
                        M100,8 C116,8 128,20 128,36 C128,52 116,64 100,64 C84,64 72,52 72,36 C72,20 84,8 100,8 Z
                        M68,72 C52,76 44,88 40,104 L28,148 C26,155 30,162 37,164 C44,166 51,162 53,155 L62,120
                        L62,180 L48,268 C46,276 50,284 58,286 C66,288 74,284 76,276 L88,200 L100,192 L112,200
                        L124,276 C126,284 134,288 142,286 C150,284 154,276 152,268 L138,180 L138,120 L147,155
                        C149,162 156,166 163,164 C170,162 174,155 172,148 L160,104 C156,88 148,76 132,72
                        C122,70 110,68 100,68 C90,68 78,70 68,72 Z
                      "/>
                    </clipPath>
                  </defs>

                  <path fill-rule="evenodd" d="
                    M100,8 C116,8 128,20 128,36 C128,52 116,64 100,64 C84,64 72,52 72,36 C72,20 84,8 100,8 Z
                    M68,72 C52,76 44,88 40,104 L28,148 C26,155 30,162 37,164 C44,166 51,162 53,155 L62,120
                    L62,180 L48,268 C46,276 50,284 58,286 C66,288 74,284 76,276 L88,200 L100,192 L112,200
                    L124,276 C126,284 134,288 142,286 C150,284 154,276 152,268 L138,180 L138,120 L147,155
                    C149,162 156,166 163,164 C170,162 174,155 172,148 L160,104 C156,88 148,76 132,72
                    C122,70 110,68 100,68 C90,68 78,70 68,72 Z
                  " fill="#0f172a" stroke="#334155" stroke-width="1.5"/>

                  <rect x="0" [attr.y]="340 - matchPercent() * 3.4" width="200" [attr.height]="matchPercent() * 3.4"
                        [attr.fill]="matchColor()"
                        opacity="0.7"
                        clip-path="url(#silhouette-clip)"
                        style="transition: y 0.8s ease, height 0.8s ease, fill 0.5s ease"/>

                  @if (skills().length > 0 && matchPercent() > 0 && matchPercent() < 100) {
                    <line [attr.y1]="340 - matchPercent() * 3.4"
                          [attr.y2]="340 - matchPercent() * 3.4"
                          x1="20" x2="180"
                          [attr.stroke]="matchColor()"
                          stroke-width="1.5"
                          stroke-dasharray="4 3"
                          opacity="0.6"
                          style="transition: all 0.8s ease"/>
                  }
                </svg>

                @if (skills().length === 0) {
                  <div class="absolute bottom-8 text-center">
                    <p class="text-gray-600 text-xs leading-relaxed">
                      ← Digite tecnologias<br>para ver o match
                    </p>
                  </div>
                }
              </div>

              @if (skills().length > 0) {
                <div class="flex flex-wrap justify-center gap-1.5 mt-2 max-w-[220px]">
                  @for (skill of skills(); track skill.name) {
                    <span class="text-[10px] px-2 py-0.5 rounded-full font-mono transition-all duration-500"
                          [class.tag-match]="skill.matched"
                          [class.tag-miss]="!skill.matched">
                      {{ skill.name }}
                    </span>
                  }
                </div>
              }
            </div>

          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .dev-match-open-btn {
      background: linear-gradient(135deg, #3b82f6, #06b6d4);
      box-shadow: 0 4px 24px rgba(6, 182, 212, 0.3);
      color: #ffffff;
      cursor: pointer;
    }
    .dev-match-open-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 32px rgba(6, 182, 212, 0.45);
    }
    .dev-match-open-btn:active { transform: translateY(0); }

    @keyframes modal-in {
      from { opacity: 0; transform: scale(0.95) translateY(10px); }
      to   { opacity: 1; transform: scale(1) translateY(0); }
    }
    .animate-modal-in { animation: modal-in 0.25s ease; }

    @keyframes fade-in {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    .animate-fade-in { animation: fade-in 0.4s ease; }

    .chip-match {
      background: rgba(34, 197, 94, 0.1);
      border: 1px solid rgba(34, 197, 94, 0.35);
      color: #86efac;
    }
    .chip-miss {
      background: rgba(239, 68, 68, 0.08);
      border: 1px solid rgba(239, 68, 68, 0.25);
      color: #fca5a5;
    }
    .skill-remove-btn {
      background: rgba(255,255,255,0.15);
      color: inherit;
      cursor: pointer;
      transition: background 0.15s;
    }
    .skill-remove-btn:hover { background: rgba(255,255,255,0.3); }

    .tag-match {
      background: rgba(34, 197, 94, 0.15);
      color: #86efac;
      border: 1px solid rgba(34, 197, 94, 0.2);
    }
    .tag-miss {
      background: rgba(100, 116, 139, 0.15);
      color: #64748b;
      border: 1px solid rgba(100, 116, 139, 0.2);
    }
  `]
})
export class DevMatchComponent implements OnInit {
  private analytics = inject(AnalyticsService);
  private firebaseService = inject(FirebaseService);

  modalOpen = signal(false);
  skills = signal<SkillEntry[]>([]);
  currentInput = signal('');

  readonly suggestions = [
    'Laravel', 'Vue.js', 'Angular', 'React', 'Node.js',
    'Docker', 'PostgreSQL', 'Python', 'TypeScript', 'Power BI',
    'AWS', 'MongoDB', 'Scrum', 'Remoto',
  ];

  matchPercent = computed(() => {
    const list = this.skills();
    if (list.length === 0) return 0;
    const total = list.reduce((s, sk) => s + (sk.matched ? sk.score : 0), 0);
    return Math.round(total / list.length);
  });

  matchColor = computed(() => {
    const p = this.matchPercent();
    if (p === 0) return '#334155';
    if (p < 40)  return '#f87171';
    if (p < 65)  return '#fbbf24';
    if (p < 85)  return '#22d3ee';
    return '#4ade80';
  });

  matchLabel = computed(() => {
    const p = this.matchPercent();
    if (p === 0)  return '';
    if (p < 40)   return '🔍 Baixo match — mas sempre aprendendo!';
    if (p < 65)   return '💡 Match parcial — bom potencial';
    if (p < 85)   return '🎯 Ótimo alinhamento!';
    return '🚀 Match perfeito!';
  });

  ngOnInit(): void {}

  openModal(): void {
    this.modalOpen.set(true);
    void this.analytics.trackFeatureStart('dev_match', { source: 'button' });
  }

  closeModal(): void {
    this.modalOpen.set(false);
    if (this.skills().length > 0) {
      this.saveToFirebase();
    }
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      this.addCurrentInput();
    }
    if (event.key === 'Backspace' && this.currentInput() === '') {
      const list = this.skills();
      if (list.length > 0) {
        this.skills.set(list.slice(0, -1));
      }
    }
  }

  onRawInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    if (val.includes(',')) {
      const parts = val.split(',');
      for (const p of parts.slice(0, -1)) {
        this.addSkill(p.trim());
      }
      this.currentInput.set(parts[parts.length - 1]);
      (event.target as HTMLInputElement).value = parts[parts.length - 1];
    } else {
      this.currentInput.set(val);
    }
  }

  addCurrentInput(): void {
    const val = this.currentInput().trim().replace(/,/g, '');
    if (val) this.addSkill(val);
    this.currentInput.set('');
  }

  addSuggestion(s: string): void {
    this.addSkill(s);
  }

  private addSkill(name: string): void {
    if (!name) return;
    const normalized = name.trim();
    if (this.skills().some(sk => sk.name.toLowerCase() === normalized.toLowerCase())) return;
    const score = findSkillScore(normalized);
    const matched = score !== null;
    this.skills.update(list => [...list, { name: normalized, matched, score: score ?? 0 }]);
  }

  removeSkill(name: string): void {
    this.skills.update(list => list.filter(sk => sk.name !== name));
  }

  onContactClick(): void {
    void this.analytics.trackCtaClick('dev_match_contact', 'dev-match', 'contact', {
      matchPercent: this.matchPercent(),
    });
    this.saveToFirebase();
  }

  private saveToFirebase(): void {
    const _vid = localStorage.getItem('portfolio-vid') ?? undefined;
    if (_vid) this.firebaseService.touchVisitor(_vid);
    this.firebaseService.saveDevMatch({
      visitorId: _vid,
      areas: this.skills().map(s => s.name),
      requirements: [],
      matchPercentage: this.matchPercent(),
    }).catch(() => {});
    void this.analytics.trackFeatureComplete('dev_match', this.matchPercent(), {
      skills: this.skills().length,
    });
  }
}