import { Component, ElementRef, AfterViewInit, OnDestroy, ChangeDetectorRef, inject, signal } from '@angular/core';

interface RadarSkill {
  label: string;
  svgLabel: string;
  sublabel: string;
  value: number;
  color: string;
}

@Component({
  selector: 'app-tech-radar',
  standalone: true,
  template: `
    <section id="tech-radar" class="py-20 px-8">
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold bg-linear-to-r from-blue-400 to-cyan-400 text-transparent bg-clip-text inline-block">
            Tech Proficiency
          </h2>
          <div class="mt-3 mx-auto w-16 h-px bg-linear-to-r from-blue-400 to-cyan-400 rounded-full"></div>
          <p class="mt-4 text-gray-500 text-sm tracking-wide max-w-md mx-auto">
            Nível de proficiência por área, baseado em anos de uso e projetos entregues
          </p>
        </div>

        <div class="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">

          <!-- SVG Radar Chart -->
          <div class="w-full lg:w-1/2 flex justify-center">
            <svg viewBox="-15 -35 450 460" class="w-full max-w-xs lg:max-w-sm" aria-label="Tech Proficiency Radar">
              <defs>
                <radialGradient id="radarFillGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%"   stop-color="#3b82f6" stop-opacity="0.4"/>
                  <stop offset="100%" stop-color="#22d3ee" stop-opacity="0.1"/>
                </radialGradient>
                <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur"/>
                  <feMerge>
                    <feMergeNode in="blur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              <!-- Grid polygons (concentric) -->
              @for (level of gridLevels; track level) {
                <polygon
                  [attr.points]="gridPoints(level)"
                  fill="none"
                  [attr.stroke]="level === 1 ? 'rgba(255,255,255,0.13)' : 'rgba(255,255,255,0.06)'"
                  stroke-width="1"/>
              }

              <!-- Axis lines -->
              @for (skill of skills; track $index) {
                <line
                  x1="200" y1="200"
                  [attr.x2]="axisEnd($index).x"
                  [attr.y2]="axisEnd($index).y"
                  stroke="rgba(255,255,255,0.1)"
                  stroke-width="1"/>
              }

              <!-- Tick labels on top axis -->
              @for (lvl of tickLevels; track lvl) {
                <text
                  x="200"
                  [attr.y]="200 - maxR * lvl - 5"
                  text-anchor="middle"
                  font-size="8"
                  fill="rgba(156,163,175,0.45)"
                  font-family="monospace">{{ pct(lvl) }}%</text>
              }

              <!-- Data polygon fill -->
              <polygon
                [attr.points]="dataPoints()"
                fill="url(#radarFillGrad)"
                stroke="none"/>

              <!-- Data polygon stroke with glow -->
              <polygon
                [attr.points]="dataPoints()"
                fill="none"
                stroke="#22d3ee"
                stroke-width="2"
                stroke-linejoin="round"
                [attr.filter]="'url(#glowFilter)'"
                opacity="0.85"/>

              <!-- Center dot -->
              <circle cx="200" cy="200" r="3" fill="#22d3ee" opacity="0.5"/>

              <!-- Glow halo + dot at each vertex -->
              @for (skill of skills; track $index) {
                <circle
                  [attr.cx]="dotPos($index).x"
                  [attr.cy]="dotPos($index).y"
                  r="8"
                  [attr.fill]="skill.color"
                  fill-opacity="0.15"/>
                <circle
                  [attr.cx]="dotPos($index).x"
                  [attr.cy]="dotPos($index).y"
                  r="4"
                  [attr.fill]="skill.color"
                  stroke="#111827"
                  stroke-width="1.5"/>
              }

              <!-- Labels -->
              @for (skill of skills; track $index) {
                <text
                  [attr.x]="labelPos($index).x"
                  [attr.y]="labelPos($index).y"
                  [attr.dy]="labelDy($index)"
                  [attr.text-anchor]="labelAnchor($index)"
                  font-size="11.5"
                  font-weight="600"
                  font-family="system-ui, sans-serif"
                  [attr.fill]="skill.color">{{ skill.svgLabel }}</text>
              }
            </svg>
          </div>

          <!-- Skill Bars -->
          <div class="w-full lg:w-1/2 space-y-6">
            @for (skill of skills; track $index) {
              <div>
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center gap-2.5">
                    <span class="w-2.5 h-2.5 rounded-full shrink-0" [style.background-color]="skill.color"></span>
                    <span class="text-sm font-semibold text-gray-200">{{ skill.label }}</span>
                  </div>
                  <span class="text-xs font-mono font-bold tabular-nums" [style.color]="skill.color">
                    {{ pct(skill.value * progress()) }}%
                  </span>
                </div>
                <div class="h-1.5 bg-gray-800/80 rounded-full overflow-hidden">
                  <div
                    class="h-full rounded-full transition-none"
                    [style.width.%]="skill.value * progress() * 100"
                    [style.background-color]="skill.color"
                    [style.box-shadow]="'0 0 6px ' + skill.color + '80'">
                  </div>
                </div>
                <p class="text-xs text-gray-500 mt-1.5 ml-5">{{ skill.sublabel }}</p>
              </div>
            }
          </div>

        </div>
      </div>
    </section>
  `
})
export class TechRadarComponent implements AfterViewInit, OnDestroy {
  private el = inject(ElementRef);
  private cdr = inject(ChangeDetectorRef);

