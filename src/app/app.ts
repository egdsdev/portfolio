import { Component, OnInit, OnDestroy, PLATFORM_ID, inject, signal } from '@angular/core';
import { Location, isPlatformBrowser } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { AnalyticsService } from './core/services/analytics.service';
import { LanguageService } from './core/i18n/language.service';
import { whenIdle } from './core/services/firebase.loader';
import { HeaderComponent } from './features/header/header.component';
import { IntroComponent } from './features/intro/intro.component';
import { PersonalDetailsComponent } from './features/personal-details/personal-details.component';
import { EducationComponent } from './features/education/education.component';
import { CasesComponent } from './features/cases/cases.component';
import { ExperienceComponent } from './features/experience/experience.component';
import { SkillsComponent } from './features/skills/skills.component';
import { ContactComponent } from './features/contact/contact.component';
import { MobileCtaComponent } from './shared/components/mobile-cta/mobile-cta.component';
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
    CasesComponent,
    SkillsComponent,
    ContactComponent,
    FooterComponent,
    MobileCtaComponent,
    RevealDirective,
  ],
  template: `
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
          @defer (hydrate on viewport) { <app-stats></app-stats> }
        </div>
        <div appReveal="up" [revealDelay]="0" [revealThreshold]="0.03">
          @defer (hydrate on viewport) { <app-experience></app-experience> }
        </div>
        <div appReveal="up" [revealDelay]="0" [revealThreshold]="0.03">
          @defer (hydrate on viewport) { <app-cases></app-cases> }
        </div>
        <div appReveal="up" [revealDelay]="0">
          @defer (hydrate on viewport) { <app-skills></app-skills> }
        </div>
        <div appReveal="up" [revealDelay]="0">
          @defer (hydrate on viewport) { <app-education></app-education> }
        </div>
        <!-- abaixo da dobra: o HTML já vem pronto; o JavaScript só ativa quando aparece na tela -->
        @defer (hydrate on viewport) { <app-contact></app-contact> }
        @defer (hydrate on viewport) { <app-footer></app-footer> }
        <app-mobile-cta></app-mobile-cta>
      </div>
      <router-outlet></router-outlet>
    }
  `,
  styleUrl: './app.css',
  host: { '(document:click)': 'onDocumentClick($event)' },
})
export class App implements OnInit, OnDestroy {
  private router = inject(Router);
  private analytics = inject(AnalyticsService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private visitTracked = false;
  // instancia já no boot: define a língua e o SEO (título, lang, canonical) também na pré-renderização
  private readonly i18n = inject(LanguageService);

  // Decide público × admin pela URL já na criação (servidor e navegador iguais no 1º quadro,
  // requisito da hidratação; esperar o 1º evento do router faria a página piscar).
  private readonly initialAdmin = inject(Location).path().startsWith('/admin');
  isAdmin = signal(this.initialAdmin);
  isAdminArea = signal(this.initialAdmin);


  isAdminRoute(): boolean {
    return this.isAdmin();
  }

  ngOnInit() {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
    ).subscribe((e) => this.onNavigated((e as NavigationEnd).urlAfterRedirects));
  }

  private onNavigated(url: string): void {
    const admin = url.startsWith('/admin');
    this.isAdmin.set(admin);
    this.isAdminArea.set(admin);
    if (this.visitTracked || admin || !this.isBrowser) return;
    this.visitTracked = true;
    // analytics (e o SDK do Firebase) só no navegador, depois da primeira pintura
    whenIdle(() => {
      void this.analytics.trackVisit();
      void this.analytics.trackSitePresence();
    });
  }

  /**
   * Links "#secao": rola na própria página. Com <base href="/portfolio/">, o comportamento
   * padrão levaria quem está em /portfolio/en/ de volta para a versão em português.
   */
  onDocumentClick(event: MouseEvent): void {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return;
    const link = (event.target as Element | null)?.closest?.('a[href^="#"]');
    const id = link?.getAttribute('href')?.slice(1);
    const target = id ? document.getElementById(id) : null;
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.replaceState(history.state, '', `${location.pathname}${location.search}#${id}`);
  }

  ngOnDestroy() {
    this.analytics.destroyPageTracking();
  }
}
