import { Component, signal, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FirebaseService } from '../../core/services/firebase.service';
import { AnalyticsService } from '../../core/services/analytics.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  template: `
    <!-- Barra de progresso de scroll -->
    <div class="progress-bar-wrap fixed top-0 left-0 right-0 z-51 h-px pointer-events-none">
      <div class="progress-bar h-full transition-none"
           [style.width.%]="scrollProgress()"></div>
    </div>

    <!-- Header Desktop: oculto no mobile -->
    <nav class="nav-desktop fixed top-0 left-0 right-0 bg-zinc-950/80 backdrop-blur-xl z-50 border-b border-zinc-900">
      <div class="max-w-6xl mx-auto px-8 py-4 flex items-center justify-between">
        <a href="#detalhes" class="text-zinc-100 font-medium text-sm tracking-tight hover:text-white transition-colors">Elias Gomes</a>
        <ul class="flex items-center space-x-7">
          <li><a href="#experiencia" class="nav-link text-sm">Experiência</a></li>
          <li><a href="#habilidades" class="nav-link text-sm">Skills</a></li>
          <li><a href="#projetos" (click)="trackNavClick('projetos', 'desktop')" class="nav-link text-sm">Projetos</a></li>
          <li><a href="#escolaridade" class="nav-link text-sm">Formação</a></li>
          <li><a href="#contato" (click)="trackNavClick('contato', 'desktop')" class="px-4 py-1.5 rounded-lg bg-zinc-100 text-zinc-900 hover:bg-white transition-colors text-sm font-medium">Contato</a></li>
          @if (loggedIn()) {
            <li class="flex items-center gap-4">
              <a routerLink="/admin" class="nav-link text-sm">Dashboard</a>
              <button (click)="logout()" class="px-3 py-1.5 rounded-lg border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:border-zinc-700 text-sm transition-colors cursor-pointer">
                Sair
              </button>
            </li>
          } @else {
            <li class="flex items-center">
              <a routerLink="/admin/login" class="text-zinc-700 hover:text-zinc-500 transition-colors" title="Admin"><svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg></a>
            </li>
          }
        </ul>
      </div>
    </nav>

    <!-- Botão Hambúrguer: visível somente no mobile -->
    <button
      class="nav-burger fixed top-4 right-4 z-70 items-center justify-center w-10 h-10 rounded-lg bg-zinc-900/90 backdrop-blur-md border border-zinc-800 text-zinc-300 transition-colors hover:text-white"
      (click)="toggleMenu()"
      aria-label="Abrir menu">
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

      <div class="p-5 border-b border-zinc-900">
        <a href="#detalhes" class="text-zinc-100 font-medium text-sm" (click)="closeMenu()">Elias Gomes</a>
      </div>

      <nav class="flex flex-col p-6 gap-5">
        <a href="#experiencia" class="nav-link text-sm py-1" (click)="closeMenu()">Experiência</a>
        <a href="#habilidades" class="nav-link text-sm py-1" (click)="closeMenu()">Skills</a>
        <a href="#projetos" class="nav-link text-sm py-1" (click)="trackNavClick('projetos', 'mobile'); closeMenu()">Projetos</a>
        <a href="#escolaridade" class="nav-link text-sm py-1" (click)="closeMenu()">Formação</a>
        <a href="#contato" class="mt-2 px-4 py-2 rounded-lg bg-zinc-100 text-zinc-900 hover:bg-white transition-colors text-sm font-medium text-center" (click)="trackNavClick('contato', 'mobile'); closeMenu()">Contato</a>
        @if (loggedIn()) {
          <div class="border-t border-zinc-900 pt-4 mt-2 flex flex-col gap-4">
            <a routerLink="/admin" class="nav-link text-sm" (click)="closeMenu()">Dashboard</a>
            <button (click)="logout(); closeMenu()" class="text-zinc-500 hover:text-zinc-300 transition-colors text-sm text-left">Sair</button>
          </div>
        } @else {
          <a routerLink="/admin/login" class="text-zinc-700 hover:text-zinc-500 transition-colors text-xs flex items-center gap-1.5 mt-2 pt-4 border-t border-zinc-900" (click)="closeMenu()"><svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg> Admin</a>
        }
      </nav>
    </aside>
  `,
  styles: [`
    /* Visibilidade responsiva do menu — media query própria, à prova de falha do pipeline Tailwind */
    .nav-desktop { display: none; }
    .nav-burger { display: none; }

    @media (min-width: 768px) {
      .nav-desktop { display: block; }
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
  private firebase = inject(FirebaseService);
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
    this.checkAuth();
    window.addEventListener('scroll', this.onScroll, { passive: true });
  }

  ngOnDestroy() {
    window.removeEventListener('scroll', this.onScroll);
  }

  private async checkAuth() {
    const logged = await this.firebase.isLoggedIn();
    this.loggedIn.set(logged);
    this.cdr.detectChanges();
  }

  async logout() {
    await this.firebase.logout();
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

  trackNavClick(targetSection: 'projetos' | 'contato', surface: 'desktop' | 'mobile'): void {
    void this.analytics.trackCtaClick(`nav_${targetSection}`, targetSection, 'navigation', { surface });
  }
}