  progress = signal(0);

  readonly cx = 200;
  readonly cy = 200;
  readonly maxR = 150;

  // Skills arranged clockwise from top: Backend, Frontend, BI, Banco de Dados, DevOps
  readonly skills: RadarSkill[] = [
    { label: 'Backend',        svgLabel: 'Backend',        sublabel: 'PHP · Laravel · Python · Node.js',           value: 0.93, color: '#60a5fa' },
    { label: 'Frontend',       svgLabel: 'Frontend',       sublabel: 'Angular · Vue.js · React · TypeScript',       value: 0.79, color: '#22d3ee' },
    { label: 'BI & Dados',     svgLabel: 'BI & Dados',     sublabel: 'Power BI · DAX · Pentaho ETL',                value: 0.76, color: '#fb923c' },
    { label: 'Banco de Dados', svgLabel: 'Banco de Dados', sublabel: 'PostgreSQL · SQL Server · MySQL · MongoDB',   value: 0.88, color: '#a78bfa' },
    { label: 'DevOps & Cloud', svgLabel: 'DevOps',         sublabel: 'Docker · Azure · GitHub Actions · CI/CD',    value: 0.72, color: '#34d399' },
  ];

  // 5 axes: start at -90° (top), 72° apart
  readonly angles = Array.from({ length: 5 }, (_, i) => ((-90 + i * 72) * Math.PI) / 180);
  readonly gridLevels = [0.25, 0.5, 0.75, 1.0];
  readonly tickLevels = [0.25, 0.5, 0.75];

  gridPoints(level: number): string {
    return this.angles
      .map(a => `${this.cx + this.maxR * level * Math.cos(a)},${this.cy + this.maxR * level * Math.sin(a)}`)
      .join(' ');
  }

  axisEnd(i: number) {
    return {
      x: this.cx + this.maxR * Math.cos(this.angles[i]),
      y: this.cy + this.maxR * Math.sin(this.angles[i]),
    };
  }

  labelPos(i: number) {
    const r = this.maxR + 26;
    return {
      x: this.cx + r * Math.cos(this.angles[i]),
      y: this.cy + r * Math.sin(this.angles[i]),
    };
  }

  labelAnchor(i: number): string {
    const cos = Math.cos(this.angles[i]);
    if (Math.abs(cos) < 0.2) return 'middle';
    return cos > 0 ? 'start' : 'end';
  }

  labelDy(i: number): string {
    const sin = Math.sin(this.angles[i]);
    if (sin < -0.5) return '-8';
    if (sin > 0.5) return '14';
    return '4';
  }

  dataPoints(): string {
    const p = this.progress();
    return this.skills
      .map((s, i) => {
        const r = this.maxR * s.value * p;
        return `${this.cx + r * Math.cos(this.angles[i])},${this.cy + r * Math.sin(this.angles[i])}`;
      })
      .join(' ');
  }

  dotPos(i: number) {
    const p = this.progress();
    const r = this.maxR * this.skills[i].value * p;
    return {
      x: this.cx + r * Math.cos(this.angles[i]),
      y: this.cy + r * Math.sin(this.angles[i]),
    };
  }

  pct(value: number): number {
    return Math.round(value * 100);
  }

  private observer?: IntersectionObserver;
  private animFrame?: number;

  ngAfterViewInit() {
    this.observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          this.animate();
          this.observer?.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy() {
    this.observer?.disconnect();
    if (this.animFrame !== undefined) cancelAnimationFrame(this.animFrame);
  }

  private animate() {
    const duration = 1400;
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      this.progress.set(eased);
      this.cdr.markForCheck();
      if (t < 1) this.animFrame = requestAnimationFrame(step);
    };
    this.animFrame = requestAnimationFrame(step);
  }
}
