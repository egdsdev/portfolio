import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

const STORAGE_KEY = 'portfolio-devmatch-v2';

interface SavedState {
  areaImportances: Record<string, number>;
  customAreas: SkillArea[];
  toggleActives: Record<string, boolean>;
  customToggles: ToggleItem[];
}

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
  custom?: boolean;
}

@Component({
  selector: 'app-dev-match',
  standalone: true,
  imports: [FormsModule],
  template: `
    <section id="dev-match" class="py-24 px-8">
      <div class="max-w-6xl mx-auto">

        <div class="text-center mb-12">
          <div class="flex items-center justify-center gap-3 flex-wrap mb-2">
            <h2 class="text-4xl font-bold bg-linear-to-r from-blue-400 to-cyan-400 text-transparent bg-clip-text inline-block devmatch-title">
              🧙 Monte seu Dev Ideal
            </h2>
            @if (hasSavedState) {
              <button (click)="resetAll()"
                      class="text-xs px-3 py-1 rounded-full border border-gray-700 text-gray-500 hover:border-red-500/40 hover:text-red-400 transition-all">
                🗑 Limpar tudo
              </button>
            }
          </div>
          <p class="text-gray-400 mt-2 max-w-lg mx-auto text-sm leading-relaxed">
            Configure o perfil do desenvolvedor que você procura.<br>
            Veja em tempo real o quanto Elias se encaixa.
          </p>
          @if (hasSavedState) {
            <p class="text-xs text-gray-600 mt-2">💾 Suas escolhas estão salvas automaticamente no navegador</p>
          }
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
                           (change)="saveState()"
                           class="devmatch-slider w-full outline-none cursor-pointer"
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
                @if (!showCustomAreaForm) {
                  <button (click)="showCustomAreaForm = true"
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
                             class="devmatch-slider w-full outline-none cursor-pointer"
                             style="accent-color: #60a5fa">
                      <p class="text-xs text-gray-600 mt-1.5">0 = não tem &nbsp;·&nbsp; 50 = não sei &nbsp;·&nbsp; 100 = especialista</p>
                    </div>
                    <div class="flex gap-2">
                      <button (click)="addCustomArea()"
                              [disabled]="!newAreaLabel.trim()"
                              class="flex-1 py-2 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-300 hover:bg-blue-500/30 transition-all text-sm disabled:opacity-40 disabled:cursor-not-allowed">
                        Adicionar
                      </button>
                      <button (click)="cancelCustomAreaForm()"
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
                @for (toggle of allToggles; track toggle.id) {
                  <button (click)="toggle.active = !toggle.active"
                          class="devmatch-toggle group flex items-center gap-3 px-4 py-3 rounded-xl border text-sm text-left transition-all duration-200 w-full"
                          [class.toggle-inactive]="!toggle.active"
                          [class.toggle-match]="toggle.active && toggle.eliasHas"
                          [class.toggle-miss]="toggle.active && !toggle.eliasHas">
                    <span class="text-base shrink-0">{{ toggle.icon }}</span>
                    <span class="flex-1 leading-tight">{{ toggle.label }}</span>
                    @if (toggle.custom) {
                      <span class="text-xs opacity-30 leading-none mr-0.5">custom</span>
                    }
                    @if (toggle.active) {
                      <span class="text-sm font-bold shrink-0">{{ toggle.eliasHas ? '✓' : '✗' }}</span>
                    }
                    @if (toggle.custom && !toggle.active) {
                      <span (click)="$event.stopPropagation(); removeCustomToggle(toggle.id)"
                            class="text-gray-600 hover:text-red-400 transition-colors text-xs shrink-0 opacity-0 group-hover:opacity-100 leading-none">✕</span>
                    }
                  </button>
                }
              </div>

              <!-- Adicionar requisito personalizado -->
              <div class="mt-4 pt-4 border-t border-gray-700/40">
                @if (!showCustomToggleForm) {
                  <button (click)="showCustomToggleForm = true"
                          class="w-full py-2 rounded-xl border border-dashed border-gray-700 text-gray-500 hover:border-purple-500/50 hover:text-purple-400 transition-all text-sm">
                    + Adicionar requisito personalizado
                  </button>
                } @else {
                  <div class="space-y-3 animate-fade-in">
                    <p class="devmatch-card-title text-white text-sm font-semibold">Novo requisito</p>
                    <input type="text"
                           [(ngModel)]="newToggleLabel"
                           placeholder="Ex: Fala inglês, Conhece LGPD..."
                           maxlength="50"
                           class="devmatch-input w-full bg-gray-900/60 border border-gray-700/60 rounded-xl px-3 py-2 text-sm text-gray-200 placeholder-gray-600 outline-none focus:border-purple-500/60 transition-colors">
                    <div class="flex items-center gap-3">
                      <span class="text-xs text-gray-400">Elias tem esse requisito?</span>
                      <button (click)="newToggleEliasHas = !newToggleEliasHas"
                              class="text-xs px-3 py-1 rounded-full border transition-all"
                              [class.border-green-500]="newToggleEliasHas"
                              [class.text-green-400]="newToggleEliasHas"
                              [class.border-red-500]="!newToggleEliasHas"
                              [class.text-red-400]="!newToggleEliasHas">
                        {{ newToggleEliasHas ? '✓ Sim' : '✗ Não' }}
                      </button>
                    </div>
                    <div class="flex gap-2">
                      <button (click)="addCustomToggle()"
                              [disabled]="!newToggleLabel.trim()"
                              class="flex-1 py-2 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 hover:bg-purple-500/30 transition-all text-sm disabled:opacity-40 disabled:cursor-not-allowed">
                        Adicionar
                      </button>
                      <button (click)="cancelCustomToggleForm()"
                              class="px-4 py-2 rounded-xl border border-gray-700 text-gray-500 hover:text-gray-300 transition-all text-sm">
                        Cancelar
                      </button>
                    </div>
                  </div>
                }
              </div>
            </div>

          </div>

          <!-- RIGHT: Resultado -->
          <div class="lg:col-span-2 space-y-4 lg:sticky lg:top-24">

            <!-- Score principal -->
            <div class="devmatch-card bg-gray-800/50 rounded-2xl border border-gray-700/50 p-6 backdrop-blur-sm text-center relative overflow-hidden">
              <div class="absolute inset-0 pointer-events-none transition-all duration-700"
                   [style.background]="hasAny ? ('radial-gradient(circle at 50% 65%, ' + matchColor + '18 0%, transparent 65%)') : 'none'"></div>

              <p class="text-gray-500 text-xs uppercase tracking-widest font-mono mb-4">Compatibilidade</p>

              <!-- Anel circular SVG -->
              <div class="inline-flex items-center justify-center relative mb-4">
                <svg width="168" height="168" viewBox="0 0 168 168" class="-rotate-90">
                  <circle cx="84" cy="84" r="72" fill="none" stroke="#1e293b" stroke-width="10"/>
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
                  @if (hasAny) {
                    <div class="text-4xl font-bold text-white leading-none">{{ overallMatch }}</div>
                    <div class="text-gray-400 text-sm">%</div>
                  } @else {
                    <div class="text-3xl font-bold text-gray-600">?</div>
                  }
                </div>
              </div>

              <p class="font-semibold text-base transition-all duration-500" [style.color]="matchColor">{{ matchLabel }}</p>
              <p class="text-gray-500 text-xs mt-1">{{ matchSub }}</p>
            </div>

            <!-- Botão Ver Resultado -->
            @if (hasAny) {
              <button (click)="calculate()"
                      class="devmatch-calc-btn w-full py-4 rounded-2xl text-white font-bold text-lg tracking-wide transition-all duration-300">
                {{ calculated ? '🔄 Ver Resultado Novamente' : '🔍 Ver Resultado' }}
              </button>
            }

            <!-- Detalhamento por área -->
            @if (calculated && resultActiveAreas.length > 0) {
              <div class="devmatch-card bg-gray-800/50 rounded-2xl border border-gray-700/50 p-5 backdrop-blur-sm animate-fade-in">
                <p class="devmatch-card-title text-white text-sm font-semibold mb-4">Detalhamento por área</p>
                <div class="space-y-3">
                  @for (area of resultActiveAreas; track area.id) {
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

            <!-- Match suficiente: CTA -->
            @if (calculated && resultMatch >= 70) {
              <div class="devmatch-cta rounded-2xl border border-cyan-500/30 bg-cyan-500/5 p-5 text-center animate-fade-in">
                <p class="text-cyan-300 font-semibold text-sm mb-3">
                  {{ resultMatch >= 90 ? '🎉 Match perfeito encontrado!' : '🎯 Elias é uma ótima escolha!' }}
                </p>
                <a href="#contato"
                   class="devmatch-cta-btn inline-block px-6 py-2.5 bg-linear-to-r from-blue-500 to-cyan-500 text-white text-sm font-semibold rounded-full hover:scale-105 transition-transform">
                  Entrar em Contato
                </a>
              </div>
            }

            <!-- Match insuficiente: card surpresa -->
            @if (calculated && resultMatch < 70) {
              <div class="devmatch-surprise rounded-2xl p-5 animate-fade-in">
                <div class="text-center mb-3">
                  <span class="text-3xl">🌱</span>
                </div>
                <p class="text-amber-300 font-bold text-sm text-center mb-2">Espera — tem mais nessa história!</p>
                <p class="text-gray-300 text-xs leading-relaxed text-center mb-4">
                  Essas notas mostram <em>onde estou hoje</em>. Mas o que me define como dev
                  não é o que já sei: é a velocidade com que aprendo qualquer coisa nova.
                </p>
                <div class="space-y-2 mb-4">
                  <div class="flex items-start gap-2 text-xs text-gray-400">
                    <span class="text-amber-400 shrink-0">★</span>
                    <span>Aprendi Angular do zero e entreguei em produção em semanas</span>
                  </div>
                  <div class="flex items-start gap-2 text-xs text-gray-400">
                    <span class="text-amber-400 shrink-0">★</span>
                    <span>Integrei LLMs ao meu fluxo de trabalho sem nunca ter feito isso antes</span>
                  </div>
                  <div class="flex items-start gap-2 text-xs text-gray-400">
                    <span class="text-amber-400 shrink-0">★</span>
                    <span>Domínio em sistemas sem documentação — aprendi lendo código legado</span>
                  </div>
                </div>
                <p class="text-amber-400/70 text-xs text-center italic mb-4">"É melhor contratar quem aprende tudo<br>do que quem sabe só o que já viveu."</p>
                <div class="text-center">
                  <a href="#contato"
                     class="devmatch-surprise-btn inline-block px-6 py-2.5 text-white text-sm font-semibold rounded-full hover:scale-105 transition-transform">
                    Vamos conversar mesmo assim?
                  </a>
                </div>
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
      background: transparent;
      overflow: visible;
      padding: 8px 0;
      margin: -8px 0;
      box-sizing: content-box;
    }
    .devmatch-slider::-webkit-slider-runnable-track {
      height: 6px;
      border-radius: 9999px;
      background: #1e293b;
    }
    .devmatch-slider::-moz-range-track {
      height: 6px;
      border-radius: 9999px;
      background: #1e293b;
    }
    .devmatch-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      cursor: pointer;
      margin-top: -6px;
      box-shadow: 0 0 6px currentColor;
    }
    .devmatch-slider::-moz-range-thumb {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      border: none;
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

    .devmatch-calc-btn {
      background: linear-gradient(135deg, #3b82f6, #06b6d4);
      box-shadow: 0 4px 20px rgba(6,182,212,0.25);
    }
    .devmatch-calc-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 28px rgba(6,182,212,0.4);
    }
    .devmatch-calc-btn:active { transform: translateY(0); }

    .devmatch-surprise {
      background: linear-gradient(135deg, rgba(180,83,9,0.12), rgba(217,119,6,0.08));
      border: 1px solid rgba(251,191,36,0.25);
    }

    @keyframes devMatchFadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class DevMatchComponent implements OnInit {
  readonly circumference = 2 * Math.PI * 72;

  // ---- Áreas ----
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
  showCustomAreaForm = false;
  newAreaLabel = '';
  newAreaScore = 50;

  private readonly customColors = [
    '#38bdf8','#c084fc','#4ade80','#fb7185',
    '#a3e635','#fbbf24','#67e8f9','#f9a8d4',
    '#86efac','#fcd34d'
  ];

  // ---- Toggles ----
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
  customToggles: ToggleItem[] = [];
  showCustomToggleForm = false;
  newToggleLabel = '';
  newToggleEliasHas = false;

  // ---- Resultado congelado ----
  calculated = false;
  resultMatch = 0;
  resultActiveAreas: SkillArea[] = [];

  // ---- Persistência ----
  hasSavedState = false;

  ngOnInit(): void {
    this.loadState();
  }

  // ---- Computed ----
  get allAreas(): SkillArea[] {
    return [...this.areas, ...this.customAreas];
  }

  get allToggles(): ToggleItem[] {
    return [...this.toggles, ...this.customToggles];
  }

  // ---- Computed (live, para o anel) ----
  get hasAny(): boolean {
    return this.allAreas.some(a => a.importance > 0) || this.allToggles.some(t => t.active);
  }

  get overallMatch(): number {
    const hasSliders = this.allAreas.some(a => a.importance > 0);
    const hasToggles = this.allToggles.some(t => t.active);
    if (!hasSliders && !hasToggles) return 0;

    const totalImportance = this.allAreas.reduce((s, a) => s + a.importance, 0);
    const sliderMatch = totalImportance > 0
      ? Math.round(this.allAreas.reduce((s, a) => s + a.importance * a.eliasScore, 0) / totalImportance)
      : 0;
    const activeToggles = this.allToggles.filter(t => t.active);
    const toggleMatch = activeToggles.length > 0
      ? Math.round(activeToggles.filter(t => t.eliasHas).length / activeToggles.length * 100)
      : 100;

    if (hasSliders && hasToggles) return Math.round(sliderMatch * 0.65 + toggleMatch * 0.35);
    if (hasSliders) return sliderMatch;
    return toggleMatch;
  }

  importanceLabel(v: number): string {
    if (v === 0)  return 'ignorar';
    if (v <= 30)  return 'baixa';
    if (v <= 60)  return 'média';
    if (v <= 80)  return 'alta';
    return 'essencial';
  }

  // ---- Calcular (revela os cards de resultado) ----
  calculate(): void {
    this.resultMatch = this.overallMatch;
    this.resultActiveAreas = this.allAreas.filter(a => a.importance > 0);
    this.calculated = true;
    this.saveState();
  }

  // ---- Display (live) ----
  get matchColor(): string {
    const m = this.overallMatch;
    if (m === 0)  return '#334155';
    if (m < 50)   return '#f87171';
    if (m < 70)   return '#fbbf24';
    if (m < 85)   return '#22d3ee';
    return '#4ade80';
  }

  get matchLabel(): string {
    const m = this.overallMatch;
    if (m === 0)  return 'Configure acima ↑';
    if (m < 50)   return '🔍 Encaixe parcial';
    if (m < 70)   return '💡 Bom potencial';
    if (m < 85)   return '🎯 Ótimo alinhamento!';
    return '🚀 Match perfeito!';
  }

  get matchSub(): string {
    if (!this.hasAny) return 'Configure os sliders e requisitos';
    const m = this.overallMatch;
    if (m < 50)   return 'Elias cobre parte das suas necessidades';
    if (m < 70)   return 'Elias atende a maioria do que você procura';
    if (m < 85)   return 'Elias é uma excelente escolha para seu time';
    return 'Você encontrou o desenvolvedor certo!';
  }

  get dashOffset(): number {
    return this.circumference * (1 - this.overallMatch / 100);
  }

  // ---- Áreas (custom) ----
  addCustomArea(): void {
    if (!this.newAreaLabel.trim()) return;
    const color = this.customColors[this.customAreas.length % this.customColors.length];
    this.customAreas.push({
      id: 'ca_' + Date.now(),
      label: this.newAreaLabel.trim(),
      icon: '✦',
      eliasScore: this.newAreaScore,
      importance: 0,
      color,
      techs: [],
      custom: true,
    });
    this.cancelCustomAreaForm();
    this.saveState();
  }

  removeCustomArea(id: string): void {
    this.customAreas = this.customAreas.filter(a => a.id !== id);
    this.saveState();
  }

  cancelCustomAreaForm(): void {
    this.newAreaLabel = '';
    this.newAreaScore = 50;
    this.showCustomAreaForm = false;
  }

  // ---- Toggles (custom) ----
  addCustomToggle(): void {
    if (!this.newToggleLabel.trim()) return;
    this.customToggles.push({
      id: 'ct_' + Date.now(),
      label: this.newToggleLabel.trim(),
      icon: '📌',
      eliasHas: this.newToggleEliasHas,
      active: false,
      custom: true,
    });
    this.cancelCustomToggleForm();
    this.saveState();
  }

  removeCustomToggle(id: string): void {
    this.customToggles = this.customToggles.filter(t => t.id !== id);
    this.saveState();
  }

  cancelCustomToggleForm(): void {
    this.newToggleLabel = '';
    this.newToggleEliasHas = false;
    this.showCustomToggleForm = false;
  }

  // ---- Persistência ----
  saveState(): void {
    const state: SavedState = {
      areaImportances: Object.fromEntries(this.areas.map(a => [a.id, a.importance])),
      customAreas: this.customAreas,
      toggleActives: Object.fromEntries(this.toggles.map(t => [t.id, t.active])),
      customToggles: this.customToggles,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    this.hasSavedState = true;
  }

  private loadState(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const state: SavedState = JSON.parse(raw);
      for (const area of this.areas) {
        if (state.areaImportances?.[area.id] !== undefined) {
          area.importance = state.areaImportances[area.id];
        }
      }
      if (state.customAreas?.length) this.customAreas = state.customAreas;
      for (const toggle of this.toggles) {
        if (state.toggleActives?.[toggle.id] !== undefined) {
          toggle.active = state.toggleActives[toggle.id];
        }
      }
      if (state.customToggles?.length) this.customToggles = state.customToggles;
      this.hasSavedState = true;
    } catch { /* silently ignore corrupted data */ }
  }

  resetAll(): void {
    for (const area of this.areas) area.importance = 0;
    this.customAreas = [];
    for (const toggle of this.toggles) toggle.active = false;
    this.customToggles = [];
    this.calculated = false;
    this.resultMatch = 0;
    this.resultActiveAreas = [];
    this.hasSavedState = false;
    localStorage.removeItem(STORAGE_KEY);
  }
}
