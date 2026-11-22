import { Component, OnDestroy, AfterViewInit, ChangeDetectorRef, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

interface Stat {
  target: number;
  suffix: string;
  label: string;
  detail: string;
  current: number;
}

@Component({
  selector: 'app-stats',
  standalone: true,
  template: `
    <div class="border-b border-zinc-900">
      <div #trigger class="wrap py-10 sm:py-20 grid grid-cols-3">
        @for (stat of stats; track stat.label) {
          <div class="stat-cell stat-fade" [class.stat-visible]="started">
            <div class="flex items-baseline gap-1.5">
              <span class="stat-number display text-[2.6rem] sm:text-6xl md:text-7xl text-zinc-50">{{ stat.current }}</span>
              <span class="stat-number display text-2xl sm:text-3xl md:text-4xl text-zinc-600">{{ stat.suffix }}</span>
            </div>
            <div class="text-zinc-200 text-xs leading-snug sm:text-[0.9375rem] font-medium mt-2.5 sm:mt-4">{{ stat.label }}</div>
            <div class="hidden sm:block text-zinc-400 text-sm mt-1.5 leading-relaxed">{{ stat.detail }}</div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .stat-number { font-weight: 600; letter-spacing: -0.045em; line-height: 1; }

    /* lado a lado em qualquer largura; no celular, compacto (número + rótulo) */
    .stat-cell { padding: 0 .85rem; border-left: 1px solid var(--border); }
    .stat-cell:first-child { padding-left: 0; border-left: none; }
    @media (min-width: 640px) { .stat-cell { padding: 0 1.5rem; } }
    @media (min-width: 768px) { .stat-cell { padding: 0 2.5rem; } }

    .stat-fade {
      opacity: 0;
      transform: translateY(16px);
      transition: opacity 0.6s ease, transform 0.6s ease;
    }
    .stat-fade.stat-visible { opacity: 1; transform: translateY(0); }
    .stat-fade:nth-child(2) { transition-delay: 0.1s; }
    .stat-fade:nth-child(3) { transition-delay: 0.2s; }
  `]
})
export class StatsComponent implements AfterViewInit, OnDestroy {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private cdr = inject(ChangeDetectorRef);
  private observer?: IntersectionObserver;
  private animationFrames: number[] = [];

  started = false;

  stats: Stat[] = [
    {
      target: 7, suffix: '+', current: 0,
      label: 'Anos em produção',
      detail: 'Full stack de ponta a ponta: modelagem de banco, APIs, infraestrutura e interface.',
    },
    {
      target: 12, suffix: '', current: 0,
      label: 'Serviços que superviso',
      detail: 'Projetei o Data Warehouse e o processo de release que todos os times seguem.',
    },
    {
      target: 6, suffix: '', current: 0,
      label: 'Times por onde passei',
      detail: 'De desenvolvedor a supervisor — conduzindo code review, mentoria e arquitetura.',
    },
  ];

  ngAfterViewInit() {
    if (!this.isBrowser) return;
    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !this.started) {
          this.started = true;
          this.animateAll();
          this.observer?.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    const host = document.querySelector('app-stats');
    if (host) this.observer.observe(host);
  }

  private animateAll() {
    this.stats.forEach((stat, i) => {
      const duration = 1400;
      const start = performance.now();

      const tick = (now: number) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        stat.current = Math.round(eased * stat.target);
        this.cdr.markForCheck();

        if (progress < 1) {
          this.animationFrames[i] = requestAnimationFrame(tick);
        } else {
          stat.current = stat.target;
          this.cdr.markForCheck();
        }
      };

      // pequeno delay entre cada stat para efeito em cascata
      setTimeout(() => {
        this.animationFrames[i] = requestAnimationFrame(tick);
      }, i * 120);
    });
  }

  ngOnDestroy() {
    this.observer?.disconnect();
    this.animationFrames.forEach(id => cancelAnimationFrame(id));
  }
}
