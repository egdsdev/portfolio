import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { TechMarqueeComponent } from '../../shared/components/tech-marquee/tech-marquee.component';
import { AnalyticsService } from '../../core/services/analytics.service';

@Component({
  selector: 'app-personal-details',
  standalone: true,
  imports: [TechMarqueeComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styleUrls: ['./personal-details.scss'],
  template: `
    <section id="detalhes" class="min-h-screen flex flex-col justify-center relative">
      <div class="relative z-10 w-full max-w-6xl mx-auto px-6 sm:px-8 pt-28 sm:pt-32 pb-12 sm:pb-16 flex-1 flex flex-col justify-center">
        <!-- Status -->
        <div class="inline-flex items-center gap-2.5 mb-7 sm:mb-10 eyebrow">
          <span class="relative flex h-1.5 w-1.5">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400"></span>
          </span>
          Disponível para novos projetos
        </div>

        <!-- Retrato grande à esquerda; nome e cargo ocupam o resto da linha -->
        <div class="hero-row mb-4">
          <div class="hero-photo rounded-2xl overflow-hidden border border-zinc-800">
            <img src="profile.jpg" alt="Elias Gomes da Silva" class="w-full h-full object-cover">
          </div>

          <div class="hero-info">
            <h1 class="display text-zinc-50 mb-4 sm:mb-5 hero-name">
              Elias Gomes da Silva
            </h1>

            <!-- min-h evita o layout "pular" enquanto o typewriter troca de frase -->
            <p class="text-lg sm:text-xl md:text-2xl text-zinc-400 font-normal leading-snug
                      min-h-[3.5rem] sm:min-h-[2.5rem]">
              {{ displayTitle() }}<span class="typewriter-cursor text-zinc-600">|</span>
            </p>

            <div class="eyebrow leading-relaxed mt-5">
              <span class="text-zinc-300">7+ anos de experiência</span>
              <span class="text-zinc-700 mx-2">·</span>
              <span class="text-zinc-500">Goiânia, GO</span>
            </div>

            <div class="flex flex-wrap items-center gap-3 mt-8">
              <a href="#contato" (click)="onHeroContactClick()" class="btn-primary">
                Entre em contato
              </a>
              <a href="curriculo-elias-gomes.pdf"
                 download="Curriculo-Elias-Gomes-da-Silva.pdf"
                 (click)="onResumeDownload($event)"
                 class="btn-ghost">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Currículo
              </a>
            </div>
          </div>
        </div>

      </div>

      <!-- Marquee em faixa própria na base da dobra -->
      <div class="relative z-10 border-t border-zinc-900 py-6">
        <app-tech-marquee></app-tech-marquee>
      </div>
    </section>
  `
})
export class PersonalDetailsComponent implements OnInit, OnDestroy {
  private analytics = inject(AnalyticsService);

  readonly titles = [
    'Engenheiro de Computação',
    'Desenvolvedor Full Stack Sênior',
    'Arquitetura, infraestrutura e banco de dados',
    'Supervisor de Backend · PHP, Laravel, Python',
  ];

  displayTitle = signal(this.titles[0]);
  private titleIdx = 0;
  private charIdx = this.titles[0].length;
  private deleting = false;
  private timer?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    this.timer = setTimeout(() => this.tick(), 3000);
  }

  ngOnDestroy(): void {
    if (this.timer) clearTimeout(this.timer);
  }

  private tick(): void {
    const target = this.titles[this.titleIdx];
    if (!this.deleting) {
      this.displayTitle.set(target.slice(0, ++this.charIdx));
      if (this.charIdx === target.length) {
        this.deleting = true;
        this.timer = setTimeout(() => this.tick(), 2200);
        return;
      }
    } else {
      this.displayTitle.set(target.slice(0, --this.charIdx));
      if (this.charIdx === 0) {
        this.deleting = false;
        this.titleIdx = (this.titleIdx + 1) % this.titles.length;
        this.timer = setTimeout(() => this.tick(), 400);
        return;
      }
    }
    this.timer = setTimeout(() => this.tick(), this.deleting ? 40 : 80);
  }

  onHeroContactClick(): void {
    void this.analytics.trackCtaClick('hero_contact', 'detalhes', 'contact');
  }

  onResumeDownload(event: MouseEvent): void {
    const anchor = event.currentTarget;
    if (!(anchor instanceof HTMLAnchorElement)) return;

    event.preventDefault();
    void this.waitForTracking(this.analytics.trackResumeDownload())
      .finally(() => this.triggerDownload(anchor));
  }

  private waitForTracking(tracking: Promise<void>, timeoutMs = 400): Promise<void> {
    return Promise.race([
      tracking.catch(() => undefined),
      new Promise<void>(resolve => window.setTimeout(resolve, timeoutMs)),
    ]);
  }

  private triggerDownload(anchor: HTMLAnchorElement): void {
    const downloadLink = document.createElement('a');
    downloadLink.href = anchor.href;

    const fileName = anchor.getAttribute('download');
    if (fileName) {
      downloadLink.download = fileName;
    }

    downloadLink.style.display = 'none';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();
  }
}
