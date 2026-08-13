import { Component, OnDestroy, AfterViewInit, ChangeDetectorRef, inject } from '@angular/core';

interface Stat {
  target: number;
  suffix: string;
  label: string;
  current: number;
}

@Component({
  selector: 'app-stats',
  standalone: true,
  template: `
    <div class="border-b border-zinc-900">
      <div #trigger class="max-w-6xl mx-auto px-8 py-16 grid grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-8">
        @for (stat of stats; track stat.label) {
          <div class="stat-fade" [class.stat-visible]="started">
            <div class="stat-number display text-5xl md:text-6xl text-zinc-50">
              {{ stat.current }}<span class="text-zinc-600">{{ stat.suffix }}</span>
            </div>
            <div class="eyebrow mt-3">{{ stat.label }}</div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .stat-number { font-weight: 600; letter-spacing: -0.04em; }

    .stat-fade {
      opacity: 0;
      transform: translateY(16px);
      transition: opacity 0.6s ease, transform 0.6s ease;
    }
    .stat-fade.stat-visible { opacity: 1; transform: translateY(0); }
    .stat-fade:nth-child(2) { transition-delay: 0.08s; }
    .stat-fade:nth-child(3) { transition-delay: 0.16s; }
    .stat-fade:nth-child(4) { transition-delay: 0.24s; }
  `]
})
export class StatsComponent implements AfterViewInit, OnDestroy {
  private cdr = inject(ChangeDetectorRef);
  private observer?: IntersectionObserver;
  private animationFrames: number[] = [];

  started = false;

  stats: Stat[] = [
    { target: 7,  suffix: '+', label: 'Anos em produção',      current: 0 },
    { target: 12, suffix: '',  label: 'Serviços em plataforma', current: 0 },
    { target: 4,  suffix: '',  label: 'Bancos de dados',       current: 0 },
    { target: 20, suffix: '+', label: 'Tecnologias',           current: 0 },
  ];

  ngAfterViewInit() {
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
