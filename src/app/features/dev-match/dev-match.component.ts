import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface SkillArea {
  id: string;
  label: string;
  icon: string;
  eliasScore: number;
  importance: number;
  color: string;
  techs: string[];
  custom?: boolean;
}

interface ToggleItem {
  id: string;
  label: string;
  icon: string;
  eliasHas: boolean;
  active: boolean;
}

@Component({
  selector: 'app-dev-match',
  standalone: true,
  imports: [FormsModule],
  template: `
    <section id="dev-match" class="py-24 px-8">
      <div class="max-w-6xl mx-auto">

        <div class="text-center mb-12">
          <h2 class="text-4xl font-bold bg-linear-to-r from-blue-400 to-cyan-400 text-transparent bg-clip-text inline-block devmatch-title">
            🧙 Monte seu Dev Ideal
          </h2>
          <p class="text-gray-400 mt-4 max-w-lg mx-auto text-sm leading-relaxed">
            Configure o perfil do desenvolvedor que você procura.<br>
            Veja em tempo real o quanto Elias se encaixa.
          </p>
          <div class="mt-3 mx-auto w-16 h-px bg-linear-to-r from-blue-400 to-cyan-400 rounded-full"></div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

          <!-- LEFT: Configurador -->
          <div class="lg:col-span-3 space-y-6">

            <!-- Sliders -->
            <div class="devmatch-card bg-gray-800/50 rounded-2xl border border-gray-700/50 p-6 backdrop-blur-sm">
              <h3 class="devmatch-card-title text-white font-semibold mb-1">⚡ Áreas de atuação</h3>
              <p class="text-gray-500 text-xs mb-5">Arraste para definir a importância. O badge mostra o quanto Elias cobre cada área.</p>

              <!-- Lista com scroll -->
              <div class="areas-scroll-list max-h-[480px] overflow-y-auto pr-2 space-y-5">
                @for (area of allAreas; track area.id) {
                  <div class="group">
                    <div class="flex items-center justify-between mb-2">
                      <div class="flex items-center gap-2 min-w-0">
                        <span class="text-sm text-gray-300 truncate">{{ area.icon }} {{ area.label }}</span>
                        @if (area.custom) {
                          <span class="text-xs px-1.5 py-0.5 rounded bg-gray-700/60 text-gray-500 leading-none shrink-0">custom</span>
                        }
                        @if (area.importance > 0) {
                          <span class="text-xs px-1.5 py-0.5 rounded-full leading-none shrink-0 transition-all duration-300"
                                [style.background]="area.eliasScore >= 70 ? '#16a34a22' : area.eliasScore >= 40 ? '#d9770622' : '#dc262622'"
                                [style.color]="area.eliasScore >= 70 ? '#4ade80' : area.eliasScore >= 40 ? '#fb923c' : '#f87171'">
                            {{ area.eliasScore >= 70 ? '✓' : area.eliasScore >= 40 ? '~' : '✗' }} {{ area.eliasScore }}%
                          </span>
                        }
                      </div>
                      <div class="flex items-center gap-2 shrink-0">
                        <span class="text-xs font-mono px-2 py-0.5 rounded-full transition-all duration-300"
                              [style.background]="area.importance > 0 ? area.color + '20' : 'transparent'"
                              [style.color]="area.importance > 0 ? area.color : '#6b7280'">
                          {{ importanceLabel(area.importance) }}
                        </span>
                        @if (area.custom) {
                          <button (click)="removeCustomArea(area.id)"
                                  class="text-gray-600 hover:text-red-400 transition-colors text-xs opacity-0 group-hover:opacity-100 leading-none">✕</button>
                        }
                      </div>
                    </div>
                    <input type="range" min="0" max="100" step="10"
                           [(ngModel)]="area.importance"
                           class="devmatch-slider w-full rounded-full outline-none cursor-pointer"
                           [style.accent-color]="area.color">
                    @if (area.importance > 0 && area.techs.length > 0) {
                      <div class="flex flex-wrap gap-1 mt-2 animate-fade-in">
                        @for (tech of area.techs; track tech) {
                          <span class="text-xs px-2 py-0.5 rounded-full bg-gray-700/50 text-gray-400 border border-gray-600/30">{{ tech }}</span>
                        }
                      </div>
                    }
                    @if (area.custom && area.importance > 0) {
                      <p class="text-xs mt-1.5 text-gray-500">
                        Nota que você deu:
                        <span class="font-mono font-semibold"
                              [style.color]="area.eliasScore >= 70 ? '#4ade80' : area.eliasScore >= 40 ? '#fb923c' : '#f87171'">
                          {{ area.eliasScore }}%
                        </span>
                      </p>
                    }
                  </div>
                }
              </div>

              <!-- Adicionar área personalizada -->
              <div class="mt-5 pt-5 border-t border-gray-700/40">
                @if (!showCustomForm) {
                  <button (click)="showCustomForm = true"
                          class="w-full py-2 rounded-xl border border-dashed border-gray-700 text-gray-500 hover:border-blue-500/50 hover:text-blue-400 transition-all text-sm">
                    + Adicionar área personalizada
                  </button>
                } @else {
                  <div class="space-y-4 animate-fade-in">
                    <p class="devmatch-card-title text-white text-sm font-semibold">Nova área personalizada</p>
                    <input type="text"
                           [(ngModel)]="newAreaLabel"
                           placeholder="Ex: Automação RPA, Sistemas embarcados..."
                           maxlength="40"
                           class="devmatch-input w-full bg-gray-900/60 border border-gray-700/60 rounded-xl px-3 py-2 text-sm text-gray-200 placeholder-gray-600 outline-none focus:border-blue-500/60 transition-colors">
                    <div>
                      <div class="flex justify-between text-xs mb-2">
                        <span class="text-gray-400">Nota que você dá para Elias nessa área</span>
                        <span class="font-mono font-bold"
                              [style.color]="newAreaScore >= 70 ? '#4ade80' : newAreaScore >= 40 ? '#fb923c' : '#f87171'">
                          {{ newAreaScore }}%
                        </span>
                      </div>
                      <input type="range" min="0" max="100" step="5"
                             [(ngModel)]="newAreaScore"
                             class="devmatch-slider w-full rounded-full outline-none cursor-pointer"
                             style="accent-color: #60a5fa">
                      <p class="text-xs text-gray-600 mt-1.5">0 = não tem &nbsp;·&nbsp; 50 = não sei &nbsp;·&nbsp; 100 = especialista</p>
                    </div>
                    <div class="flex gap-2">
                      <button (click)="addCustomArea()"
                              [disabled]="!newAreaLabel.trim()"
                              class="flex-1 py-2 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-300 hover:bg-blue-500/30 transition-all text-sm disabled:opacity-40 disabled:cursor-not-allowed">
                        Adicionar
                      </button>
                      <button (click)="cancelCustomForm()"
                              class="px-4 py-2 rounded-xl border border-gray-700 text-gray-500 hover:text-gray-300 transition-all text-sm">
                        Cancelar
                      </button>
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- Toggles -->
            <div class="devmatch-card bg-gray-800/50 rounded-2xl border border-gray-700/50 p-6 backdrop-blur-sm">
              <h3 class="devmatch-card-title text-white font-semibold mb-1">🎯 Requisitos específicos</h3>
              <p class="text-gray-500 text-xs mb-5">Clique nos que são importantes para você</p>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                @for (toggle of toggles; track toggle.id) {
                  <button (click)="toggle.active = !toggle.active"
                          class="devmatch-toggle flex items-center gap-3 px-4 py-3 rounded-xl border text-sm text-left transition-all duration-200 w-full"
                          [class.toggle-inactive]="!toggle.active"
                          [class.toggle-match]="toggle.active && toggle.eliasHas"
                          [class.toggle-miss]="toggle.active && !toggle.eliasHas">
                    <span class="text-base shrink-0">{{ toggle.icon }}</span>
                    <span class="flex-1 leading-tight">{{ toggle.label }}</span>
                    @if (toggle.active) {
                      <span class="text-sm font-bold shrink-0">{{ toggle.eliasHas ? '✓' : '✗' }}</span>
                    }
                  </button>
                }
              </div>
            </div>

          </div>

          <!-- RIGHT: Resultado -->
          <div class="lg:col-span-2 space-y-4 lg:sticky lg:top-24">

            <!-- Score principal -->
            <div class="devmatch-card bg-gray-800/50 rounded-2xl border border-gray-700/50 p-6 backdrop-blur-sm text-center relative overflow-hidden">
              <div class="absolute inset-0 pointer-events-none transition-all duration-700"
                   [style.background]="'radial-gradient(circle at 50% 65%, ' + matchColor + '18 0%, transparent 65%)'"></div>

              <p class="text-gray-500 text-xs uppercase tracking-widest font-mono mb-4">Compatibilidade</p>

              <!-- Anel circular SVG -->
              <div class="inline-flex items-center justify-center relative mb-4">
                <svg width="168" height="168" viewBox="0 0 168 168" class="-rotate-90">
                  <!-- Trilha de fundo -->
                  <circle cx="84" cy="84" r="72" fill="none" stroke="#1e293b" stroke-width="10"/>
                  <!-- Trilha de progresso -->
                  <circle cx="84" cy="84" r="72"
                          fill="none"
                          [attr.stroke]="matchColor"
                          stroke-width="10"
                          stroke-linecap="round"
                          [attr.stroke-dasharray]="circumference"
                          [attr.stroke-dashoffset]="dashOffset"
                          style="transition: stroke-dashoffset 0.8s ease, stroke 0.5s ease"/>
                </svg>
                <div class="absolute text-center">
                  <div class="text-4xl font-bold text-white leading-none">{{ overallMatch }}</div>
                  <div class="text-gray-400 text-sm">%</div>
                </div>
              </div>

              <p class="font-semibold text-base transition-all duration-500" [style.color]="matchColor">{{ matchLabel }}</p>
              <p class="text-gray-500 text-xs mt-1">{{ matchSub }}</p>
            </div>

            <!-- Detalhamento por área -->
            @if (activeAreas.length > 0) {
              <div class="devmatch-card bg-gray-800/50 rounded-2xl border border-gray-700/50 p-5 backdrop-blur-sm">
                <p class="devmatch-card-title text-white text-sm font-semibold mb-4">Detalhamento por área</p>
                <div class="space-y-3">
                  @for (area of activeAreas; track area.id) {
                    <div>
                      <div class="flex justify-between text-xs mb-1">
                        <span class="text-gray-400">{{ area.icon }} {{ area.label }}</span>
                        <span class="font-mono font-bold" [style.color]="area.color">{{ area.eliasScore }}%</span>
                      </div>
                      <div class="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                        <div class="h-full rounded-full"
                             [style.width]="area.eliasScore + '%'"
                             [style.background]="area.color"
                             style="transition: width 0.7s ease"></div>
                      </div>
                    </div>
                  }
                </div>
              </div>
            }

            <!-- CTA ao atingir bom match -->
            @if (overallMatch >= 70) {
              <div class="devmatch-cta rounded-2xl border border-cyan-500/30 bg-cyan-500/5 p-5 text-center"
                   style="animation: devMatchFadeIn 0.5s ease">
                <p class="text-cyan-300 font-semibold text-sm mb-3">
                  {{ overallMatch >= 90 ? '🎉 Match perfeito encontrado!' : '🎯 Elias é uma ótima escolha!' }}
                </p>
                <a href="#contato"
                   class="devmatch-cta-btn inline-block px-6 py-2.5 bg-linear-to-r from-blue-500 to-cyan-500 text-white text-sm font-semibold rounded-full hover:scale-105 transition-transform">
                  Entrar em Contato
                </a>
              </div>
            }

          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .devmatch-slider {
      -webkit-appearance: none;
      appearance: none;
      height: 6px;
      background: #1e293b;
    }
    .devmatch-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      cursor: pointer;
      box-shadow: 0 0 6px currentColor;
    }

    .toggle-inactive {
      background: rgba(30, 41, 59, 0.4);
      border-color: rgba(71, 85, 105, 0.4);
      color: #94a3b8;
    }
    .toggle-inactive:hover {
      border-color: rgba(100, 116, 139, 0.6);
      color: #cbd5e1;
      background: rgba(30, 41, 59, 0.6);
    }
    .toggle-match {
      background: rgba(34, 197, 94, 0.1);
      border-color: rgba(34, 197, 94, 0.4);
      color: #86efac;
    }
    .toggle-miss {
      background: rgba(239, 68, 68, 0.08);
      border-color: rgba(239, 68, 68, 0.25);
      color: #fca5a5;
    }

    .animate-fade-in {
      animation: devMatchFadeIn 0.3s ease;
    }

    .areas-scroll-list::-webkit-scrollbar { width: 4px; }
    .areas-scroll-list::-webkit-scrollbar-track { background: transparent; }
    .areas-scroll-list::-webkit-scrollbar-thumb { background: rgba(100,116,139,0.3); border-radius: 4px; }
    .areas-scroll-list::-webkit-scrollbar-thumb:hover { background: rgba(100,116,139,0.55); }

    .devmatch-input:focus { box-shadow: 0 0 0 2px rgba(96,165,250,0.2); }

    @keyframes devMatchFadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class DevMatchComponent {
  readonly circumference = 2 * Math.PI * 72; // ~452.4

  areas: SkillArea[] = [
    // --- Áreas fortes de Elias ---
    { id: 'backend',    label: 'Backend & APIs',          icon: '⚙️',  eliasScore: 95, importance: 0, color: '#60a5fa', techs: ['PHP', 'Laravel', 'Python', 'Node.js', 'REST', 'SOAP'] },
    { id: 'frontend',   label: 'Frontend & UI',           icon: '🖥️',  eliasScore: 85, importance: 0, color: '#22d3ee', techs: ['Vue.js', 'React', 'Angular', 'TypeScript', 'Tailwind'] },
    { id: 'database',   label: 'Banco de Dados',          icon: '🗄️',  eliasScore: 92, importance: 0, color: '#a78bfa', techs: ['PostgreSQL', 'MySQL', 'SQL Server', 'MongoDB', 'Procedures'] },
    { id: 'devops',     label: 'Cloud & DevOps',          icon: '☁️',  eliasScore: 78, importance: 0, color: '#34d399', techs: ['Docker', 'GitHub Actions', 'Azure', 'AWS', 'CI/CD'] },
    { id: 'bi',         label: 'BI & Analytics',          icon: '📊',  eliasScore: 88, importance: 0, color: '#fb923c', techs: ['Power BI', 'DAX', 'Pentaho', 'SQL Analítico'] },
    { id: 'ai',         label: 'Integração com IA',       icon: '🤖',  eliasScore: 75, importance: 0, color: '#f472b6', techs: ['OpenAI', 'Gemini', 'APIs LLM', 'Automação inteligente'] },
    { id: 'arch',       label: 'Arquitetura de Software', icon: '🏗️',  eliasScore: 68, importance: 0, color: '#fbbf24', techs: ['DDD', 'Clean Arch', 'Microserviços', 'CQRS', 'Event Sourcing'] },
    // --- Áreas que Elias não domina (resultado mais justo) ---
    { id: 'mobile',     label: 'Mobile nativo / cross',   icon: '📱',  eliasScore: 25, importance: 0, color: '#38bdf8', techs: ['Swift', 'Kotlin', 'Flutter', 'React Native', 'Expo'] },
    { id: 'ml',         label: 'Machine Learning',        icon: '🧠',  eliasScore: 35, importance: 0, color: '#818cf8', techs: ['Python ML', 'TensorFlow', 'scikit-learn', 'Pandas', 'Jupyter'] },
    { id: 'qa',         label: 'QA / Testes automatizados', icon: '🧪', eliasScore: 50, importance: 0, color: '#4ade80', techs: ['Jest', 'Cypress', 'Playwright', 'PHPUnit', 'Selenium'] },
    { id: 'security',   label: 'Segurança / Pentest',     icon: '🔐',  eliasScore: 30, importance: 0, color: '#f87171', techs: ['OWASP', 'Pentest', 'SAST', 'Análise de vulnerabilidades'] },
    { id: 'ux',         label: 'UX / Design de Produto',  icon: '🎨',  eliasScore: 40, importance: 0, color: '#e879f9', techs: ['Figma', 'Prototipagem', 'Design System', 'User Research'] },
    { id: 'infra',      label: 'Infra / K8s / Terraform', icon: '🛠️',  eliasScore: 38, importance: 0, color: '#94a3b8', techs: ['Kubernetes', 'Terraform', 'Ansible', 'Helm', 'Linux Admin'] },
    { id: 'blockchain', label: 'Blockchain / Web3',       icon: '⛓️',  eliasScore: 10, importance: 0, color: '#c084fc', techs: ['Solidity', 'Ethereum', 'Smart Contracts', 'Web3.js'] },
    { id: 'gamedev',    label: 'Game Development',        icon: '🎮',  eliasScore: 8,  importance: 0, color: '#fdba74', techs: ['Unity', 'Unreal', 'Godot', 'C#', 'C++'] },
    { id: 'embedded',   label: 'Embarcados / IoT',        icon: '📡',  eliasScore: 12, importance: 0, color: '#bef264', techs: ['Arduino', 'ESP32', 'MQTT', 'C/C++', 'Raspberry Pi'] },
  ];

  customAreas: SkillArea[] = [];
  showCustomForm = false;
  newAreaLabel = '';
  newAreaScore = 50;

  private readonly customColors = [
    '#38bdf8','#c084fc','#4ade80','#fb7185',
    '#a3e635','#fbbf24','#67e8f9','#f9a8d4',
    '#86efac','#fcd34d'
  ];

  toggles: ToggleItem[] = [
    { id: 'remote',      label: 'Trabalho 100% remoto',          icon: '🏠', eliasHas: true,  active: false },
    { id: 'saas',        label: 'Experiência com SaaS',          icon: '🌐', eliasHas: true,  active: false },
    { id: 'mentoring',   label: 'Mentorou devs juniores',        icon: '👥', eliasHas: true,  active: false },
    { id: 'security',    label: 'Auth / 2FA / RBAC',             icon: '🔒', eliasHas: true,  active: false },
    { id: 'perf',        label: 'Otimização de performance',     icon: '⚡', eliasHas: true,  active: false },
    { id: 'agile',       label: 'Experiência com Scrum/Kanban',  icon: '🔄', eliasHas: true,  active: false },
    { id: 'multitenant', label: 'Sistemas multi-tenant',         icon: '🏢', eliasHas: true,  active: false },
    { id: 'legacy',      label: 'Migração de sistemas legados',  icon: '🔧', eliasHas: true,  active: false },
  ];

  addCustomArea(): void {
    if (!this.newAreaLabel.trim()) return;
    const color = this.customColors[this.customAreas.length % this.customColors.length];
    this.customAreas.push({
      id: 'custom_' + Date.now(),
      label: this.newAreaLabel.trim(),
      icon: '✦',
      eliasScore: this.newAreaScore,
      importance: 0,
      color,
      techs: [],
      custom: true,
    });
    this.cancelCustomForm();
  }

  removeCustomArea(id: string): void {
    this.customAreas = this.customAreas.filter(a => a.id !== id);
  }

  cancelCustomForm(): void {
    this.newAreaLabel = '';
    this.newAreaScore = 50;
    this.showCustomForm = false;
  }

  get allAreas(): SkillArea[] {
    return [...this.areas, ...this.customAreas];
  }

  importanceLabel(v: number): string {
    if (v === 0)   return 'ignorar';
    if (v <= 30)   return 'baixa';
    if (v <= 60)   return 'média';
    if (v <= 80)   return 'alta';
    return 'essencial';
  }

  get activeAreas(): SkillArea[] {
    return this.allAreas.filter(a => a.importance > 0);
  }

  get hasAny(): boolean {
    return this.activeAreas.length > 0 || this.toggles.some(t => t.active);
  }

  get sliderMatch(): number {
    const total = this.allAreas.reduce((s, a) => s + a.importance, 0);
    if (total === 0) return 0;
    return Math.round(this.allAreas.reduce((s, a) => s + a.importance * a.eliasScore, 0) / total);
  }

  get toggleMatch(): number {
    const active = this.toggles.filter(t => t.active);
    if (active.length === 0) return 100;
    return Math.round(active.filter(t => t.eliasHas).length / active.length * 100);
  }

  get overallMatch(): number {
    if (!this.hasAny) return 0;
    const hasSliders = this.activeAreas.length > 0;
    const hasToggles = this.toggles.some(t => t.active);
    if (hasSliders && hasToggles) return Math.round(this.sliderMatch * 0.65 + this.toggleMatch * 0.35);
    if (hasSliders) return this.sliderMatch;
    return this.toggleMatch;
  }

  get matchColor(): string {
    const m = this.overallMatch;
    if (m === 0)   return '#475569';
    if (m < 50)    return '#f87171';
    if (m < 70)    return '#fbbf24';
    if (m < 85)    return '#22d3ee';
    return '#4ade80';
  }

  get matchLabel(): string {
    const m = this.overallMatch;
    if (m === 0)   return 'Configure acima ↑';
    if (m < 50)    return '🔍 Encaixe parcial';
    if (m < 70)    return '💡 Bom potencial';
    if (m < 85)    return '🎯 Ótimo alinhamento!';
    return '🚀 Match perfeito!';
  }

  get matchSub(): string {
    const m = this.overallMatch;
    if (m === 0)   return 'Ajuste os sliders e requisitos';
    if (m < 50)    return 'Elias cobre parte das suas necessidades';
    if (m < 70)    return 'Elias atende a maioria do que você procura';
    if (m < 85)    return 'Elias é uma excelente escolha para seu time';
    return 'Você encontrou o desenvolvedor certo!';
  }

  get dashOffset(): number {
    return this.circumference * (1 - this.overallMatch / 100);
  }
}
