import { Component, inject } from '@angular/core';
import { AnalyticsService } from '../../core/services/analytics.service';

interface Project {
  index: string;
  title: string;
  tagline: string;
  description: string;
  stack: string[];
  href: string;
  linkLabel: string;
  track?: boolean;
}

@Component({
  selector: 'app-portfolio',
  standalone: true,
  template: `
    <section id="projetos" class="py-28 px-8 border-b border-zinc-900">
      <div class="max-w-6xl mx-auto">
        <div class="mb-20 max-w-2xl">
          <div class="eyebrow mb-5">03 — Projetos</div>
          <h2 class="section-title mb-6">Código que dá<br>para abrir agora</h2>
          <p class="section-lead">
            Projetos públicos, com link direto para o que está no ar e para o repositório.
          </p>
        </div>

        <div>
          @for (p of projects; track p.title) {
            <article class="project-row group border-t border-zinc-900 last:border-b py-10 md:py-12
                            grid grid-cols-1 md:grid-cols-[4rem_1fr_auto] gap-x-8 gap-y-5 items-start">
              <div class="eyebrow pt-1">{{ p.index }}</div>

              <div class="max-w-2xl">
                <h3 class="display text-2xl md:text-3xl text-zinc-50 mb-1.5">{{ p.title }}</h3>
                <p class="eyebrow mb-4">{{ p.tagline }}</p>
                <p class="text-zinc-400 text-[0.9375rem] leading-relaxed mb-6">{{ p.description }}</p>
                <div class="flex flex-wrap gap-2">
                  @for (tech of p.stack; track tech) {
                    <span class="pill">{{ tech }}</span>
                  }
                </div>
              </div>

              <a [href]="p.href" target="_blank" rel="noopener noreferrer"
                 (click)="p.track ? onBruliasClick() : null"
                 class="btn-ghost md:mt-1 shrink-0">
                {{ p.linkLabel }}
                <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5"
                     fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                </svg>
              </a>
            </article>
          }
        </div>
      </div>
    </section>
  `
})
export class PortfolioComponent {
  private analytics = inject(AnalyticsService);

  projects: Project[] = [
    {
      index: '01',
      title: 'Brulias',
      tagline: 'Renderização 3D em tempo real no browser',
      description:
        'Experiência web com renderização 3D de um universo navegável e jogos interativos, ' +
        'construída sobre Three.js/WebGL. Exercita gerenciamento de cena, loop de render e ' +
        'performance gráfica no navegador.',
      stack: ['Three.js', 'WebGL', 'TypeScript', 'Firebase Hosting'],
      href: 'https://brulias.web.app/',
      linkLabel: 'Ver ao vivo',
      track: true,
    },
    {
      index: '02',
      title: 'Este portfólio',
      tagline: 'Angular 20 · Firebase · Gemini API',
      description:
        'Aplicação Angular 20 standalone com Firestore para analytics em tempo real, dashboard ' +
        'administrativo protegido por Firebase Auth, chat ao vivo e deploy automatizado via ' +
        'GitHub Actions. O código está aberto no repositório.',
      stack: ['Angular 20', 'TypeScript', 'Firestore', 'Cloud Functions', 'Tailwind CSS', 'GitHub Actions'],
      href: 'https://github.com/egdsdev/portfolio',
      linkLabel: 'Ver código',
    },
  ];

  onBruliasClick(): void {
    this.analytics.trackBruliasClick();
  }
}
