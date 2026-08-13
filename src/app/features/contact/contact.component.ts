import { Component, inject } from '@angular/core';
import { AnalyticsService } from '../../core/services/analytics.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  template: `
    <section id="contato" class="py-20 sm:py-28 px-6 sm:px-8">
      <div class="max-w-6xl mx-auto">
        <div class="mb-12 sm:mb-16 max-w-4xl">
          <div class="eyebrow mb-5">04 — Contato</div>
          <h2 class="section-title mb-6">Disponível para<br>novas oportunidades</h2>
          <p class="section-lead">
            Aberto a conversas sobre cargos de desenvolvedor ou liderança técnica — full stack,
            arquitetura, infraestrutura, DevOps ou dados. Presencial em Goiânia ou remoto, respondo em até 24h.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-16">
          <a href="mailto:egds.dev@gmail.com" (click)="onEmailClick($event)" class="contact-row">
            <span class="eyebrow">Email</span>
            <span class="contact-value">egds.dev&#64;gmail.com</span>
          </a>

          <a href="https://wa.me/5564981476096" target="_blank" rel="noopener noreferrer"
             (click)="onWhatsappClick()" class="contact-row">
            <span class="eyebrow">WhatsApp</span>
            <span class="contact-value">+55 64 98147-6096</span>
          </a>

          <a href="https://www.linkedin.com/in/egdsdev/" target="_blank" rel="noopener noreferrer" class="contact-row">
            <span class="eyebrow">LinkedIn</span>
            <span class="contact-value">/in/egdsdev</span>
          </a>

          <a href="https://github.com/egdsdev" target="_blank" rel="noopener noreferrer" class="contact-row">
            <span class="eyebrow">GitHub</span>
            <span class="contact-value">&#64;egdsdev</span>
          </a>

          <div class="contact-row cursor-default md:col-span-2">
            <span class="eyebrow">Localização</span>
            <span class="contact-value text-zinc-400">Goiânia, GO · Brasil</span>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .contact-row {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
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
  `]
})
export class ContactComponent {
  private analytics = inject(AnalyticsService);

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
