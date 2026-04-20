import { Component, OnInit, inject, signal, computed, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AnalyticsService } from '../../core/services/analytics.service';
import { FirebaseService } from '../../core/services/firebase.service';
import { environment } from '../../../environments/environment';
import { GoogleGenAI } from '@google/genai';

interface SkillEntry {
  name: string;
  matched: boolean;
  score: number;
  weight: number;
}

interface AiMatchResult {
  matchPercentage: number;
  summary: string;
  strengths: string[];
  gaps: string[];
  recommendation: string;
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
        Veja se me Encaixo no Seu Time
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

          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-800 shrink-0 flex-wrap gap-y-3">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-sm">🧙</div>
              <div>
                <h2 class="text-white font-bold text-base leading-none flex items-center gap-1.5">
                  Veja se me Encaixo no Seu Time
                  <span class="match-info-wrapper relative inline-flex">
                    <button (click)="showMatchInfo.set(!showMatchInfo())"
                            (mouseleave)="showMatchInfo.set(false)"
                            class="w-4 h-4 rounded-full border border-gray-500 text-gray-400 hover:border-cyan-400 hover:text-cyan-400 transition-colors flex items-center justify-center text-[10px] font-bold leading-none cursor-pointer shrink-0">
                      i
                    </button>
                    @if (showMatchInfo()) {
                      <div class="match-tooltip absolute top-full left-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded-xl p-3 text-left shadow-xl z-50 text-gray-300 text-[11px] leading-relaxed">
                        <p class="font-semibold text-white mb-1.5">📐 Como o % é calculado</p>
                        <p class="mb-2">Cada tecnologia é comparada com o perfil de Elias e recebe uma nota de <span class="text-cyan-400 font-semibold">0–100%</span>. Skills desconhecidas recebem <span class="text-red-400 font-semibold">0%</span>.</p>
                        <p class="mb-1.5">Sem pesos, o match é a <span class="text-cyan-400 font-semibold">média simples</span>:</p>
                        <p class="text-gray-500 mb-2 pl-2 border-l border-gray-700">Laravel (95%) + Docker (80%) + Desconhecida (0%) → <span class="text-gray-300">(95+80+0) ÷ 3 = <strong class="text-cyan-400">58%</strong></span></p>
                        <p class="mb-1.5">Com <span class="text-amber-400 font-semibold">pesos</span>, cada nota é multiplicada antes de tirar a média ponderada:</p>
                        <p class="text-gray-500 pl-2 border-l border-gray-700">Laravel (95%, <span class="text-amber-400">×3</span>) + Docker (80%, ×1) + Desconhecida (0%, ×1) → <span class="text-gray-300">(95×3 + 80×1 + 0×1) ÷ (3+1+1) = <strong class="text-cyan-400">57%</strong></span></p>
                        <p class="text-gray-600 mt-2">Use pesos de 1 a 10. Quanto maior o peso, mais aquela skill influencia o resultado final.</p>
                      </div>
                    }
                  </span>
                </h2>
                <p class="text-gray-500 text-xs mt-0.5">Descubra o match com Elias</p>
              </div>
            </div>
            <div class="flex items-center gap-1 bg-gray-800/70 rounded-xl p-1">
              <button (click)="activeTab.set('tags')"
                      class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
                      [class.tab-active]="activeTab() === 'tags'"
                      [class.tab-inactive]="activeTab() !== 'tags'">
                🏷️ Por tags
              </button>
              <button (click)="activeTab.set('ai')"
                      class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
                      [class.tab-active]="activeTab() === 'ai'"
                      [class.tab-inactive]="activeTab() !== 'ai'">
                🤖 Por IA
              </button>
            </div>
            <button (click)="closeModal()"
                    class="w-8 h-8 flex items-center justify-center rounded-xl text-gray-600 hover:text-gray-300 hover:bg-gray-800 transition-all text-lg leading-none">
              ✕
            </button>
          </div>

          <div class="flex flex-col lg:flex-row flex-1 overflow-hidden">

