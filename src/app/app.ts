import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { AnalyticsService } from './core/services/analytics.service';
import { HeaderComponent } from './features/header/header.component';
import { PersonalDetailsComponent } from './features/personal-details/personal-details.component';
import { EducationComponent } from './features/education/education.component';
import { ExperienceComponent } from './features/experience/experience.component';
import { SkillsComponent } from './features/skills/skills.component';
import { DevMatchComponent } from './features/dev-match/dev-match.component';
import { CertificationsComponent } from './features/certifications/certifications.component';
import { ContactComponent } from './features/contact/contact.component';
import { FooterComponent } from './shared/components/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    PersonalDetailsComponent,
    EducationComponent,
    ExperienceComponent,
    SkillsComponent,
    DevMatchComponent,
    CertificationsComponent,
    ContactComponent,
    FooterComponent
  ],
  template: `
    <div class="starfield">
      <div class="stars stars-sm"></div>
      <div class="stars stars-md"></div>
      <div class="stars stars-lg"></div>
    </div>
    <app-header></app-header>
    @if (isAdminRoute()) {
      <router-outlet></router-outlet>
    } @else {
      <div class="min-h-screen text-gray-100 relative">
        <app-personal-details></app-personal-details>
        <app-education></app-education>
        <app-experience></app-experience>
        <app-skills></app-skills>
        <app-dev-match></app-dev-match>
        <app-certifications></app-certifications>
        <app-contact></app-contact>
        <app-footer></app-footer>
      </div>
      <router-outlet></router-outlet>
    }
  `,
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {
  private themeObserver?: MutationObserver;
  private router = inject(Router);
  private analytics = inject(AnalyticsService);

  isAdminRoute(): boolean {
    return this.router.url.startsWith('/admin');
  }

  ngOnInit() {
    if (!this.isAdminRoute()) {
      this.analytics.trackVisit();
    }

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
