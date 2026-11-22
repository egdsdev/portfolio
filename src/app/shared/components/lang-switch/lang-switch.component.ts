import { Component, inject } from '@angular/core';
import { LanguageService, Lang } from '../../../core/i18n/language.service';
import { AnalyticsService } from '../../../core/services/analytics.service';

/** Seletor PT · EN: abre a página pré-renderizada de cada idioma (/ e /en/). */
@Component({
  selector: 'app-lang-switch',
  standalone: true,
  template: `
    <nav class="lang" [attr.aria-label]="i18n.isEn() ? 'Language' : 'Idioma'">
      <a href="./" hreflang="pt-BR" lang="pt-BR" title="Português"
         [class.is-active]="!i18n.isEn()" [attr.aria-current]="i18n.isEn() ? null : 'page'" (click)="track('pt')">PT</a>
      <span aria-hidden="true">·</span>
      <a href="en/" hreflang="en" lang="en" title="English"
         [class.is-active]="i18n.isEn()" [attr.aria-current]="i18n.isEn() ? 'page' : null" (click)="track('en')">EN</a>
    </nav>
  `,
  styles: [`
    .lang {
      display: inline-flex;
      align-items: center;
      gap: .45rem;
      font-family: var(--font-mono);
      font-size: .75rem;
      letter-spacing: .12em;
      color: var(--fg-faint);
    }
    .lang a {
      display: inline-flex;
      align-items: center;
      min-height: 2rem;
      padding: 0 .15rem;
      color: var(--fg-muted);
      transition: color .2s;
    }
    .lang a:hover, .lang a:focus-visible { color: var(--fg); }
    .lang a.is-active { color: var(--fg); text-decoration: underline; text-underline-offset: .35em; text-decoration-color: #ff5a1f; }
  `],
})
export class LangSwitchComponent {
  readonly i18n = inject(LanguageService);
  private analytics = inject(AnalyticsService);

  track(lang: Lang): void {
    if (lang !== this.i18n.lang()) void this.analytics.trackCtaClick(`lang_${lang}`, 'navigation', 'navigation');
  }
}
