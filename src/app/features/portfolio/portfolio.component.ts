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
        <div class="brulias-card relative group rounded-3xl overflow-hidden border-2 border-purple-500 hover:border-cyan-400 transition-all duration-500 bg-gray-900/80 backdrop-blur-md shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:shadow-[0_0_50px_rgba(34,211,238,0.6)] transform hover:-translate-y-2">

          <!-- Ribbon Destaque -->
          <div class="absolute top-6 -right-12 bg-linear-to-r from-purple-600 to-cyan-500 text-white text-xs font-bold px-12 py-1 rotate-45 shadow-lg z-20 tracking-widest uppercase animate-pulse">
            Destaque
          </div>

          <!-- Glow de fundo -->
          <div class="brulias-glow-overlay absolute inset-0 bg-linear-to-br from-purple-900/50 via-indigo-900/40 to-cyan-900/30 opacity-90 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
          <div class="absolute -top-32 -right-32 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl group-hover:bg-purple-400/40 animate-pulse transition-all duration-700 pointer-events-none brulias-glow-bulb-1"></div>
          <div class="absolute -bottom-20 -left-20 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl group-hover:bg-cyan-400/30 transition-all duration-700 pointer-events-none brulias-glow-bulb-2"></div>

          <div class="relative z-10 p-8 md:p-12">
            <!-- Cabeçalho do card -->
            <div class="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
              <span class="text-6xl group-hover:scale-110 transition-transform duration-500">🌌</span>
              <div>
                <h3 class="text-3xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-purple-300 to-cyan-300">Brulias</h3>
                <p class="text-cyan-400 text-sm font-bold tracking-widest uppercase mt-1">Experiência Imersiva em 3D</p>
              </div>
              <a href="https://egdsdev.github.io/brulias/universo"
                 target="_blank"
                 rel="noopener noreferrer"
                 title="Clique para viver a experiência 3D"
                 (click)="onBruliasClick()"
                 class="mt-4 md:mt-0 md:ml-auto inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-linear-to-r from-purple-600 to-cyan-600
                        hover:from-purple-500 hover:to-cyan-400 text-white font-extrabold text-base tracking-widest shadow-[0_0_20px_rgba(168,85,247,0.5)]
                        hover:shadow-[0_0_30px_rgba(34,211,238,0.8)] transform hover:scale-110 transition-all duration-300 group/btn shrink-0 animate-bounce">
                <span>🚀 ACESSAR PROJETO</span>
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
              <div class="brulias-feature bg-white/5 rounded-xl p-4 text-center border border-white/10 hover:border-purple-500/30 transition-colors">
                <div class="text-3xl mb-2">🎮</div>
                <p class="text-white text-sm font-semibold">Jogos 3D</p>
                <p class="text-gray-500 text-xs mt-1">Interativos no browser</p>
              </div>
              <div class="brulias-feature bg-white/5 rounded-xl p-4 text-center border border-white/10 hover:border-cyan-500/30 transition-colors">
                <div class="text-3xl mb-2">✨</div>
                <p class="text-white text-sm font-semibold">Universo 3D</p>
                <p class="text-gray-500 text-xs mt-1">Renderização em tempo real</p>
              </div>
              <div class="brulias-feature bg-white/5 rounded-xl p-4 text-center border border-white/10 hover:border-pink-500/30 transition-colors">
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

        <!-- Card: Portfolio Pessoal -->
        <div class="relative group rounded-2xl overflow-hidden border border-blue-500/30 hover:border-cyan-400/60 transition-all duration-500
                    bg-gray-900/60 backdrop-blur-md shadow-lg hover:shadow-[0_0_30px_rgba(96,165,250,0.25)] transform hover:-translate-y-2 mt-6">
          <div class="absolute inset-0 bg-linear-to-br from-blue-900/20 via-transparent to-cyan-900/20 pointer-events-none"></div>

          <div class="relative z-10 p-8 md:p-12">
            <div class="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
              <span class="text-5xl group-hover:scale-110 transition-transform duration-500">🚀</span>
              <div>
                <h3 class="text-2xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-blue-300 to-cyan-300">Portfolio Pessoal</h3>
                <p class="text-blue-400 text-sm font-bold tracking-widest uppercase mt-1">Este site · Angular 20 + Gemini AI</p>
              </div>
              <a href="https://github.com/egdsdev/portfolio"
                 target="_blank"
                 rel="noopener noreferrer"
                 class="mt-4 md:mt-0 md:ml-auto inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-800/80 border border-gray-600/50
                        hover:border-blue-400/60 text-gray-300 hover:text-blue-300 font-semibold text-sm tracking-wide
                        transition-all duration-300 hover:scale-105 shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.54-1.38-1.33-1.74-1.33-1.74-1.09-.74.08-.73.08-.73 1.2.09 1.83 1.23 1.83 1.23 1.07 1.83 2.81 1.3 3.49 1 .11-.78.42-1.3.76-1.6-2.66-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 013-.4c1.02.01 2.04.14 3 .4 2.28-1.55 3.29-1.23 3.29-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58C20.57 21.79 24 17.29 24 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                Ver Código
              </a>
            </div>

            <p class="text-gray-300 text-base leading-relaxed mb-6">
              Portfólio desenvolvido do zero com <strong class="text-white">Angular 20</strong> standalone, integrando
              <strong class="text-white">Google Gemini AI</strong> para análise de perfil, <strong class="text-white">Firebase Firestore</strong>
              para analytics em tempo real com dashboard admin protegido, tema claro/escuro e deploy automatizado via GitHub Actions.
            </p>

            <div class="flex flex-wrap gap-2">
              <span class="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">Angular 20</span>
              <span class="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">TypeScript</span>
              <span class="px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/20 text-orange-300 border border-orange-500/30">Firebase Firestore</span>
              <span class="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">Gemini AI</span>
              <span class="px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30">Tailwind CSS</span>
              <span class="px-3 py-1 rounded-full text-xs font-semibold bg-gray-600/30 text-gray-300 border border-gray-500/30">GitHub Pages</span>
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
