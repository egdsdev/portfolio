import { Component, computed, signal, inject, OnInit, OnDestroy, ChangeDetectorRef, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faGithub, faLinkedinIn, faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope } from '@fortawesome/free-regular-svg-icons';
import { lazyFirebase, whenIdle } from '../../core/services/firebase.loader';
import { AnalyticsService } from '../../core/services/analytics.service';
import { LanguageService } from '../../core/i18n/language.service';
import { LangSwitchComponent } from '../../shared/components/lang-switch/lang-switch.component';

const COPY = {
  pt: { exp: 'Experiência', cases: 'Cases', edu: 'Formação', contact: 'Contato', logout: 'Sair',
        open: 'Abrir menu', close: 'Fechar menu', cv: 'Baixar currículo (PDF)', socials: 'Redes e contato' },
  en: { exp: 'Experience', cases: 'Case studies', edu: 'Education', contact: 'Contact', logout: 'Log out',
        open: 'Open menu', close: 'Close menu', cv: 'Download résumé (PDF)', socials: 'Social and contact' },
};

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, FontAwesomeModule, LangSwitchComponent],
  template: `
    <!-- Barra de progresso de scroll -->
    <div class="progress-bar-wrap fixed top-0 left-0 right-0 z-51 h-px pointer-events-none">
      <div class="progress-bar h-full transition-none"
           [style.width.%]="scrollProgress()"></div>
    </div>

    <!-- Header Desktop: oculto no mobile -->
    <nav class="nav-desktop fixed top-0 left-0 right-0 bg-zinc-950/80 backdrop-blur-xl z-50 border-b border-zinc-900">
      <div class="wrap h-14 flex items-center justify-between">
        <a href="#detalhes" class="text-zinc-100 font-medium text-sm tracking-tight hover:text-white transition-colors">Elias Gomes</a>
        <ul class="nav-links items-center gap-7">
          <li><a href="#experiencia" class="nav-link text-sm">{{ t().exp }}</a></li>
          <li><a href="#cases" class="nav-link text-sm">{{ t().cases }}</a></li>
          <li><a href="#habilidades" class="nav-link text-sm">Skills</a></li>
          <li><a href="#escolaridade" class="nav-link text-sm">{{ t().edu }}</a></li>
          <li><app-lang-switch /></li>
          <li><a href="#contato" (click)="trackNavClick('contato', 'desktop')" class="px-4 py-1.5 rounded-lg bg-zinc-100 text-zinc-900 hover:bg-white transition-colors text-sm font-medium">{{ t().contact }}</a></li>
          @if (loggedIn()) {
            <li class="flex items-center gap-4">
              <a routerLink="/admin" class="nav-link text-sm">Dashboard</a>
              <button (click)="logout()" class="px-3 py-1.5 rounded-lg border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:border-zinc-700 text-sm transition-colors cursor-pointer">
                {{ t().logout }}
              </button>
            </li>
          }
        </ul>
      </div>
    </nav>

    <!-- Botão Hambúrguer: visível somente no mobile -->
    <button
      class="nav-burger fixed top-2 right-4 sm:right-6 z-70 items-center justify-center w-10 h-10 rounded-lg border border-zinc-800 text-zinc-300 transition-colors hover:text-white"
      (click)="toggleMenu()"
      [attr.aria-label]="isOpen() ? t().close : t().open" [attr.aria-expanded]="isOpen()">
      @if (isOpen()) {
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      } @else {
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
      }
    </button>

    <!-- Overlay escuro -->
    <div
      class="nav-mobile-only fixed inset-0 bg-black/70 z-55 transition-opacity duration-300"
      [class.opacity-0]="!isOpen()"
      [class.pointer-events-none]="!isOpen()"
      [class.opacity-100]="isOpen()"
      (click)="closeMenu()">
    </div>

    <!-- Drawer lateral esquerdo -->
    <aside
      class="nav-drawer fixed top-0 left-0 h-full w-64 bg-zinc-950 border-r border-zinc-900 z-60 transform transition-transform duration-300 ease-in-out flex flex-col"
      [class.-translate-x-full]="!isOpen()"
      [class.translate-x-0]="isOpen()">

      <div class="p-5 border-b border-zinc-900 flex items-center justify-between">
        <a href="#detalhes" class="text-zinc-100 font-medium text-sm" (click)="closeMenu()">Elias Gomes</a>
        <app-lang-switch />
      </div>

      <nav class="flex flex-col p-6 gap-5">
        <a href="#experiencia" class="nav-link text-sm py-1" (click)="closeMenu()">{{ t().exp }}</a>
        <a href="#cases" class="nav-link text-sm py-1" (click)="closeMenu()">{{ t().cases }}</a>
        <a href="#habilidades" class="nav-link text-sm py-1" (click)="closeMenu()">Skills</a>
        <a href="#escolaridade" class="nav-link text-sm py-1" (click)="closeMenu()">{{ t().edu }}</a>
        <a href="#contato" class="mt-2 px-4 py-2 rounded-lg bg-zinc-100 text-zinc-900 hover:bg-white transition-colors text-sm font-medium text-center" (click)="trackNavClick('contato', 'mobile'); closeMenu()">{{ t().contact }}</a>
        @if (loggedIn()) {
          <div class="border-t border-zinc-900 pt-4 mt-2 flex flex-col gap-4">
            <a routerLink="/admin" class="nav-link text-sm" (click)="closeMenu()">Dashboard</a>
            <button (click)="logout(); closeMenu()" class="text-zinc-500 hover:text-zinc-300 transition-colors text-sm text-left">{{ t().logout }}</button>
          </div>
        }
      </nav>

      <div class="mt-auto p-6 border-t border-zinc-900 flex flex-col gap-4">
        <a [href]="i18n.resume().href" [attr.download]="i18n.resume().file"
           class="flex items-center gap-2 text-sm text-zinc-300 hover:text-white transition-colors"
           (click)="trackDrawerResume(); closeMenu()">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          {{ t().cv }}
        </a>
        <ul class="flex items-center gap-1 -ml-2" [attr.aria-label]="t().socials">
          @for (s of socials; track s.label) {
            <li>
              <a [href]="s.href" [attr.target]="s.href.startsWith('http') ? '_blank' : null" rel="noopener noreferrer"
                 class="inline-flex items-center justify-center w-10 h-10 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
                 [attr.aria-label]="s.label" [title]="s.label" (click)="closeMenu()">
                <fa-icon [icon]="s.icon"></fa-icon>
              </a>
            </li>
          }
        </ul>
      </div>
    </aside>
  `,
  styles: [`
    /* Visibilidade responsiva do menu — media query própria, à prova de falha do pipeline Tailwind */
    .nav-links { display: none; }
    .nav-burger { display: none; }

    @media (min-width: 768px) {
      .nav-links { display: flex; }
      .nav-burger,
      .nav-mobile-only,
      .nav-drawer { display: none !important; }
    }

    @media (max-width: 767px) {
      .nav-burger { display: flex; }
    }

    .progress-bar-wrap { background: transparent; }
    .progress-bar { background: var(--fg); }
  `]
})
export class HeaderComponent implements OnInit, OnDestroy {
  readonly i18n = inject(LanguageService);
  readonly t = computed(() => COPY[this.i18n.lang()]);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private firebase = lazyFirebase();
  private analytics = inject(AnalyticsService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  isOpen = signal(false);
  loggedIn = signal(false);
  scrollProgress = signal(0);

  private onScroll = () => {
    const doc = document.documentElement;
    const scrolled = doc.scrollTop || document.body.scrollTop;
    const total = doc.scrollHeight - doc.clientHeight;
    this.scrollProgress.set(total > 0 ? Math.round((scrolled / total) * 1000) / 10 : 0);
  };

  ngOnInit() {
    if (!this.isBrowser) return;
    // login só importa para o dono do site: verifica depois da primeira pintura
    whenIdle(() => void this.checkAuth(), 4000);
    window.addEventListener('scroll', this.onScroll, { passive: true });
  }

  ngOnDestroy() {
    if (!this.isBrowser) return;
    window.removeEventListener('scroll', this.onScroll);
  }

  private async checkAuth() {
    const logged = await (await this.firebase()).isLoggedIn();
    this.loggedIn.set(logged);
    this.cdr.detectChanges();
  }

  async logout() {
    await (await this.firebase()).logout();
    this.loggedIn.set(false);
    this.cdr.detectChanges();
    this.router.navigate(['/']);
  }

  toggleMenu() {
    this.isOpen.update(v => !v);
  }

  closeMenu() {
    this.isOpen.set(false);
  }

  readonly socials = [
    { label: 'GitHub', href: 'https://github.com/egdsdev', icon: faGithub },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/egdsdev/', icon: faLinkedinIn },
    { label: 'WhatsApp', href: 'https://wa.me/5564981476096', icon: faWhatsapp },
    { label: 'Email', href: 'mailto:egds.dev@gmail.com', icon: faEnvelope },
  ];

  trackDrawerResume(): void {
    void this.analytics.trackCtaClick('menu_resume', 'navigation', 'resume');
  }

  trackNavClick(targetSection: 'contato', surface: 'desktop' | 'mobile'): void {
    void this.analytics.trackCtaClick(`nav_${targetSection}`, targetSection, 'navigation', { surface });
  }
}
