import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AnalyticsService } from '../../core/services/analytics.service';
import { FirebaseService } from '../../core/services/firebase.service';
import { environment } from '../../../environments/environment';
import { GoogleGenAI } from '@google/genai';

const STORAGE_KEY = 'portfolio-devmatch-v2';

interface SavedState {
  areaImportances: Record<string, number>;
  areaTechs?: Record<string, string[]>;
  customAreas: SkillArea[];
  toggleActives: Record<string, boolean>;
  customToggles: ToggleItem[];
  calculated?: boolean;
  resultMatch?: number;
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

interface AiMatchResult {
  matchPercentage: number;
  summary: string;
  strengths: string[];
  gaps: string[];
  recommendation: string;
}

@Component({
  selector: 'app-dev-match',
  standalone: true,
  imports: [FormsModule],
  template: `
    <section id="dev-match" class="py-24 px-4 sm:px-8">
      <div class="max-w-6xl mx-auto">

        <div class="text-center mb-12">
          <h2 class="text-4xl font-bold bg-linear-to-r from-blue-400 to-cyan-400 text-transparent bg-clip-text inline-block devmatch-title">
            🧙 Monte seu Dev Ideal
          </h2>
          <p class="text-gray-400 mt-2 max-w-lg mx-auto text-sm leading-relaxed">
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
              <div class="areas-scroll-list max-h-[480px] overflow-y-auto overflow-x-hidden px-2.5 -mx-2.5 space-y-5">
                @for (area of allAreas; track area.id) {
                  <div class="group">
                    <div class="flex items-center justify-between mb-2">
                      <div class="flex items-center gap-2 min-w-0">
                        <span class="devmatch-area-name text-sm text-gray-300 truncate">{{ area.icon }} {{ area.label }}</span>
                        @if (area.custom) {
                          <span class="text-xs px-1.5 py-0.5 rounded bg-gray-700/60 text-gray-500 leading-none shrink-0">custom</span>
                        }
                        @if (area.importance > 0) {
                          <span class="devmatch-score-badge text-xs px-1.5 py-0.5 rounded-full leading-none shrink-0 transition-all duration-300"
                                [class.devmatch-score-green]="area.eliasScore >= 70"
                                [class.devmatch-score-orange]="area.eliasScore >= 40 && area.eliasScore < 70"
                                [class.devmatch-score-red]="area.eliasScore < 40"
                                [style.background]="area.eliasScore >= 70 ? '#16a34a22' : area.eliasScore >= 40 ? '#d9770622' : '#dc262622'"
                                [style.color]="area.eliasScore >= 70 ? '#4ade80' : area.eliasScore >= 40 ? '#fb923c' : '#f87171'">
                            {{ area.eliasScore >= 70 ? '✓' : area.eliasScore >= 40 ? '~' : '✗' }} {{ area.eliasScore }}%
                          </span>
                        }
                      </div>
                      <div class="flex items-center gap-2 shrink-0">
                        <span class="text-xs font-mono px-2 py-0.5 rounded-full transition-all duration-300"
                              [style.background]="area.importance > 0 ? area.color : 'transparent'"
                              [style.color]="area.importance > 0 ? '#ffffff' : '#6b7280'">
                          {{ importanceLabel(area.importance) }}
                        </span>
                        @if (area.custom) {
                          <button (click)="removeCustomArea(area.id)"
                                  class="devmatch-remove-btn opacity-0 group-hover:opacity-100">×</button>
                        }
                      </div>
                    </div>
                    <input type="range" min="0" max="100" step="10"
                           [(ngModel)]="area.importance"
                           (change)="saveState()"
                           class="devmatch-slider w-full outline-none cursor-pointer"
                           [style.accent-color]="area.color">
                    <div class="flex flex-wrap gap-1 mt-2 items-center min-h-[22px]">
                      @for (tech of area.techs; track tech) {
                        <span class="devmatch-tech-tag text-xs px-2 py-0.5 rounded-full bg-gray-700/50 text-gray-400 border border-gray-600/30 flex items-center gap-1">
                          {{ tech }}
                          <button (click)="removeTech(area, tech)"
                                  class="devmatch-remove-btn">×</button>
                        </span>
                      }
                      @if (editingTagsAreaId === area.id) {
                        <input type="text"
                               [(ngModel)]="newTagInput"
                               (keydown.enter)="addTechToArea(area)"
                               (keydown.escape)="editingTagsAreaId = null"
                               placeholder="nova tag..."
                               maxlength="25"
                               autofocus
                               class="devmatch-tag-input text-xs px-2 py-0.5 rounded-full bg-gray-900/80 border border-blue-500/50 text-gray-200 outline-none w-24">
                        <button (click)="addTechToArea(area)"
                                class="text-blue-400 hover:text-blue-300 text-xs transition-colors px-1">✓</button>
                        <button (click)="editingTagsAreaId = null"
                                class="text-gray-600 hover:text-gray-400 text-xs transition-colors px-1">✕</button>
                      } @else {
                        <button (click)="startAddTag(area.id)"
                                class="text-xs px-1.5 py-0.5 rounded-full border border-dashed border-gray-700/50 text-gray-600 hover:border-blue-500/40 hover:text-blue-400 transition-all leading-none">
                          +
                        </button>
                      }
                    </div>
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
                    <div>
                      <p class="text-xs text-gray-400 mb-2">Tags <span class="text-gray-600">(opcional — pressione Enter para adicionar)</span></p>
                      <div class="flex flex-wrap gap-1 items-center">
                        @for (tech of newAreaTechs; track $index) {
                          <span class="text-xs px-2 py-0.5 rounded-full bg-gray-700/50 text-gray-400 border border-gray-600/30 flex items-center gap-1">
                            {{ tech }}
                            <button (click)="removeNewAreaTech($index)"
                                    class="devmatch-remove-btn">×</button>
                          </span>
                        }
                        <input type="text"
                               [(ngModel)]="newAreaTechInput"
                               (keydown.enter)="addNewAreaTech()"
                               placeholder="+ tag"
                               maxlength="25"
                               class="devmatch-tag-input text-xs px-2 py-0.5 rounded-full bg-gray-900/60 border border-dashed border-gray-700/60 text-gray-300 outline-none focus:border-blue-500/40 transition-colors w-24 placeholder-gray-600">
                      </div>
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

            <!-- Botões Ver Resultado + Limpar -->
            @if (hasAny) {
              <div class="devmatch-actions flex flex-col gap-3">
                <button (click)="calculate()"
                        class="devmatch-calc-btn w-full py-3.5 rounded-2xl font-bold text-base tracking-wide transition-all duration-300 flex items-center justify-center gap-2">
                  @if (calculated) {
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Recalcular
                  } @else {
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Ver Resultado
                  }
                </button>
                <button (click)="resetAll()"
                        class="devmatch-reset-btn w-full py-3 rounded-2xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Limpar
                </button>
              </div>
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
                <p class="devmatch-surprise-title text-amber-300 font-bold text-sm text-center mb-2">Espera — tem mais nessa história!</p>
                <p class="devmatch-surprise-body text-gray-300 text-xs leading-relaxed text-center mb-4">
                  Essas notas mostram <em>onde estou hoje</em>. Mas o que me define como dev
                  não é o que já sei: é a velocidade com que aprendo qualquer coisa nova.
                </p>
                <div class="space-y-2 mb-4">
                  <div class="flex items-start gap-2 text-xs devmatch-surprise-item">
                    <span class="text-amber-400 shrink-0">★</span>
                    <span>Aprendi Angular do zero e entreguei em produção em semanas</span>
                  </div>
                  <div class="flex items-start gap-2 text-xs devmatch-surprise-item">
                    <span class="text-amber-400 shrink-0">★</span>
                    <span>Integrei LLMs ao meu fluxo de trabalho sem nunca ter feito isso antes</span>
                  </div>
                  <div class="flex items-start gap-2 text-xs devmatch-surprise-item">
                    <span class="text-amber-400 shrink-0">★</span>
                    <span>Domínio em sistemas sem documentação — aprendi lendo código legado</span>
                  </div>
                </div>
                <p class="devmatch-surprise-quote text-sm text-center italic mb-4">"É melhor contratar quem aprende tudo<br>do que quem sabe só o que já viveu."</p>
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

        <!-- CTA IA Match -->
        <div class="mt-12 text-center">
          <div class="inline-block max-w-xl mx-auto bg-gray-800/50 rounded-2xl border border-gray-700/50 p-6 backdrop-blur-sm">
            <div class="text-3xl mb-3">🤖</div>
            <p class="text-gray-300 text-sm mb-1">Tá com preguiça de preencher tudo isso?</p>
            <p class="text-gray-500 text-xs mb-5">Cole a descrição da vaga e deixe a <span class="text-cyan-400 font-semibold">IA</span> calcular o match por você.</p>
            <button (click)="openAiModal()"
                    class="ai-match-btn px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 mx-auto">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zm8.446-7.189L18 9.75l-.259-1.035a3.375 3.375 0 00-2.456-2.456L14.25 6l1.035-.259a3.375 3.375 0 002.456-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"/>
              </svg>
              Análise por IA
            </button>
          </div>
        </div>

      </div>
    </section>

    <!-- Modal IA -->
    @if (aiModalOpen) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4" (click)="closeAiModal()">
        <div class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
        <div class="relative w-full max-w-lg bg-gray-900 border border-gray-700/60 rounded-2xl shadow-2xl overflow-hidden animate-fade-in max-h-[90vh] flex flex-col"
             (click)="$event.stopPropagation()">

          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-800 shrink-0">
            <div class="flex items-center gap-2">
              <span class="text-lg">🤖</span>
              <h3 class="text-white font-semibold text-sm">Match por IA</h3>
            </div>
            <button (click)="closeAiModal()"
                    class="text-gray-600 hover:text-gray-300 transition-colors text-xl leading-none p-1">✕</button>
          </div>

          <!-- Conteúdo scrollável -->
          <div class="overflow-y-auto flex-1 px-6 py-5">
            @if (!aiLoading && !aiResult) {
              <!-- Input -->
              <div class="space-y-4">
                <p class="text-gray-400 text-xs leading-relaxed">
                  Cole a descrição da vaga, requisitos ou qualquer texto sobre o que procura.
                  A IA vai analisar e calcular o match com o perfil do Elias.
                </p>
                <textarea
                  [(ngModel)]="aiJobDescription"
                  rows="8"
                  placeholder="Ex: Procuramos dev fullstack com experiência em Laravel, Vue.js, PostgreSQL, Docker. Desejável conhecimento em BI/Power BI e metodologias ágeis..."
                  class="w-full bg-gray-800/60 border border-gray-700/60 rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-600 outline-none focus:border-cyan-500/60 transition-colors resize-none"
                  maxlength="5000"
                ></textarea>
                <div class="flex justify-between items-center">
                  <span class="text-xs text-gray-600 font-mono">{{ aiJobDescription.length }}/5000</span>
                  <button (click)="analyzeWithAi()"
                          [disabled]="aiJobDescription.trim().length < 20"
                          class="ai-match-btn px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zm8.446-7.189L18 9.75l-.259-1.035a3.375 3.375 0 00-2.456-2.456L14.25 6l1.035-.259a3.375 3.375 0 002.456-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"/>
                    </svg>
                    Analisar com IA
                  </button>
                </div>
              </div>
            }

            @if (aiLoading) {
              <!-- Loading -->
              <div class="flex flex-col items-center justify-center py-12 space-y-4">
                <div class="ai-loading-ring"></div>
                <p class="text-cyan-300 text-sm font-semibold animate-pulse">IA analisando a vaga...</p>
                <p class="text-gray-600 text-xs">Isso leva alguns segundos</p>
              </div>
            }

            @if (aiResult) {
              <!-- Resultado -->
              <div class="space-y-5 animate-fade-in">
                <!-- Score -->
                <div class="text-center">
                  <div class="inline-flex items-center justify-center w-24 h-24 rounded-full border-4 mb-3"
                       [class.border-green-500]="aiResult.matchPercentage >= 70"
                       [class.border-yellow-500]="aiResult.matchPercentage >= 50 && aiResult.matchPercentage < 70"
                       [class.border-red-500]="aiResult.matchPercentage < 50"
                       [style.box-shadow]="'0 0 30px ' + (aiResult.matchPercentage >= 70 ? 'rgba(34,197,94,0.2)' : aiResult.matchPercentage >= 50 ? 'rgba(234,179,8,0.2)' : 'rgba(239,68,68,0.2)')">
                    <span class="text-3xl font-bold text-white">{{ aiResult.matchPercentage }}%</span>
                  </div>
                  <p class="text-sm font-semibold"
                     [class.text-green-400]="aiResult.matchPercentage >= 70"
                     [class.text-yellow-400]="aiResult.matchPercentage >= 50 && aiResult.matchPercentage < 70"
                     [class.text-red-400]="aiResult.matchPercentage < 50">
                    {{ aiResult.matchPercentage >= 85 ? '🚀 Match excelente!' : aiResult.matchPercentage >= 70 ? '🎯 Ótimo match!' : aiResult.matchPercentage >= 50 ? '💡 Match parcial' : '🔍 Match baixo' }}
                  </p>
                </div>

                <!-- Resumo -->
                <div class="bg-gray-800/50 rounded-xl p-4 border border-gray-700/40">
                  <p class="text-gray-300 text-xs leading-relaxed">{{ aiResult.summary }}</p>
                </div>

                <!-- Pontos fortes -->
                @if (aiResult.strengths.length > 0) {
                  <div>
                    <h4 class="text-xs font-semibold text-green-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <span>✓</span> Pontos fortes
                    </h4>
                    <div class="space-y-1.5">
                      @for (s of aiResult.strengths; track s) {
                        <div class="flex items-start gap-2 text-xs">
                          <span class="text-green-500 shrink-0 mt-0.5">●</span>
                          <span class="text-gray-300">{{ s }}</span>
                        </div>
                      }
                    </div>
                  </div>
                }

                <!-- Lacunas -->
                @if (aiResult.gaps.length > 0) {
                  <div>
                    <h4 class="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <span>△</span> Pontos de atenção
                    </h4>
                    <div class="space-y-1.5">
                      @for (g of aiResult.gaps; track g) {
                        <div class="flex items-start gap-2 text-xs">
                          <span class="text-amber-500 shrink-0 mt-0.5">●</span>
                          <span class="text-gray-300">{{ g }}</span>
                        </div>
                      }
                    </div>
                  </div>
                }

                <!-- Recomendação -->
                <div class="bg-cyan-500/8 rounded-xl p-4 border border-cyan-500/20">
                  <h4 class="text-xs font-semibold text-cyan-300 uppercase tracking-wider mb-2">💡 Recomendação</h4>
                  <p class="text-gray-300 text-xs leading-relaxed">{{ aiResult.recommendation }}</p>
                </div>

                <!-- Ações -->
                <div class="flex gap-3 pt-2">
                  <button (click)="resetAiModal()"
                          class="flex-1 py-2.5 rounded-xl border border-gray-700 text-gray-400 hover:text-gray-200 hover:border-gray-600 transition-all text-sm">
                    Nova análise
                  </button>
                  <a href="#contato"
                     (click)="closeAiModal()"
                     class="flex-1 py-2.5 rounded-xl bg-linear-to-r from-blue-500 to-cyan-500 text-white text-sm font-semibold text-center hover:scale-[1.02] transition-transform">
                    Entrar em contato
                  </a>
                </div>
              </div>
            }

            @if (aiError) {
              <div class="text-center py-8 space-y-3">
                <span class="text-3xl">⚠️</span>
                <p class="text-red-300 text-sm">{{ aiError }}</p>
                <button (click)="resetAiModal()"
                        class="px-4 py-2 rounded-xl border border-gray-700 text-gray-400 hover:text-gray-200 transition-all text-sm">
                  Tentar novamente
                </button>
              </div>
            }
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .devmatch-slider {
      -webkit-appearance: none;
      appearance: none;
      height: 6px;
      background: transparent;
      overflow: visible;
      padding: 8px 10px;
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
      width: 20px;
      height: 20px;
      border-radius: 50%;
      cursor: pointer;
      margin-top: -7px;
      box-shadow: 0 0 8px currentColor;
    }
    .devmatch-slider::-moz-range-thumb {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: none;
      cursor: pointer;
      box-shadow: 0 0 8px currentColor;
    }

    .devmatch-toggle { cursor: pointer; }

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
    .devmatch-tag-input { transition: border-color 0.2s; }
    .devmatch-tag-input:focus { box-shadow: 0 0 0 2px rgba(96,165,250,0.15); }

    .devmatch-remove-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: #dc2626;
      color: #ffffff;
      font-size: 11px;
      line-height: 0;
      padding: 0;
      padding-bottom: 1px;
      border: none;
      cursor: pointer;
      transition: background 0.15s, transform 0.15s;
      flex-shrink: 0;
    }
    .devmatch-remove-btn:hover {
      background: #b91c1c;
      transform: scale(1.2);
    }

    .devmatch-calc-btn {
      background: linear-gradient(135deg, #3b82f6, #06b6d4);
      box-shadow: 0 4px 20px rgba(6,182,212,0.25);
      cursor: pointer;
      color: #ffffff;
    }
    .devmatch-calc-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 28px rgba(6,182,212,0.4);
    }
    .devmatch-calc-btn:active { transform: translateY(0); }

    .devmatch-reset-btn {
      background: #dc2626;
      border: 1px solid #b91c1c;
      color: #ffffff;
      cursor: pointer;
    }
    .devmatch-reset-btn:hover {
      background: #b91c1c;
      border-color: #991b1b;
      transform: translateY(-2px);
    }
    .devmatch-reset-btn:active { transform: translateY(0); }

    /* Desktop: botões lado a lado */
    @media (min-width: 1024px) {
      .devmatch-actions {
        flex-direction: row;
      }
      .devmatch-actions .devmatch-calc-btn {
        flex: 1;
      }
      .devmatch-actions .devmatch-reset-btn {
        width: auto;
        padding-left: 1rem;
        padding-right: 1rem;
      }
    }

    /* Mobile improvements */
    @media (max-width: 639px) {
      .devmatch-title {
        font-size: 1.75rem !important;
      }
      .devmatch-card {
        padding: 1.25rem;
        border-radius: 1rem;
      }
      .devmatch-card-title {
        font-size: 0.9rem;
      }
      .devmatch-area-name {
        font-size: 0.8rem;
      }
      .devmatch-score-badge {
        font-size: 0.65rem;
      }
      .devmatch-tech-tag {
        font-size: 0.65rem;
        padding: 0.15rem 0.5rem;
      }
      .devmatch-toggle {
        padding: 0.65rem 0.85rem;
        font-size: 0.8rem;
      }
      .devmatch-slider::-webkit-slider-thumb {
        width: 24px;
        height: 24px;
        margin-top: -9px;
      }
      .devmatch-slider::-moz-range-thumb {
        width: 24px;
        height: 24px;
      }
      .devmatch-slider {
        padding: 12px 13px;
      }
    }

    .devmatch-surprise {
      background: linear-gradient(135deg, rgba(180,83,9,0.12), rgba(217,119,6,0.08));
      border: 1px solid rgba(251,191,36,0.25);
    }
    .devmatch-surprise-quote { color: rgba(251,191,36,0.7); }

    @keyframes devMatchFadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .ai-match-btn {
      background: linear-gradient(135deg, #3b82f6, #06b6d4);
      box-shadow: 0 4px 20px rgba(6,182,212,0.25);
      cursor: pointer;
      color: #ffffff;
    }
    .ai-match-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 28px rgba(6,182,212,0.4);
    }
    .ai-match-btn:active:not(:disabled) { transform: translateY(0); }

    .ai-loading-ring {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      border: 3px solid rgba(6,182,212,0.15);
      border-top-color: #06b6d4;
      animation: aiSpin 0.8s linear infinite;
    }
    @keyframes aiSpin {
      to { transform: rotate(360deg); }
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
  newAreaTechs: string[] = [];
  newAreaTechInput = '';

  // ---- Tag editing ----
  editingTagsAreaId: string | null = null;
  newTagInput = '';

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

  private analytics = inject(AnalyticsService);
  private cdr = inject(ChangeDetectorRef);
  private firebaseService = inject(FirebaseService);

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
    this.analytics.updateMatchScore(
      this.resultMatch,
      this.resultActiveAreas.map(a => a.label),
    );
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
      techs: [...this.newAreaTechs],
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
    this.newAreaTechs = [];
    this.newAreaTechInput = '';
    this.showCustomAreaForm = false;
  }

  startAddTag(areaId: string): void {
    this.editingTagsAreaId = areaId;
    this.newTagInput = '';
  }

  addTechToArea(area: SkillArea): void {
    const tag = this.newTagInput.trim();
    if (tag && !area.techs.includes(tag)) {
      area.techs.push(tag);
      this.saveState();
    }
    this.newTagInput = '';
    this.editingTagsAreaId = null;
  }

  removeTech(area: SkillArea, tech: string): void {
    area.techs = area.techs.filter(t => t !== tech);
    this.saveState();
  }

  addNewAreaTech(): void {
    const tag = this.newAreaTechInput.trim();
    if (tag && !this.newAreaTechs.includes(tag)) {
      this.newAreaTechs.push(tag);
    }
    this.newAreaTechInput = '';
  }

  removeNewAreaTech(index: number): void {
    this.newAreaTechs.splice(index, 1);
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
      areaTechs: Object.fromEntries(this.areas.map(a => [a.id, a.techs])),
      customAreas: this.customAreas,
      toggleActives: Object.fromEntries(this.toggles.map(t => [t.id, t.active])),
      customToggles: this.customToggles,
      calculated: this.calculated,
      resultMatch: this.resultMatch,
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
        if (state.areaTechs?.[area.id] !== undefined) {
          area.techs = state.areaTechs[area.id];
        }
      }
      if (state.customAreas?.length) this.customAreas = state.customAreas;
      for (const toggle of this.toggles) {
        if (state.toggleActives?.[toggle.id] !== undefined) {
          toggle.active = state.toggleActives[toggle.id];
        }
      }
      if (state.customToggles?.length) this.customToggles = state.customToggles;
      if (state.calculated) {
        this.calculated = true;
        this.resultMatch = state.resultMatch ?? 0;
        this.resultActiveAreas = this.allAreas.filter(a => a.importance > 0);
      }
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

  // ---- AI Match (Gemini) ----
  aiModalOpen = false;
  aiJobDescription = '';
  aiLoading = false;
  aiResult: AiMatchResult | null = null;
  aiError: string | null = null;

  private readonly AI_CACHE_KEY = 'portfolio-ai-match-cache';
  private readonly AI_CACHE_MAX = 20;

  private getCacheKey(text: string): string {
    // Normaliza: lowercase, remove espaços extras
    return text.toLowerCase().replace(/\s+/g, ' ').trim();
  }

  private loadCache(): Record<string, AiMatchResult> {
    try {
      return JSON.parse(localStorage.getItem(this.AI_CACHE_KEY) ?? '{}');
    } catch { return {}; }
  }

  private saveToCache(key: string, result: AiMatchResult): void {
    const cache = this.loadCache();
    const entries = Object.entries(cache);
    // Limita tamanho: remove a entrada mais antiga se passou do limite
    if (entries.length >= this.AI_CACHE_MAX) {
      delete cache[entries[0][0]];
    }
    cache[key] = result;
    localStorage.setItem(this.AI_CACHE_KEY, JSON.stringify(cache));
  }

  openAiModal(): void {
    this.aiModalOpen = true;
  }

  closeAiModal(): void {
    this.aiModalOpen = false;
  }

  resetAiModal(): void {
    this.aiResult = null;
    this.aiError = null;
    this.aiLoading = false;
  }

  async analyzeWithAi(): Promise<void> {
    if (this.aiJobDescription.trim().length < 20) return;

    const cacheKey = this.getCacheKey(this.aiJobDescription);
    const cache = this.loadCache();

    // Cache hit — sem chamar a API
    if (cache[cacheKey]) {
      this.aiResult = cache[cacheKey];
      return;
    }

    this.aiLoading = true;
    this.aiError = null;
    this.aiResult = null;

    const eliasProfile = this.buildEliasProfile();
    const prompt = this.buildPrompt(eliasProfile, this.aiJobDescription.trim());

    const ai = new GoogleGenAI({ apiKey: environment.geminiApiKey });
    const models = ['gemini-2.5-flash', 'gemini-2.5-flash-lite'];
    let lastError: Error | null = null;

    for (const model of models) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            temperature: 0.7,
            responseMimeType: 'application/json',
          },
        });

        const text = response.text;
        if (!text) throw new Error('Resposta vazia da IA');

        const parsed = JSON.parse(text) as AiMatchResult;
        if (typeof parsed.matchPercentage !== 'number' || !Array.isArray(parsed.strengths)) {
          throw new Error('Formato de resposta inválido');
        }

        parsed.matchPercentage = Math.max(0, Math.min(100, Math.round(parsed.matchPercentage)));
        this.aiResult = parsed;
        this.aiLoading = false;
        this.cdr.detectChanges();
        this.saveToCache(cacheKey, parsed);

        // Salvar no Firestore
        this.firebaseService.saveAiMatch({
          jobDescription: this.aiJobDescription.trim(),
          aiResponse: text,
          matchPercentage: parsed.matchPercentage,
        }).catch(() => { /* silently ignore save errors */ });

        this.analytics.updateMatchScore(
          parsed.matchPercentage,
          ['IA Match'],
        );
        lastError = null;
        break;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : '';
        if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED')) {
          lastError = new Error('Limite de requisições atingido. Aguarde alguns segundos e tente novamente.');
          await new Promise(r => setTimeout(r, 2000));
          continue;
        }
        lastError = err instanceof Error ? err : new Error('Erro ao analisar com IA. Tente novamente.');
        break;
      }
    }

    if (lastError) {
      this.aiError = lastError.message;
      this.aiLoading = false;
      this.cdr.detectChanges();
    }
  }

  private buildEliasProfile(): string {
    const areas = this.areas.map(a => `- ${a.label} (${a.eliasScore}%): ${a.techs.join(', ')}`).join('\n');
    const reqs = this.toggles.map(t => `- ${t.label}: ${t.eliasHas ? 'SIM' : 'NÃO'}`).join('\n');
    return `PERFIL DE ELIAS (Desenvolvedor Fullstack Sênior, 8+ anos de experiência):

Áreas de atuação e nível de proficiência:
${areas}

Requisitos e experiências:
${reqs}

Resumo: Desenvolvedor fullstack sênior com forte domínio em Backend (PHP/Laravel, Python, Node.js), Frontend (Vue.js, React, Angular), Banco de Dados (PostgreSQL, MySQL, SQL Server), BI/Analytics (Power BI, DAX, Pentaho), Cloud/DevOps (Docker, CI/CD, Azure, AWS) e integração com IA (OpenAI, Gemini). Experiência com sistemas multi-tenant, SaaS, migração de legados, mentoria de devs juniores e metodologias ágeis.`;
  }

  private buildPrompt(profile: string, jobDescription: string): string {
    return `Você é um especialista em recrutamento tech. Analise a compatibilidade entre o perfil do candidato e a descrição da vaga.

${profile}

---

DESCRIÇÃO DA VAGA / REQUISITOS DO RECRUTADOR:
${jobDescription}

---

INSTRUÇÕES:
1. Compare cada requisito da vaga com as habilidades do Elias
2. Calcule uma porcentagem de match realista (0-100%)
3. Considere tanto habilidades técnicas quanto soft skills mencionadas
4. Seja justo: se a vaga pede algo que Elias não domina, reduza o match proporcionalmente
5. Se a vaga é vaga/genérica, considere o perfil geral

Responda EXCLUSIVAMENTE em JSON válido (sem markdown, sem backticks) no formato:
{
  "matchPercentage": <número de 0 a 100>,
  "summary": "<resumo de 2-3 frases da análise>",
  "strengths": ["<ponto forte 1>", "<ponto forte 2>", ...],
  "gaps": ["<lacuna 1>", "<lacuna 2>", ...],
  "recommendation": "<recomendação final em 1-2 frases>"
}

Se não houver lacunas, retorne "gaps" como array vazio.
Responda em português brasileiro.`;
  }
}
