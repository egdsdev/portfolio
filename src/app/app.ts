import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { AnalyticsService } from './core/services/analytics.service';
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
            <app-dev-match></app-dev-match>
          </div>
          <div appReveal="up" [revealDelay]="0">
            <app-certifications></app-certifications>
          </div>
          <div appReveal="up" [revealDelay]="0">
            <app-portfolio></app-portfolio>
          </div>
          <div appReveal="up" [revealDelay]="0">
            <app-contact></app-contact>
          </div>
          <app-footer></app-footer>
        </div>
        <router-outlet></router-outlet>
      }
    }
  `,
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {
  private themeObserver?: MutationObserver;
  private router = inject(Router);
  private analytics = inject(AnalyticsService);

  routerResolved = signal(false);
  isAdmin = signal(false);

  isAdminRoute(): boolean {
    return this.isAdmin();
  }

  ngOnInit() {
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
    this.themeObserver?.disconnect();
  }
}
