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
    <section id="detalhes" class="min-h-screen pt-20 flex items-center justify-center relative overflow-hidden">
      <!-- Círculos decorativos -->
      <div class="absolute top-20 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div class="absolute top-20 right-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div class="absolute -bottom-8 left-40 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

      <div class="relative z-10 text-center justify-center px-8 flex flex-col items-center">
        <!-- Avatar -->
        <div class="relative inline-flex items-center justify-center mb-5">
          <div class="avatar-ring w-32 h-32 rounded-full border-2 border-cyan-400/40 overflow-hidden">
            <img src="profile.jpg" alt="Elias Gomes" class="w-full h-full object-cover object-top">
          </div>
          <span class="absolute top-1 right-1 flex h-4 w-4">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-4 w-4 bg-green-500 border-2 border-gray-900"></span>
          </span>
        </div>

        <!-- Badge -->
        <div class="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full border border-cyan-500/30 bg-cyan-500/5 text-cyan-300 text-sm font-medium">
          <span class="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
          Disponível para novos projetos
        </div>

        <h1 class="text-5xl md:text-6xl font-bold mb-3 text-gradient-name">
          Elias Gomes da Silva
        </h1>
        <p class="text-xl md:text-2xl text-gray-300 opacity-90 mb-2">{{ displayTitle() }}<span class="typewriter-cursor">|</span></p>
        <p class="text-gray-500 text-xs tracking-widest uppercase font-mono mb-10">PHP · Python · Angular · Cloud</p>

        <app-tech-marquee></app-tech-marquee>

        <div class="mt-10 flex flex-wrap justify-center gap-4">
          <a href="#contato"
             (click)="onHeroContactClick()"
             class="inline-block px-10 py-3.5 bg-linear-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-full
                    transform hover:scale-105 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/40 text-sm tracking-wide contact-btn">
            Entre em Contato
          </a>
          <a href="curriculo-elias-gomes.pdf"
             download="Curriculo-Elias-Gomes-da-Silva.pdf"
             (click)="onResumeDownload()"
             class="inline-flex items-center gap-2 px-8 py-3.5 border border-cyan-500/50 text-cyan-300 font-semibold rounded-full
                    transform hover:scale-105 transition-all duration-300 hover:bg-cyan-500/10 hover:border-cyan-400 text-sm tracking-wide">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Baixar Currículo
          </a>
        </div>
      </div>

      <!-- Scroll indicator: oculto no mobile para não sobrepor os botões -->
      <div class="absolute bottom-8 left-1/2 -translate-x-1/2 hidden sm:flex flex-col items-center gap-1 text-gray-500 scroll-indicator z-10">
        <span class="text-xs tracking-widest uppercase font-mono">scroll</span>
        <div class="w-5 h-8 border border-gray-500 rounded-full flex justify-center pt-1.5 scroll-mouse">
          <div class="scroll-dot w-1 h-2 bg-cyan-400 rounded-full"></div>
        </div>
      </div>
    </section>
  `
})
export class PersonalDetailsComponent implements OnInit, OnDestroy {
  private analytics = inject(AnalyticsService);

  readonly titles = [
    'Desenvolvedor Full Stack',
    'Engenheiro de Software',
    'Especialista em PHP & Laravel',
    'Arquiteto de Backend',
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

  onResumeDownload(): void {
    void this.analytics.trackResumeDownload();
  }
}
