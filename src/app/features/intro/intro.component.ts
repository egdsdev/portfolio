import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, ViewChild, inject } from '@angular/core';

interface Particle {
  /** posição local no retrato da intro */
  lx: number; ly: number;
  /** alvo normalizado (0..1) na foto do hero */
  hu: number; hv: number;
  r: number; hr: number;
  x: number; y: number; vx: number; vy: number;
  /** 0 no miolo, 1 na borda: flutuação e dispersão */
  e: number; ph: number;
  /** atraso da descida (0..~0.4) e desvio lateral da trajetória */
  d: number; arc: number;
  delay: number;
}

/**
 * Intro em pontos: retrato halftone que, ao rolar (ou clicar em Revelar),
 * desce em fluxo e compõe a foto do hero logo abaixo.
 */
@Component({
  selector: 'app-intro',
  standalone: true,
  template: `
    <section class="intro" #stage aria-label="Introdução">
      <div class="word" data-text="DEVELOPER" aria-hidden="true">DEVELOPER</div>
      <div class="portrait" #portrait aria-hidden="true"></div>

      <div class="caption">
        <div class="who">
          <p class="who-name">Elias Gomes da Silva</p>
          <p class="who-role">Desenvolvedor Full Stack Sênior <span>·</span> Engenheiro de Computação</p>
        </div>
        <button class="reveal" type="button" (click)="reveal()"><i></i><span>Revelar</span></button>
      </div>
      <span class="scroll-hint" aria-hidden="true">Role para revelar ↓</span>
    </section>
    <canvas #canvas class="dots" aria-hidden="true"></canvas>
  `,
  styles: [`
    :host { display: block; }

    .intro {
      position: relative;
      height: 100svh;
      min-height: 560px;
      overflow: hidden;
      display: grid;
      place-items: end center;
      background:
        radial-gradient(ellipse 70% 55% at 50% 45%, rgba(255, 90, 31, 0.10), transparent 70%),
        linear-gradient(180deg, #111114 0%, var(--bg) 85%);
    }

    .word {
      position: absolute;
      left: 50%;
      top: 46%;
      transform: translate(-50%, -50%);
      font-family: Anton, Impact, sans-serif;
      font-size: clamp(5rem, 21vw, 22rem);
      line-height: 0.85;
      white-space: nowrap;
      user-select: none;
      pointer-events: none;
      background: linear-gradient(180deg, #a1a1aa 0%, #52525b 55%, rgba(39, 39, 42, 0) 100%);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }

    .portrait {
      position: relative;
      height: min(84svh, calc(96vw * 586 / 640));
      aspect-ratio: 640 / 586;
    }

    /* Fixo sobre a tela: as bolinhas viajam da intro até a foto do hero. */
    .dots {
      position: fixed;
      inset: 0;
      width: 100vw;
      height: 100vh;
      z-index: 40;
      pointer-events: none;
    }

    /* nome, botão e dica somem logo no começo da descida (o hero tem o próprio nome) */
    .caption, .scroll-hint { opacity: var(--intro-ui, 1); }
    .caption {
      position: absolute;
      z-index: 41;
      left: 0; right: 0; bottom: 0;
      display: flex;
      align-items: end;
      justify-content: space-between;
      gap: 1rem;
      padding: 1.25rem clamp(1rem, 4vw, 3rem) 1.5rem;
      background: linear-gradient(0deg, rgba(9, 9, 11, .95) 30%, transparent);
    }
    .who-name { font-size: clamp(1.1rem, 2.4vw, 1.6rem); font-weight: 600; letter-spacing: -0.02em; color: var(--fg); }
    .who-role { margin-top: .25rem; font-size: .875rem; color: var(--fg-muted); }
    .who-role span { color: #ff5a1f; }

    .reveal {
      display: inline-flex;
      align-items: center;
      gap: .55rem;
      padding: .7rem 1.1rem;
      border-radius: 999px;
      border: 1px solid rgba(255, 255, 255, .14);
      background: rgba(24, 24, 27, .75);
      backdrop-filter: blur(8px);
      color: var(--fg);
      font: 500 .8125rem/1 var(--font-sans);
      letter-spacing: .08em;
      text-transform: uppercase;
      transition: border-color .2s, background .2s;
    }
    .reveal:hover { border-color: #ff5a1f; background: rgba(255, 90, 31, .12); }
    .reveal:focus-visible { outline: 2px solid #ff5a1f; outline-offset: 3px; }
    .reveal i { width: .5rem; height: .5rem; border-radius: 999px; background: #ff5a1f; box-shadow: 0 0 10px #ff5a1f; }

    .scroll-hint {
      position: absolute;
      z-index: 41;
      top: 1.25rem;
      right: clamp(1rem, 4vw, 3rem);
      font-size: .75rem;
      letter-spacing: .12em;
      text-transform: uppercase;
      color: var(--fg-faint);
    }

    @media (max-width: 600px) {
      .intro { display: flex; flex-direction: column; justify-content: flex-end; }
      .portrait { height: auto; width: 100vw; margin-top: 30svh; }
      .caption { position: relative; flex-direction: column; align-items: flex-start; padding-top: 0; }
      .word { top: 50svh; }
      .scroll-hint { left: 1rem; right: auto; }
    }
  `],
})
export class IntroComponent implements AfterViewInit, OnDestroy {
  @ViewChild('stage') private stageRef!: ElementRef<HTMLElement>;
  @ViewChild('portrait') private portraitRef!: ElementRef<HTMLElement>;
  @ViewChild('canvas') private canvasRef!: ElementRef<HTMLCanvasElement>;
  private zone = inject(NgZone);