            <div class="lg:w-1/2 flex flex-col p-6 border-b lg:border-b-0 lg:border-r border-gray-800 overflow-y-auto">

              @if (activeTab() === 'tags') {
                <p class="text-gray-400 text-sm mb-4 leading-relaxed">
                  Digite as tecnologias, frameworks ou habilidades que a vaga exige. Pressione
                <kbd class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-mono border border-gray-700 text-gray-400">Enter</kbd>
                ou vírgula para adicionar.
              </p>

              <div class="flex gap-2 mb-4 items-end">
                <input
                  type="text"
                  [value]="currentInput()"
                  (input)="onRawInput($event)"
                  (keydown)="onKeydown($event)"
                  placeholder="Ex: Laravel, Vue.js..."
                  maxlength="40"
                  class="flex-1 min-w-0 bg-gray-800/70 border border-gray-700/60 rounded-xl px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 outline-none focus:border-blue-500/60 transition-colors"
                />
                <div class="flex flex-col gap-0.5 shrink-0">
                  <label class="text-[10px] text-gray-600 text-center">Peso</label>
                  <input
                    type="number"
                    [value]="currentWeight()"
                    (input)="onWeightInput($event)"
                    (keydown.enter)="addCurrentInput()"
                    min="1" max="10"
                    class="w-14 bg-gray-800/70 border border-gray-700/60 rounded-xl px-2 py-2.5 text-sm text-gray-200 outline-none focus:border-blue-500/60 transition-colors text-center"
                  />
                </div>
                <button (click)="addCurrentInput()"
                        [disabled]="!currentInput().trim()"
                        class="shrink-0 w-9 h-9 rounded-xl bg-blue-600/20 hover:bg-blue-600/40 disabled:opacity-30 disabled:cursor-not-allowed text-blue-400 hover:text-blue-300 transition-colors text-sm font-bold flex items-center justify-center">
                  ↵
                </button>
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
                      @if (skill.weight > 1) {
                        <span class="text-[9px] font-bold opacity-70">×{{ skill.weight }}</span>
                      }
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
                      <a href="#contato" (click)="onContactClick('success'); closeModal()"
                         class="inline-block px-5 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-bold rounded-full hover:scale-105 transition-transform">
                        Entrar em contato
                      </a>
                    </div>
                  }
                  @if (matchPercent() < 60 && matchPercent() > 0) {
                    <div class="mt-4 p-3 rounded-xl bg-amber-500/8 border border-amber-500/20 text-center">
                      <p class="text-amber-300 text-xs font-semibold mb-1">🌱 Elias aprende tudo rapidamente</p>
                      <p class="text-gray-500 text-xs mb-2">O que não domino hoje, domino em semanas.</p>
                      <a href="#contato" (click)="onContactClick('surprise'); closeModal()"
                         class="inline-block px-5 py-2 border border-amber-500/40 text-amber-300 text-xs font-bold rounded-full hover:bg-amber-500/10 transition-all">
                        Vamos conversar mesmo assim?
                      </a>
                    </div>
                  }
                </div>
              }
              }

              @if (activeTab() === 'ai') {
                <div class="flex flex-col flex-1">
                  @if (!aiLoading() && !aiResult()) {
                    <p class="text-gray-400 text-sm mb-4 leading-relaxed">
                      Cole a descrição da vaga e a <span class="text-cyan-400 font-semibold">IA</span> analisa o match com o perfil de Elias.
                    </p>
                    <textarea
                      [(ngModel)]="aiJobDescription"
                      rows="8"
                      placeholder="Ex: Procuramos dev fullstack com experiência em Laravel, Vue.js, PostgreSQL, Docker..."
                      class="w-full bg-gray-800/60 border border-gray-700/60 rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-600 outline-none focus:border-cyan-500/60 transition-colors resize-none"
                      maxlength="5000"
                    ></textarea>
                    <div class="flex justify-between items-center mt-2">
                      <span class="text-xs text-gray-600 font-mono">{{ aiJobDescription.length }}/5000</span>
                      <button (click)="analyzeWithAi()"
                              [disabled]="aiJobDescription.trim().length < 20"
                              class="ai-analyze-btn px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zm8.446-7.189L18 9.75l-.259-1.035a3.375 3.375 0 00-2.456-2.456L14.25 6l1.035-.259a3.375 3.375 0 002.456-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"/>
                        </svg>
                        Analisar com IA
                      </button>
                    </div>
                  }

                  @if (aiLoading()) {
                    <div class="flex flex-col items-center justify-center py-12 space-y-4">
                      <div class="ai-loading-ring"></div>
                      <p class="text-cyan-300 text-sm font-semibold animate-pulse">IA analisando a vaga...</p>
                      <p class="text-gray-600 text-xs">Isso leva alguns segundos</p>
                    </div>
                  }

                  @if (aiResult()) {
                    <div class="space-y-4 animate-fade-in">
                      <div class="text-center">
                        <div class="inline-flex items-center justify-center w-20 h-20 rounded-full border-3 mb-2"
                             [class.border-green-500]="aiResult()!.matchPercentage >= 70"
                             [class.border-yellow-500]="aiResult()!.matchPercentage >= 50 && aiResult()!.matchPercentage < 70"
                             [class.border-red-500]="aiResult()!.matchPercentage < 50">
                          <span class="text-2xl font-bold text-white">{{ aiResult()!.matchPercentage }}%</span>
                        </div>
                        <p class="text-xs font-semibold"
                           [class.text-green-400]="aiResult()!.matchPercentage >= 70"
                           [class.text-yellow-400]="aiResult()!.matchPercentage >= 50 && aiResult()!.matchPercentage < 70"
                           [class.text-red-400]="aiResult()!.matchPercentage < 50">
                          {{ aiResult()!.matchPercentage >= 85 ? '🚀 Match excelente!' : aiResult()!.matchPercentage >= 70 ? '🎯 Ótimo match!' : aiResult()!.matchPercentage >= 50 ? '💡 Match parcial' : '🔍 Match baixo' }}
                        </p>
                      </div>
                      <div class="bg-gray-800/50 rounded-xl p-3 border border-gray-700/40">
                        <p class="text-gray-300 text-xs leading-relaxed">{{ aiResult()!.summary }}</p>
                      </div>
                      @if (aiResult()!.strengths.length > 0) {
                        <div>
                          <h4 class="text-xs font-semibold text-green-400 uppercase tracking-wider mb-1.5">✓ Pontos fortes</h4>
                          @for (s of aiResult()!.strengths; track s) {
                            <div class="flex items-start gap-2 text-xs mb-1">
                              <span class="text-green-500 shrink-0 mt-0.5">●</span>
                              <span class="text-gray-300">{{ s }}</span>
                            </div>
                          }
                        </div>
                      }
                      @if (aiResult()!.gaps.length > 0) {
                        <div>
                          <h4 class="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1.5">△ Pontos de atenção</h4>
                          @for (g of aiResult()!.gaps; track g) {
                            <div class="flex items-start gap-2 text-xs mb-1">
                              <span class="text-amber-500 shrink-0 mt-0.5">●</span>
                              <span class="text-gray-300">{{ g }}</span>
                            </div>
                          }
                        </div>
                      }
                      <div class="bg-cyan-500/8 rounded-xl p-3 border border-cyan-500/20">
                        <p class="text-xs font-semibold text-cyan-300 mb-1">💡 Recomendação</p>
                        <p class="text-gray-300 text-xs leading-relaxed">{{ aiResult()!.recommendation }}</p>
                      </div>
                      <div class="flex gap-2 pt-1">
                        <button (click)="resetAi()"
                                class="flex-1 py-2 rounded-xl border border-gray-700 text-gray-400 hover:text-gray-200 transition-all text-xs">
                          Nova análise
                        </button>
                        <a href="#contato" (click)="onAiContactClick(); closeModal()"
                           class="flex-1 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-semibold text-center hover:scale-[1.02] transition-transform">
                          Entrar em contato
                        </a>
                      </div>
                    </div>
                  }

                  @if (aiError()) {
                    <div class="text-center py-8 space-y-3">
                      <span class="text-3xl">⚠️</span>
                      <p class="text-red-300 text-sm">{{ aiError() }}</p>
                      <button (click)="resetAi()"
                              class="px-4 py-2 rounded-xl border border-gray-700 text-gray-400 hover:text-gray-200 transition-all text-sm">
                        Tentar novamente
                      </button>
                    </div>
                  }
                </div>
              } <!-- end @if ai -->

            </div>

            <div class="lg:w-1/2 flex flex-col items-center justify-center p-6 bg-gray-900/50 relative overflow-hidden min-h-[320px]">
              <div class="absolute inset-0 pointer-events-none transition-all duration-1000"
                   [style.background]="'radial-gradient(ellipse at 50% 80%, ' + matchColor() + '18 0%, transparent 65%)'"></div>

              @if (displayPercent() > 0) {
                <div class="absolute top-4 right-4 text-right animate-fade-in">
                  <div class="text-3xl font-black leading-none transition-colors duration-700" [style.color]="matchColor()">
                    {{ displayPercent() }}<span class="text-base font-semibold">%</span>
                  </div>
                  <div class="text-gray-500 text-[10px] uppercase tracking-widest font-mono">match</div>
                </div>
              }

              @if (skills().length === 0) {
                <div class="absolute top-16 left-6 text-left">
                  <p class="text-gray-600 text-xs leading-relaxed">
                    ← Digite tecnologias<br>para ver o match
                  </p>
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
                  " class="silhouette-bg" fill="#0f172a" stroke="#334155" stroke-width="1.5"/>

                  <rect x="0" [attr.y]="340 - displayPercent() * 3.4" width="200" [attr.height]="displayPercent() * 3.4"
                        [attr.fill]="matchColor()"
                        opacity="0.7"
                        clip-path="url(#silhouette-clip)"
                        style="transition: y 0.8s ease, height 0.8s ease, fill 0.5s ease"/>

                  @if (displayPercent() > 0 && displayPercent() < 100) {
                    <line [attr.y1]="340 - displayPercent() * 3.4"
                          [attr.y2]="340 - displayPercent() * 3.4"
                          x1="20" x2="180"
                          [attr.stroke]="matchColor()"
                          stroke-width="1.5"
                          stroke-dasharray="4 3"
                          opacity="0.6"
                          style="transition: all 0.8s ease"/>
                  }
                </svg>

              </div>

              @if (activeTab() === 'tags' && skills().length > 0) {
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
              @if (activeTab() === 'ai' && aiResult()) {
                <p class="text-[10px] text-center mt-2 font-mono" [style.color]="matchColor()">
                  {{ aiResult()!.matchPercentage >= 85 ? '🚀 Perfeito' : aiResult()!.matchPercentage >= 70 ? '🎯 Ótimo' : aiResult()!.matchPercentage >= 50 ? '💡 Parcial' : '🔍 Baixo' }}
                </p>
              }
            </div>

          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    :host-context(html.light) .silhouette-bg {
      fill: #f1f5f9;
      stroke: #cbd5e1;
    }

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

    .tab-active {
      background: linear-gradient(135deg, #3b82f6, #06b6d4);
      color: #ffffff;
    }
    .tab-inactive {
      color: #94a3b8;
    }
    .tab-inactive:hover { color: #e2e8f0; }

    .ai-analyze-btn {
      background: linear-gradient(135deg, #3b82f6, #06b6d4);
      box-shadow: 0 4px 16px rgba(6,182,212,0.25);
      color: #ffffff;
      cursor: pointer;
    }
    .ai-analyze-btn:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(6,182,212,0.4);
    }
    .ai-analyze-btn:active:not(:disabled) { transform: translateY(0); }

    .ai-loading-ring {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      border: 3px solid rgba(6,182,212,0.15);
      border-top-color: #06b6d4;
      animation: aiSpin 0.8s linear infinite;
    }
    @keyframes aiSpin { to { transform: rotate(360deg); } }

    .border-3 { border-width: 3px; }
  `]
})
export class DevMatchComponent implements OnInit {
  private analytics = inject(AnalyticsService);
  private firebaseService = inject(FirebaseService);
  private cdr = inject(ChangeDetectorRef);

  modalOpen = signal(false);
  activeTab = signal<'tags' | 'ai'>('tags');
  skills = signal<SkillEntry[]>([]);
  currentInput = signal('');
  currentWeight = signal<number>(1);
  showMatchInfo = signal(false);

  // ---- AI ----
  aiJobDescription = '';
  aiLoading = signal(false);
  aiResult = signal<AiMatchResult | null>(null);
  aiError = signal<string | null>(null);

  private readonly AI_CACHE_KEY = 'portfolio-ai-match-cache';
  private readonly AI_CACHE_MAX = 20;

  readonly suggestions = [
    'Laravel', 'Vue.js', 'Angular', 'React', 'Node.js',
    'Docker', 'PostgreSQL', 'Python', 'TypeScript', 'Power BI',
    'AWS', 'MongoDB', 'Scrum', 'Remoto',
  ];

  matchPercent = computed(() => {
    const list = this.skills();
    if (list.length === 0) return 0;
    const totalWeight = list.reduce((s, sk) => s + sk.weight, 0);
    const totalScore = list.reduce((s, sk) => s + (sk.matched ? sk.score * sk.weight : 0), 0);
    return Math.round(totalScore / totalWeight);
  });

  displayPercent = computed(() => {
    if (this.activeTab() === 'ai') return this.aiResult()?.matchPercentage ?? 0;
    return this.matchPercent();
  });

  matchColor = computed(() => {
    const p = this.displayPercent();
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
    if (this.skills().length > 0 || this.aiResult()) {
      this.saveToFirebase();
    }
  }

  // ---- AI methods ----
  resetAi(): void {
    this.aiResult.set(null);
    this.aiError.set(null);
    this.aiLoading.set(false);
    this.aiJobDescription = '';
  }

  async analyzeWithAi(): Promise<void> {
    if (this.aiJobDescription.trim().length < 20) return;

    const cacheKey = this.aiJobDescription.toLowerCase().replace(/\s+/g, ' ').trim();
    const cache = this.loadAiCache();
    if (cache[cacheKey]) {
      this.aiResult.set(cache[cacheKey]);
      return;
    }

    this.aiLoading.set(true);
    this.aiError.set(null);
    this.aiResult.set(null);

    const profile = this.buildEliasProfile();
    const prompt = `Você é especialista em recrutamento tech. Analise a compatibilidade entre o candidato e a vaga.\n\n${profile}\n\n---\nDESCRIÇÃO DA VAGA:\n${this.aiJobDescription.trim()}\n\n---\nINSTRUÇÕES:\n1. Compare cada requisito com as habilidades de Elias\n2. Calcule um match realista (0-100%)\n3. Seja justo: reduza o match para habilidades que Elias não domina\n\nResponda EXCLUSIVAMENTE em JSON válido (sem markdown):\n{\n  "matchPercentage": <0-100>,\n  "summary": "<2-3 frases>",\n  "strengths": ["<ponto 1>", ...],\n  "gaps": ["<lacuna 1>", ...],\n  "recommendation": "<1-2 frases>"\n}\nResposta em português brasileiro.`;

    const ai = new GoogleGenAI({ apiKey: environment.geminiApiKey });
    const models = ['gemini-2.5-flash', 'gemini-2.5-flash-lite'];
    let lastError: Error | null = null;

    for (const model of models) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: { temperature: 0.7, responseMimeType: 'application/json' },
        });
        const text = response.text;
        if (!text) throw new Error('Resposta vazia da IA');
        const parsed = JSON.parse(text) as AiMatchResult;
        if (typeof parsed.matchPercentage !== 'number' || !Array.isArray(parsed.strengths)) {
          throw new Error('Formato de resposta inválido');
        }
        parsed.matchPercentage = Math.max(0, Math.min(100, Math.round(parsed.matchPercentage)));
        this.aiResult.set(parsed);
        this.aiLoading.set(false);
        this.cdr.detectChanges();
        const updatedCache = this.loadAiCache();
        const entries = Object.entries(updatedCache);
        if (entries.length >= this.AI_CACHE_MAX) delete updatedCache[entries[0][0]];
        updatedCache[cacheKey] = parsed;
        localStorage.setItem(this.AI_CACHE_KEY, JSON.stringify(updatedCache));
        const _vid = localStorage.getItem('portfolio-vid') ?? undefined;
        if (_vid) this.firebaseService.touchVisitor(_vid);
        this.firebaseService.saveAiMatch({
          visitorId: _vid,
          jobDescription: this.aiJobDescription.trim(),
          aiResponse: parsed.recommendation ?? text,
          matchPercentage: parsed.matchPercentage,
        }).catch(() => {});
        void this.analytics.trackFeatureComplete('ai_match', parsed.matchPercentage, { source: 'dev_match_modal' });
        lastError = null;
        break;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : '';
        if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED')) {
          lastError = new Error('Limite de requisições atingido. Aguarde e tente novamente.');
          await new Promise(r => setTimeout(r, 2000));
          continue;
        }
        lastError = err instanceof Error ? err : new Error('Erro ao analisar com IA. Tente novamente.');
        break;
      }
    }

    if (lastError) {
      this.aiError.set(lastError.message);
      this.aiLoading.set(false);
      this.cdr.detectChanges();
    }
  }

  private buildEliasProfile(): string {
    const skills = Object.entries(ELIAS_SKILLS)
      .filter(([, v]) => v >= 70)
      .map(([k, v]) => `${k} (${v}%)`)
      .join(', ');
    return `PERFIL DE ELIAS (Desenvolvedor Fullstack Sênior, 8+ anos):\n- Habilidades fortes: ${skills}\n- Trabalho remoto: SIM\n- Scrum/Kanban: SIM\n- Mentoria de juniores: SIM\n- Sistemas multi-tenant, SaaS, migração legados: SIM`;
  }

  private loadAiCache(): Record<string, AiMatchResult> {
    try { return JSON.parse(localStorage.getItem(this.AI_CACHE_KEY) ?? '{}'); }
    catch { return {}; }
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
    if (val) this.addSkill(val, this.currentWeight());
    this.currentInput.set('');
    this.currentWeight.set(1);
  }

  onWeightInput(event: Event): void {
    const val = parseInt((event.target as HTMLInputElement).value, 10);
    this.currentWeight.set(isNaN(val) ? 1 : Math.max(1, Math.min(10, val)));
  }

  addSuggestion(s: string): void {
    this.addSkill(s);
  }

  private addSkill(name: string, weight = 1): void {
    if (!name) return;
    const normalized = name.trim();
    if (this.skills().some(sk => sk.name.toLowerCase() === normalized.toLowerCase())) return;
    const score = findSkillScore(normalized);
    const matched = score !== null;
    const w = Math.max(1, Math.min(10, Math.round(weight)));
    this.skills.update(list => [...list, { name: normalized, matched, score: score ?? 0, weight: w }]);
  }

  removeSkill(name: string): void {
    this.skills.update(list => list.filter(sk => sk.name !== name));
  }

  onContactClick(kind: 'success' | 'surprise'): void {
    void this.analytics.trackCtaClick(`dev_match_contact_${kind}`, 'dev-match', 'contact', {
      kind,
      matchPercent: this.matchPercent(),
    });
    this.saveToFirebase();
  }

  onAiContactClick(): void {
    void this.analytics.trackCtaClick('ai_match_contact', 'dev-match', 'contact', {
      source: 'ai_result',
      matchPercent: this.aiResult()?.matchPercentage ?? 0,
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
