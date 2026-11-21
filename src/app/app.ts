import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { AnalyticsService } from './core/services/analytics.service';
import { HeaderComponent } from './features/header/header.component';
import { IntroComponent } from './features/intro/intro.component';
import { PersonalDetailsComponent } from './features/personal-details/personal-details.component';
import { EducationComponent } from './features/education/education.component';
import { ExperienceComponent } from './features/experience/experience.component';
import { SkillsComponent } from './features/skills/skills.component';
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
    IntroComponent,
    PersonalDetailsComponent,
    StatsComponent,
    EducationComponent,
    ExperienceComponent,
    SkillsComponent,
    ContactComponent,
    FooterComponent,
    RevealDirective,
  ],
  template: `
    @if (routerResolved()) {
      @if (!isAdminArea()) {
        <app-header></app-header>
      }
      @if (isAdminRoute()) {
        <router-outlet></router-outlet>
      } @else {
        <div class="min-h-screen relative">
          <app-intro></app-intro>
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
            <app-education></app-education>
          </div>
          <app-contact></app-contact>
          <app-footer></app-footer>
        </div>
        <router-outlet></router-outlet>
      }
    }
  `,
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {
  private router = inject(Router);
  private analytics = inject(AnalyticsService);

  routerResolved = signal(false);
  isAdmin = signal(false);
  isAdminArea = signal(false);


  isAdminRoute(): boolean {
    return this.isAdmin();
  }

  ngOnInit() {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
    ).subscribe((e) => {
      const url = (e as NavigationEnd).urlAfterRedirects;
      const admin = url.startsWith('/admin');
      const recruiter = url.startsWith('/recruiter');
      this.isAdmin.set(admin || recruiter);
      this.isAdminArea.set(admin);
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
    this.analytics.destroyPageTracking();
  }
}
