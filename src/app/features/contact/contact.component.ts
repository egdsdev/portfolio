import { Component, computed, inject } from '@angular/core';
import { LanguageService } from '../../core/i18n/language.service';

const COPY = {
  pt: {
    eyebrow: '05 — Contato', title1: 'Disponível para', title2: 'novas oportunidades',
    lead: 'Aberto a conversas sobre cargos de desenvolvedor ou liderança técnica — full stack, arquitetura, infraestrutura, DevOps ou dados. Presencial em Goiânia ou remoto, respondo em até 24h.',
    location: 'Localização', place: 'Goiânia, GO · Brasil',
  },
  en: {
    eyebrow: '05 — Contact', title1: 'Open to', title2: 'new opportunities',
    lead: 'Open to conversations about developer or technical leadership roles — full stack, architecture, infrastructure, DevOps or data. On-site in Goiânia or remote; I reply within 24 hours.',
    location: 'Location', place: 'Goiânia, GO · Brazil',
  },
};
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faGithub, faLinkedinIn, faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope } from '@fortawesome/free-regular-svg-icons';
import { faArrowRight, faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { AnalyticsService } from '../../core/services/analytics.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [FontAwesomeModule],
  template: `
    <section id="contato" class="py-16 sm:py-28">
      <div class="wrap">
        <div class="mb-10 sm:mb-16 max-w-4xl">
          <div class="eyebrow mb-5">{{ t().eyebrow }}</div>
          <h2 class="section-title mb-6">{{ t().title1 }}<br>{{ t().title2 }}</h2>
          <p class="section-lead">{{ t().lead }}</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-16">
          <a href="mailto:egds.dev@gmail.com" (click)="onEmailClick($event)" class="contact-row">
            <fa-icon [icon]="icons.faEnvelope" class="contact-icon"></fa-icon>
            <span class="contact-text"><span class="eyebrow">Email</span>
            <span class="contact-value">egds.dev&#64;gmail.com</span></span>
            <fa-icon [icon]="icons.faArrowRight" class="contact-arrow"></fa-icon>
          </a>

          <a href="https://wa.me/5564981476096" target="_blank" rel="noopener noreferrer"
             (click)="onWhatsappClick()" class="contact-row">
            <fa-icon [icon]="icons.faWhatsapp" class="contact-icon"></fa-icon>
            <span class="contact-text"><span class="eyebrow">WhatsApp</span>
            <span class="contact-value">+55 64 98147-6096</span></span>
            <fa-icon [icon]="icons.faArrowRight" class="contact-arrow"></fa-icon>
          </a>

          <a href="https://www.linkedin.com/in/egdsdev/" target="_blank" rel="noopener noreferrer" class="contact-row">
            <fa-icon [icon]="icons.faLinkedinIn" class="contact-icon"></fa-icon>
            <span class="contact-text"><span class="eyebrow">LinkedIn</span>
            <span class="contact-value">/in/egdsdev</span></span>
            <fa-icon [icon]="icons.faArrowRight" class="contact-arrow"></fa-icon>
          </a>

          <a href="https://github.com/egdsdev" target="_blank" rel="noopener noreferrer" class="contact-row">
            <fa-icon [icon]="icons.faGithub" class="contact-icon"></fa-icon>
            <span class="contact-text"><span class="eyebrow">GitHub</span>
            <span class="contact-value">&#64;egdsdev</span></span>
            <fa-icon [icon]="icons.faArrowRight" class="contact-arrow"></fa-icon>
          </a>

          <div class="contact-row cursor-default md:col-span-2">
            <fa-icon [icon]="icons.faLocationDot" class="contact-icon"></fa-icon>
            <span class="contact-text"><span class="eyebrow">{{ t().location }}</span>
            <span class="contact-value text-zinc-400">{{ t().place }}</span></span>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .contact-row {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.5rem 0;
      border-top: 1px solid var(--border);
      transition: border-color 0.2s;
      width: 100%;
    }
    a.contact-row { cursor: pointer; }
    a.contact-row:hover { border-color: var(--fg-muted); }

    .contact-value {
      color: var(--fg);
      font-size: 1.0625rem;
      transition: color 0.2s;
      word-break: break-word;
    }
    a.contact-row:hover .contact-value { color: #fff; }

    .contact-text { display: flex; flex-direction: column; gap: 0.4rem; min-width: 0; flex: 1; }
    .contact-icon {
      display: inline-flex; align-items: center; justify-content: center; flex: none;
      width: 2.75rem; height: 2.75rem; border-radius: 0.625rem;
      background: var(--surface); border: 1px solid var(--border); color: var(--fg-muted);
      transition: color 0.2s, border-color 0.2s;
    }
    a.contact-row:hover .contact-icon { color: var(--fg); border-color: var(--border-hi); }
    .contact-arrow { color: var(--fg-faint); transition: color 0.2s, transform 0.2s; }
    a.contact-row:hover .contact-arrow { color: var(--fg); transform: translateX(4px); }
  `]
})
export class ContactComponent {
  private analytics = inject(AnalyticsService);
  private readonly i18n = inject(LanguageService);
  readonly t = computed(() => COPY[this.i18n.lang()]);
  readonly icons = { faEnvelope, faWhatsapp, faLinkedinIn, faGithub, faLocationDot, faArrowRight };

  onEmailClick(event: MouseEvent): void {
    void this.trackAndFollowLink(event, this.analytics.trackContactClick('email'));
  }

  onWhatsappClick(): void {
    void this.analytics.trackContactClick('whatsapp');
  }

  /** Dá um tempo curto para o tracking sair antes de o browser trocar de página. */
  private async trackAndFollowLink(event: MouseEvent, tracking: Promise<void>): Promise<void> {
    const anchor = event.currentTarget;
    if (!(anchor instanceof HTMLAnchorElement)) return;

    event.preventDefault();
    await Promise.race([
      tracking.catch(() => undefined),
      new Promise<void>(resolve => window.setTimeout(resolve, 400)),
    ]);
    window.location.href = anchor.href;
  }
}
