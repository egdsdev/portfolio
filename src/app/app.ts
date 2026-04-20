import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { AnalyticsService } from './core/services/analytics.service';
import { FirebaseService } from './core/services/firebase.service';
import { HeaderComponent } from './features/header/header.component';
import { PersonalDetailsComponent } from './features/personal-details/personal-details.component';
import { EducationComponent } from './features/education/education.component';
import { ExperienceComponent } from './features/experience/experience.component';
import { SkillsComponent } from './features/skills/skills.component';
import { DevMatchComponent } from './features/dev-match/dev-match.component';
import { CertificationsComponent } from './features/certifications/certifications.component';
import { PortfolioComponent } from './features/portfolio/portfolio.component';
import { ContactComponent } from './features/contact/contact.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { StatsComponent } from './features/stats/stats.component';
import { GithubStatsComponent } from './features/stats/github-stats.component';
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
    DevMatchComponent,
    CertificationsComponent,
    PortfolioComponent,
    ContactComponent,
    FooterComponent,
    RevealDirective,
    GithubStatsComponent,
  ],
  template: `
    <div class="starfield">
      <div class="stars stars-sm"></div>
      <div class="stars stars-md"></div>
      <div class="stars stars-lg"></div>
    </div>
    @if (routerResolved()) {
      <app-header></app-header>
      @if (isAdminRoute()) {
        <router-outlet></router-outlet>
      } @else {
        <div class="min-h-screen text-gray-100 relative">
          <app-personal-details></app-personal-details>
          <div appReveal="fade" [revealDelay]="0">
            <app-stats></app-stats>
          </div>
          <div appReveal="up" [revealDelay]="0">
            <app-education></app-education>
          </div>
          <div appReveal="up" [revealDelay]="0" [revealThreshold]="0.03">
            <app-experience></app-experience>
          </div>
          <div appReveal="up" [revealDelay]="0">
            <app-skills></app-skills>
          </div>
          <!-- GitHub stats: oculto temporariamente -->
          @if (false) {
            <div appReveal="up" [revealDelay]="0">
              <app-github-stats></app-github-stats>
            </div>
          }
          <div appReveal="up" [revealDelay]="0">
            <app-portfolio></app-portfolio>
          </div>
          <div appReveal="up" [revealDelay]="0">
            <app-dev-match></app-dev-match>
          </div>
          <div appReveal="up" [revealDelay]="0">
            <app-certifications></app-certifications>
          </div>
          <app-contact></app-contact>
          <app-footer></app-footer>
        </div>
        <!-- Botão flutuante de chat (só fora da rota admin e não autenticado) -->
        @if (!isAdminRoute() && !isAuthenticated()) {
          <button (click)="openChat()"
                  class="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-2.5 rounded-xl
                         bg-violet-600 hover:bg-violet-500 active:scale-95 text-white text-sm font-medium
                         shadow-lg shadow-violet-900/40 transition-all duration-200 cursor-pointer border border-violet-500/30">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>Fale Comigo<span class="hidden sm:inline"> Aqui</span></span>
          </button>
        }
        <router-outlet></router-outlet>
      }
    }
  `,
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {
  private themeObserver?: MutationObserver;
  private unsubAuth?: () => void;
  private router = inject(Router);
  private analytics = inject(AnalyticsService);
  private firebase = inject(FirebaseService);

  routerResolved = signal(false);
  isAdmin = signal(false);
  isAuthenticated = signal(false);

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
      this.isAdmin.set(admin);
      if (!this.routerResolved()) {
        this.routerResolved.set(true);
        if (!admin) {
          this.analytics.trackVisit();
          this.analytics.trackSitePresence();
        }
      }
    });

    this.themeObserver = new MutationObserver(() => {
      const html = document.documentElement;
      const theme = html.classList.contains('light') ? 'light' : 'dark';
      localStorage.setItem('portfolio-theme', theme);
    });

    this.themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
  }

  ngOnDestroy() {
    this.unsubAuth?.();
    this.themeObserver?.disconnect();
    this.analytics.destroyPageTracking();
  }

  openChat(): void {
    window.dispatchEvent(new CustomEvent('open-chat'));
  }
}
