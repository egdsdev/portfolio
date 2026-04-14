import { Component, inject } from '@angular/core';
import { AnalyticsService } from '../../core/services/analytics.service';

@Component({
  selector: 'app-portfolio',
  standalone: true,
  template: `
    <section id="projetos" class="py-24 px-8">
      <div class="max-w-5xl mx-auto">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold bg-linear-to-r from-purple-400 to-cyan-400 text-transparent bg-clip-text inline-block">
            Projetos em Destaque
          </h2>
          <div class="mt-3 mx-auto w-16 h-px bg-linear-to-r from-purple-400 to-cyan-400 rounded-full"></div>
          <p class="text-gray-400 mt-4">Trabalhos que demonstram minha capacidade técnica na prática</p>
        </div>

        <!-- Card: Brulias -->
        <div class="relative group rounded-3xl overflow-hidden border border-purple-500/30 hover:border-purple-400/60 transition-all duration-500 bg-gray-900/70 backdrop-blur-sm shadow-2xl">
          <!-- Glow de fundo -->
          <div class="absolute inset-0 bg-linear-to-br from-purple-900/40 via-indigo-900/30 to-cyan-900/20 opacity-80 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
          <div class="absolute -top-32 -right-32 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl group-hover:bg-purple-500/30 transition-all duration-700 pointer-events-none"></div>
          <div class="absolute -bottom-20 -left-20 w-72 h-72 bg-cyan-600/10 rounded-full blur-3xl group-hover:bg-cyan-500/20 transition-all duration-700 pointer-events-none"></div>

          <div class="relative z-10 p-8 md:p-12">
            <!-- Cabeçalho do card -->
            <div class="flex items-center gap-4 mb-6">
              <span class="text-5xl">🌌</span>
              <div>
                <h3 class="text-2xl font-bold text-white">Brulias</h3>
                <p class="text-purple-400 text-sm font-semibold tracking-wider uppercase">Projeto Pessoal · 2025</p>
              </div>
              <a href="https://egdsdev.github.io/brulias/universo"
                 target="_blank"
                 rel="noopener noreferrer"
                 (click)="onBruliasClick()"
                 class="ml-auto inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-linear-to-r from-purple-600 to-cyan-600
                        hover:from-purple-500 hover:to-cyan-500 text-white font-bold text-sm tracking-wide shadow-lg
                        shadow-purple-900/40 hover:shadow-purple-800/60 transform hover:scale-105 transition-all duration-300 group/btn shrink-0">
                <span>✨ Visitar</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform duration-200"
                     fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                </svg>
              </a>
            </div>

            <!-- Descrição -->
            <p class="text-gray-300 text-base leading-relaxed mb-8">
              Site imersivo criado com amor — apresenta <strong class="text-white">renderização 3D do universo</strong> em tempo real,
              jogos interativos em 3D e uma experiência visual única que demonstra domínio de gráficos na web,
              animações avançadas e engenharia front-end de alto nível.
            </p>

            <!-- Destaques -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div class="bg-white/5 rounded-xl p-4 text-center border border-white/10 hover:border-purple-500/30 transition-colors">
                <div class="text-3xl mb-2">🎮</div>
                <p class="text-white text-sm font-semibold">Jogos 3D</p>
                <p class="text-gray-500 text-xs mt-1">Interativos no browser</p>
              </div>
              <div class="bg-white/5 rounded-xl p-4 text-center border border-white/10 hover:border-cyan-500/30 transition-colors">
                <div class="text-3xl mb-2">✨</div>
                <p class="text-white text-sm font-semibold">Universo 3D</p>
                <p class="text-gray-500 text-xs mt-1">Renderização em tempo real</p>
              </div>
              <div class="bg-white/5 rounded-xl p-4 text-center border border-white/10 hover:border-pink-500/30 transition-colors">
                <div class="text-3xl mb-2">💎</div>
                <p class="text-white text-sm font-semibold">Design Premium</p>
                <p class="text-gray-500 text-xs mt-1">Experiência visual única</p>
              </div>
            </div>

            <!-- Tags de tecnologia -->
            <div class="flex flex-wrap gap-2">
              <span class="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">Three.js / WebGL</span>
              <span class="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">3D Rendering</span>
              <span class="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">Jogos 3D</span>
              <span class="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">Animações Avançadas</span>
              <span class="px-3 py-1 rounded-full text-xs font-semibold bg-pink-500/20 text-pink-300 border border-pink-500/30">UI/UX Criativa</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  `
})
export class PortfolioComponent {
  private analytics = inject(AnalyticsService);

  onBruliasClick(): void {
    this.analytics.trackBruliasClick();
  }
}
