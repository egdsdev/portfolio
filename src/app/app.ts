import { Component, OnInit, OnDestroy, inject, signal, HostListener } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { AnalyticsService } from './core/services/analytics.service';
import { FirebaseService } from './core/services/firebase.service';
import { HeaderComponent } from './features/header/header.component';
import { PersonalDetailsComponent } from './features/personal-details/personal-details.component';
import { EducationComponent } from './features/education/education.component';
import { ExperienceComponent } from './features/experience/experience.component';
import { SkillsComponent } from './features/skills/skills.component';
import { PortfolioComponent } from './features/portfolio/portfolio.component';
import { ContactComponent } from './features/contact/contact.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { StatsComponent } from './features/stats/stats.component';
import { RevealDirective } from './shared/directives/reveal.directive';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    PersonalDetailsComponent,
    StatsComponent,
    EducationComponent,
    ExperienceComponent,
    SkillsComponent,
    PortfolioComponent,
    ContactComponent,
    FooterComponent,
    RevealDirective,
  ],
  template: `
    @if (routerResolved()) {
      <app-header></app-header>
      @if (isAdminRoute()) {
        <router-outlet></router-outlet>
      } @else {
        <div class="min-h-screen relative">
          <app-personal-details></app-personal-details>
          <div appReveal="fade" [revealDelay]="0">
            <app-stats></app-stats>
          </div>
          <div appReveal="up" [revealDelay]="0" [revealThreshold]="0.03">
            <app-experience></app-experience>
          </div>
          <div appReveal="up" [revealDelay]="0">
            <app-skills></app-skills>
          </div>
          <div appReveal="up" [revealDelay]="0">
            <app-portfolio></app-portfolio>
          </div>
          <div appReveal="up" [revealDelay]="0">
            <app-education></app-education>
          </div>
          <app-contact></app-contact>
          <app-footer></app-footer>
        </div>
        <!-- Botão flutuante de chat (só fora da rota admin e não autenticado) -->
        @if (!isAdminRoute() && !isAuthenticated()) {
          <button (click)="openChat()"
                  class="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-2.5 rounded-xl
                         bg-zinc-100 hover:bg-white active:scale-95 text-zinc-900 text-sm font-medium
                         shadow-lg shadow-black/40 transition-all duration-200 cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>Fale Comigo<span class="hidden sm:inline"> Aqui</span></span>
          </button>
        }
        <!-- CTA flutuante contextual -->
        @if (!isAdminRoute() && !isAuthenticated() && contextualCtaVisible()) {
          <div class="fixed bottom-24 right-6 left-6 sm:bottom-6 sm:left-6 sm:right-auto z-40 flex items-center gap-2 rounded-xl
                      bg-zinc-900/95 border border-zinc-800 backdrop-blur-md
                      shadow-xl px-4 py-2.5 max-w-full sm:max-w-xs">
            @if (contextualCta() === 'experience') {
              <a href="#contato" (click)="contextualCtaVisible.set(false)"
                 class="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-100 transition-colors">
                Tem uma vaga? <span class="font-medium text-zinc-100">Vamos conversar</span>
              </a>
            } @else if (contextualCta() === 'projetos') {
              <a href="https://github.com/egdsdev" target="_blank" rel="noopener"
                 (click)="contextualCtaVisible.set(false)"
                 class="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-100 transition-colors">
                Ver mais no <span class="font-medium text-zinc-100">GitHub</span>
              </a>
            }
            <button (click)="contextualCtaVisible.set(false)"
                    class="ml-2 text-zinc-600 hover:text-zinc-400 transition-colors text-xs">✕</button>
          </div>
        }
        <router-outlet></router-outlet>
      }
    }
  `,
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {
  private unsubAuth?: () => void;
  private router = inject(Router);
  private analytics = inject(AnalyticsService);
  private firebase = inject(FirebaseService);

  routerResolved = signal(false);
  isAdmin = signal(false);
  isAuthenticated = signal(false);
  contextualCta = signal<'experience' | 'projetos' | null>(null);
  contextualCtaVisible = signal(false);

  @HostListener('window:scroll')
  onScroll(): void {
    if (this.isAdmin()) return;
    const expEl = document.getElementById('experiencia');
    const projEl = document.getElementById('projetos');
    if (!expEl && !projEl) return;

    const scrollY = window.scrollY + window.innerHeight * 0.4;

    if (projEl && scrollY >= projEl.getBoundingClientRect().top + window.scrollY) {
      if (this.contextualCta() !== 'projetos') {
        this.contextualCta.set('projetos');
        this.contextualCtaVisible.set(true);
      }
    } else if (expEl && scrollY >= expEl.getBoundingClientRect().top + window.scrollY) {
      if (this.contextualCta() !== 'experience') {
        this.contextualCta.set('experience');
        this.contextualCtaVisible.set(true);
      }
    } else {
      this.contextualCtaVisible.set(false);
    }
  }

  isAdminRoute(): boolean {
    return this.isAdmin();
  }

  ngOnInit() {
    this.unsubAuth = this.firebase.listenAuthState(loggedIn => this.isAuthenticated.set(loggedIn));

    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
    ).subscribe((e) => {
      const url = (e as NavigationEnd).urlAfterRedirects;
      const admin = url.startsWith('/admin');
      const recruiter = url.startsWith('/recruiter');
      this.isAdmin.set(admin || recruiter);
      if (!this.routerResolved()) {
        this.routerResolved.set(true);
        if (!admin) {
          this.analytics.trackVisit();
          this.analytics.trackSitePresence();
        }
      }
    });
  }

  ngOnDestroy() {
    this.unsubAuth?.();
    this.analytics.destroyPageTracking();
  }

  openChat(): void {
    window.dispatchEvent(new CustomEvent('open-chat'));
  }
}