  private readonly MAX_PARTICLES = 9000;
  private readonly MOUSE_RADIUS = 90;
  private readonly reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  private ctx!: CanvasRenderingContext2D;
  private dotsSrc = new Image();
  private heroSrc = new Image();
  private particles: Particle[] = [];
  private silhouette: HTMLCanvasElement | null = null;
  private PW = 0; PH = 0;
  private step = 5;
  private vw = 0; vh = 0;
  private mouse = { x: -9999, y: -9999, active: false };
  private ring = 0;
  private formed = 0;
  private t = 0;
  private progress = 0;
  private last = performance.now();
  private raf = 0;
  private running = false;
  private resizeTimer?: ReturnType<typeof setTimeout>;
  private ready = false;

  private onScroll = () => this.wake();
  private onResize = () => {
    clearTimeout(this.resizeTimer);
    this.resizeTimer = setTimeout(() => { this.build(); this.wake(); }, 150);
  };
  private onPointer = (e: PointerEvent) => {
    this.mouse.x = e.clientX;
    this.mouse.y = e.clientY;
    this.mouse.active = true;
    if (this.progress < 0.05) this.wake();
  };
  private onPointerLeave = () => { this.mouse.active = false; };

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      this.ctx = this.canvasRef.nativeElement.getContext('2d')!;
      this.dotsSrc.src = 'profile-dots.png';
      this.heroSrc.src = 'profile.jpg';
      const loaded = (img: HTMLImageElement) => img.complete && img.naturalWidth
        ? Promise.resolve()
        : new Promise<void>(ok => img.addEventListener('load', () => ok(), { once: true }));
      Promise.all([loaded(this.dotsSrc), loaded(this.heroSrc)]).then(() => {
        this.build();
        this.ready = true;
        this.last = performance.now();
        this.wake();
      });
      addEventListener('scroll', this.onScroll, { passive: true });
      addEventListener('resize', this.onResize);
      addEventListener('pointermove', this.onPointer, { passive: true });
      document.documentElement.addEventListener('pointerleave', this.onPointerLeave);
    });
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.raf);
    clearTimeout(this.resizeTimer);
    removeEventListener('scroll', this.onScroll);
    removeEventListener('resize', this.onResize);
    removeEventListener('pointermove', this.onPointer);
    document.documentElement.removeEventListener('pointerleave', this.onPointerLeave);
    document.body.classList.remove('intro-active');
    document.documentElement.style.removeProperty('--hero-photo-o');
  }

  /** Rola até o hero: a própria rolagem conduz as bolinhas até a foto. */
  reveal(): void {
    const top = this.stageRef.nativeElement.offsetTop + this.stageRef.nativeElement.offsetHeight;
    window.scrollTo({ top, behavior: this.reduceMotion ? 'auto' : 'smooth' });
  }

  private heroRect(): DOMRect | null {
    return document.querySelector('#detalhes .hero-photo')?.getBoundingClientRect() ?? null;
  }

  private wake(): void {
    if (!this.ready || this.running) return;
    this.running = true;
    this.last = performance.now();
    this.raf = requestAnimationFrame(t => this.tick(t));
  }

  // Amostra o retrato numa grade (halftone) e casa cada ponto com um ponto da foto do hero.
  private build(): void {
    const canvas = this.canvasRef.nativeElement;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.vw = window.innerWidth;
    this.vh = window.innerHeight;
    canvas.width = Math.round(this.vw * dpr);
    canvas.height = Math.round(this.vh * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const prect = this.portraitRef.nativeElement.getBoundingClientRect();
    this.PW = prect.width; this.PH = prect.height;
    const ow = Math.max(1, Math.round(this.PW)), oh = Math.max(1, Math.round(this.PH));

    const off = document.createElement('canvas');
    off.width = ow; off.height = oh;
    const octx = off.getContext('2d', { willReadFrequently: true })!;
    octx.drawImage(this.dotsSrc, 0, 0, ow, oh);
    const data = octx.getImageData(0, 0, ow, oh).data;

    const step = this.step = Math.max(3, Math.round(Math.sqrt((ow * oh * 0.45) / this.MAX_PARTICLES)));
    const maxR = step * 0.48;

    // Alfa desfocado (reduz e amplia): distância até o contorno, em qualquer navegador.
    const k = Math.max(4, Math.round(step * 2.4));
    const sm = document.createElement('canvas');
    sm.width = Math.max(1, Math.round(ow / k)); sm.height = Math.max(1, Math.round(oh / k));
    const smx = sm.getContext('2d')!;
    smx.imageSmoothingQuality = 'high';
    smx.drawImage(this.dotsSrc, 0, 0, sm.width, sm.height);
    const blurred = document.createElement('canvas');
    blurred.width = ow; blurred.height = oh;
    const blx = blurred.getContext('2d', { willReadFrequently: true })!;
    blx.imageSmoothingQuality = 'high';
    blx.drawImage(sm, 0, 0, ow, oh);
    const soft = blx.getImageData(0, 0, ow, oh).data;

    // Silhueta escura: a cabeça cobre o texto atrás.
    const sil = document.createElement('canvas');
    sil.width = ow; sil.height = oh;
    const sctx = sil.getContext('2d')!;
    sctx.drawImage(blurred, 0, 0);
    sctx.globalCompositeOperation = 'source-in';
    sctx.fillStyle = '#0b0b0d';
    sctx.fillRect(0, 0, ow, oh);
    sctx.globalCompositeOperation = 'destination-in';
    const gx = sctx.createLinearGradient(0, 0, ow, 0);
    gx.addColorStop(0, 'rgba(0,0,0,0)'); gx.addColorStop(0.18, '#000'); gx.addColorStop(0.82, '#000'); gx.addColorStop(1, 'rgba(0,0,0,0)');
    sctx.fillStyle = gx; sctx.fillRect(0, 0, ow, oh);
    const gy = sctx.createLinearGradient(0, oh, 0, 0);
    gy.addColorStop(0, 'rgba(0,0,0,0)'); gy.addColorStop(0.16, '#000');
    sctx.fillStyle = gy; sctx.fillRect(0, 0, ow, oh);
    this.silhouette = sil;

    // Brilho normalizado dentro da silhueta: blusão e cabelo ganham textura.
    const lums: number[] = [];
    for (let y = 0; y < oh; y += step) for (let x = 0; x < ow; x += step) {
      const i = (y * ow + x) * 4;
      if (data[i + 3] >= 140) lums.push(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
    }
    lums.sort((a, b) => a - b);
    const lo = lums[Math.floor(lums.length * 0.03)] || 0;
    const hi = lums[Math.floor(lums.length * 0.97)] || 255;

    const old = this.particles;
    const list: Particle[] = [];
    for (let y = 0; y < oh; y += step) for (let x = 0; x < ow; x += step) {
      const i = (y * ow + x) * 4;
      const a = soft[i + 3] / 255;
      const inside = data[i + 3] >= 140;
      if (!inside && a < 0.08) continue;

      const t0 = Math.min(1, Math.max(0, (a - 0.22) / 0.68));
      const inner = t0 * t0 * (3 - 2 * t0);
      const frame = Math.min(1, x / (ow * 0.18), (ow - x) / (ow * 0.18), (oh - y) / (oh * 0.16));
      const f = Math.min(frame, inside ? inner : inner * 0.5);
      if (f < 0.1 || Math.random() > f + 0.22) continue;

      const raw = inside ? 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2] : lo;
      const lum = Math.min(1, Math.max(0, (raw - lo) / (hi - lo || 1)));
      const r = maxR * (0.32 + 0.68 * Math.pow(lum, 0.75)) * (0.4 + 0.6 * f);
      const e = 1 - Math.min(inner, frame);
      const jx = (Math.random() - 0.5) * step * 0.9 * e;
      const jy = (Math.random() - 0.5) * step * 0.9 * e;
      const p = old[list.length];
      list.push({
        lx: x + jx, ly: y + jy, hu: 0, hv: 0, r, hr: r,
        x: p ? p.x : prect.left + Math.random() * this.PW,
        y: p ? p.y : this.vh + Math.random() * this.vh * 0.6,
        vx: 0, vy: 0, e, ph: Math.random() * Math.PI * 2,
        // de baixo para cima: quem está mais perto do hero desce primeiro
        d: 0.22 * (1 - y / oh) + Math.random() * 0.14,
        arc: (Math.random() - 0.5) * 120,
        delay: p ? 0 : Math.random() * 40 + (oh - y) * 0.06,
      });
    }

    this.assignHeroTargets(list);
    if (this.reduceMotion) list.forEach(p => { p.delay = 0; });
    this.particles = list;
  }

  // Grade de halftone sobre a foto do hero, com o mesmo número aproximado de pontos.
  // Ordem preservada (cima→cima): o fluxo desce sem se cruzar.
  private assignHeroTargets(list: Particle[]): void {
    const rect = this.heroRect();
    const side = rect ? Math.max(rect.width, 60) : 256;
    const n = Math.max(1, list.length);
    const hs = Math.max(2, Math.sqrt((side * side) / n));
    const cols = Math.max(1, Math.round(side / hs));

    const off = document.createElement('canvas');
    off.width = cols; off.height = cols;
    const octx = off.getContext('2d', { willReadFrequently: true })!;
    // object-fit: cover centralizado, igual ao <img> do hero
    const iw = this.heroSrc.naturalWidth, ih = this.heroSrc.naturalHeight;
    const s = Math.min(iw, ih);
    octx.drawImage(this.heroSrc, (iw - s) / 2, (ih - s) / 2, s, s, 0, 0, cols, cols);
    const px = octx.getImageData(0, 0, cols, cols).data;

    const cells: { u: number; v: number; lum: number }[] = [];
    for (let j = 0; j < cols; j++) for (let i = 0; i < cols; i++) {
      const k = (j * cols + i) * 4;
      cells.push({ u: (i + 0.5) / cols, v: (j + 0.5) / cols, lum: (0.299 * px[k] + 0.587 * px[k + 1] + 0.114 * px[k + 2]) / 255 });
    }

    const order = list.map((p, i) => i).sort((a, b) => (list[a].ly - list[b].ly) || (list[a].lx - list[b].lx));
    const cellR = (side / cols) * 0.5;
    order.forEach((pi, rank) => {
      const c = cells[Math.min(cells.length - 1, Math.floor(rank * cells.length / order.length))];
      const p = list[pi];
      p.hu = c.u; p.hv = c.v;
      p.hr = cellR * (0.3 + 0.7 * Math.pow(c.lum, 0.8));
    });
  }

  private tick(now: number): void {
    if (!this.ready) { this.running = false; return; }

    const stage = this.stageRef.nativeElement;
    const introH = stage.offsetHeight;
    const scrolled = window.scrollY - stage.offsetTop;
    const p = Math.min(1, Math.max(0, scrolled / introH));
    this.progress = p;

    // Foto real e header: entram no fim da descida.
    const photoO = smooth(0.86, 1, p);
    document.documentElement.style.setProperty('--hero-photo-o', photoO.toFixed(3));
    document.body.classList.toggle('intro-active', p < 0.55);
    const ui = 1 - smooth(0, 0.3, p);
    stage.style.setProperty('--intro-ui', ui.toFixed(3));
    stage.style.pointerEvents = ui < 0.05 ? 'none' : '';

    const steps = Math.min(4, Math.max(1, Math.round((now - this.last) / 16.67)));
    this.last = now;
    const prect = this.portraitRef.nativeElement.getBoundingClientRect();
    const hrect = this.heroRect();
    for (let i = 0; i < steps; i++) this.physics(p, prect, hrect);

    this.draw(p, prect);

    // Parado no portfolio (foto real visível) e sem movimento: dorme até a próxima rolagem.
    if (p >= 1 && this.particles.every(q => q.delay <= 0)) {
      this.ctx.clearRect(0, 0, this.vw, this.vh);
      this.running = false;
      return;
    }
    this.raf = requestAnimationFrame(t => this.tick(t));
  }

  private physics(p: number, prect: DOMRect, hrect: DOMRect | null): void {
    const R = this.MOUSE_RADIUS, R2 = R * R;
    const amp = this.step * 0.7;
    const mouseOn = this.mouse.active && p < 0.05;
    this.t += 0.016;
    this.ring += ((mouseOn ? 1 : 0) - this.ring) * 0.1;
    let settled = 0;

    for (const q of this.particles) {
      if (q.delay > 0) { q.delay -= 1; continue; }

      // alvo na intro (com flutuação nas bordas)
      const wob = q.e > 0.05 && !this.reduceMotion;
      let gx = prect.left + q.lx + (wob ? Math.sin(this.t * 0.9 + q.ph) * q.e * amp : 0);
      let gy = prect.top + q.ly + (wob ? Math.cos(this.t * 0.7 + q.ph) * q.e * amp : 0);

      // descida até a foto do hero
      if (hrect && p > 0) {
        const k = ease(Math.min(1, Math.max(0, (p - q.d) / (1 - 0.36))));
        const hx = hrect.left + q.hu * hrect.width;
        const hy = hrect.top + q.hv * hrect.height;
        gx = gx + (hx - gx) * k + Math.sin(k * Math.PI) * q.arc;
        gy = gy + (hy - gy) * k;
      }

      // durante a rolagem a mola fica mais firme para acompanhar a página
      const kSpring = p > 0 ? 0.14 : 0.06;
      let ax = (gx - q.x) * kSpring;
      let ay = (gy - q.y) * kSpring;

      if (mouseOn) {
        const dx = q.x - this.mouse.x, dy = q.y - this.mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < R2 && d2 > 0.01) {
          const d = Math.sqrt(d2);
          const f = (1 - d / R) * 6;
          ax += (dx / d) * f;
          ay += (dy / d) * f;
        }
      }

      q.vx = (q.vx + ax) * 0.78;
      q.vy = (q.vy + ay) * 0.78;
      q.x += q.vx;
      q.y += q.vy;
      if (Math.abs(gx - q.x) + Math.abs(gy - q.y) < 6) settled++;
    }
    const target = this.particles.length ? settled / this.particles.length : 0;
    this.formed += (target - this.formed) * 0.05;
  }

  private draw(p: number, prect: DOMRect): void {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.vw, this.vh);

    // silhueta só enquanto o retrato está na intro
    const silA = 0.92 * Math.min(1, this.formed * 1.4) * (1 - smooth(0, 0.25, p));
    if (this.silhouette && silA > 0.01) {
      ctx.globalAlpha = silA;
      ctx.drawImage(this.silhouette, prect.left, prect.top, this.PW, this.PH);
    }

    const dotsA = 1 - smooth(0.9, 1, p);
    if (dotsA > 0.01) {
      const ease = smooth(0.15, 0.95, p);
      ctx.beginPath();
      for (const q of this.particles) {
        if (q.delay > 0) continue;
        const r = q.r + (q.hr - q.r) * ease;
        ctx.moveTo(q.x + r, q.y);
        ctx.arc(q.x, q.y, r, 0, Math.PI * 2);
      }
      ctx.globalAlpha = dotsA;
      ctx.fillStyle = '#ff5a1f';
      ctx.fill();
    }

    if (this.ring > 0.02) {
      const { x, y } = this.mouse, R = this.MOUSE_RADIUS;
      ctx.globalAlpha = this.ring;
      const g = ctx.createRadialGradient(x, y, R * 0.55, x, y, R);
      g.addColorStop(0, 'rgba(255, 90, 31, 0)');
      g.addColorStop(0.8, 'rgba(255, 120, 60, 0.35)');
      g.addColorStop(1, 'rgba(255, 90, 31, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, R, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}

function smooth(a: number, b: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

function ease(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
