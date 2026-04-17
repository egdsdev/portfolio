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
    <div class="stats-strip relative overflow-hidden">
      <!-- linha decorativa superior -->
      <div class="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-cyan-500/30 to-transparent"></div>
      <!-- linha decorativa inferior -->
      <div class="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-cyan-500/30 to-transparent"></div>

      <div #trigger class="max-w-4xl mx-auto px-4 sm:px-8 py-10 flex flex-wrap justify-center items-center gap-0">
        @for (stat of stats; track stat.label; let last = $last) {
          <div class="stat-item flex flex-col items-center text-center px-4 sm:px-8 py-4 sm:py-2 stat-fade w-1/2 sm:w-auto"
               [class.stat-visible]="started">
            <span class="stat-number font-bold font-mono text-4xl md:text-5xl leading-none">
              {{ stat.current }}<span class="stat-suffix">{{ stat.suffix }}</span>
            </span>
            <span class="stat-label text-xs tracking-widest uppercase font-medium mt-2">{{ stat.label }}</span>
          </div>
          @if (!last) {
            <div class="stat-divider hidden md:block w-px h-10 bg-cyan-500/20 mx-2"></div>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .stats-strip {
      background: linear-gradient(180deg, transparent 0%, rgba(8,145,178,0.04) 50%, transparent 100%);
    }

    .stat-number {
      background: linear-gradient(135deg, #60a5fa, #22d3ee);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .stat-suffix {
      font-size: 0.7em;
    }

    .stat-label {
      color: #94a3b8;
      letter-spacing: 0.12em;
    }

    .stat-fade {
      opacity: 0;
      transform: translateY(16px);
      transition: opacity 0.6s ease, transform 0.6s ease;
    }

    .stat-fade.stat-visible {
      opacity: 1;
      transform: translateY(0);
    }

    .stat-fade:nth-child(1)  { transition-delay: 0s; }
    .stat-fade:nth-child(3)  { transition-delay: 0.1s; }
    .stat-fade:nth-child(5)  { transition-delay: 0.2s; }
    .stat-fade:nth-child(7)  { transition-delay: 0.3s; }

    :host-context(html.light) .stat-number {
      background: linear-gradient(135deg, #7c3aed, #a855f7);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    :host-context(html.light) .stat-label {
      color: #6b7280;
    }

    :host-context(html.light) .stats-strip {
      background: linear-gradient(180deg, transparent 0%, rgba(124,58,237,0.04) 50%, transparent 100%);
    }

    :host-context(html.light) .stat-divider {
      background-color: rgba(124, 58, 237, 0.2);
    }

    :host-context(html.light) .absolute.top-0 {
      background: linear-gradient(to right, transparent, rgba(124,58,237,0.25), transparent);
    }

    :host-context(html.light) .absolute.bottom-0 {
      background: linear-gradient(to right, transparent, rgba(124,58,237,0.25), transparent);
    }
  `]
})
export class StatsComponent implements AfterViewInit, OnDestroy {
  private cdr = inject(ChangeDetectorRef);
  private observer?: IntersectionObserver;
  private animationFrames: number[] = [];

  started = false;

  stats: Stat[] = [
    { target: 6,  suffix: '+', label: 'Anos de Experiência', current: 0 },
    { target: 6,  suffix: '',  label: 'Empresas',            current: 0 },
    { target: 5,  suffix: '',  label: 'Linguagens Principais', current: 0 },
    { target: 20, suffix: '+', label: 'Tecnologias',         current: 0 },
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
