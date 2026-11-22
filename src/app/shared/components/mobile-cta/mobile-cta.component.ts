import { Component, NgZone, OnDestroy, OnInit, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AnalyticsService } from '../../../core/services/analytics.service';

/**
 * Barra fixa de ação no celular: contato e currículo sempre à mão.
 * Aparece depois do hero e some ao chegar no Contato (nunca cobre o rodapé).
 */
@Component({
  selector: 'app-mobile-cta',
  standalone: true,
  template: `
    <div class="mcta" [class.is-visible]="visible()" role="region" aria-label="Ações rápidas" [attr.aria-hidden]="!visible()">
      <a href="#contato" class="mcta-btn is-primary" [attr.tabindex]="visible() ? null : -1" (click)="track('contact')">
        Falar comigo
      </a>
      <a href="curriculo-elias-gomes.pdf" download="Curriculo-Elias-Gomes-da-Silva.pdf" class="mcta-btn"
         [attr.tabindex]="visible() ? null : -1" (click)="track('resume')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Currículo
      </a>
    </div>
  `,
  styles: [`
    .mcta { display: none; }

    @media (max-width: 767px) {
      .mcta {
        position: fixed;
        z-index: 45;
        left: 0; right: 0; bottom: 0;
        display: flex;
        gap: .6rem;
        padding: .7rem 1rem calc(.7rem + env(safe-area-inset-bottom));
        background: rgba(9, 9, 11, .88);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border-top: 1px solid var(--border);
        transform: translateY(110%);
        transition: transform .3s ease;
      }
      .mcta.is-visible { transform: none; }
    }

    .mcta-btn {
      flex: 1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: .45rem;
      min-height: 2.9rem;
      border-radius: .7rem;
      border: 1px solid var(--border-hi);
      color: var(--fg);
      font-size: .9375rem;
      font-weight: 500;
    }
    .mcta-btn.is-primary { background: var(--fg); color: var(--bg); border-color: var(--fg); }
    .mcta-btn svg { width: 1rem; height: 1rem; }

    @media (prefers-reduced-motion: reduce) { .mcta { transition: none; } }
  `],
})
export class MobileCtaComponent implements OnInit, OnDestroy {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private zone = inject(NgZone);
  private analytics = inject(AnalyticsService);
  readonly visible = signal(false);
  private ticking = false;

  private onScroll = () => {
    if (this.ticking) return;
    this.ticking = true;
    requestAnimationFrame(() => { this.ticking = false; this.update(); });
  };

  ngOnInit(): void {
    if (!this.isBrowser) return;
    // fora da zona: rolagem não dispara detecção de mudanças; o signal só muda quando a barra entra/sai
    this.zone.runOutsideAngular(() => {
      addEventListener('scroll', this.onScroll, { passive: true });
      addEventListener('resize', this.onScroll, { passive: true });
    });
  }

  ngOnDestroy(): void {
    if (!this.isBrowser) return;
    removeEventListener('scroll', this.onScroll);
    removeEventListener('resize', this.onScroll);
  }

  private update(): void {
    const hero = document.getElementById('detalhes');
    const contact = document.getElementById('contato');
    if (!hero || !contact) return;
    const show = hero.getBoundingClientRect().bottom < 0 && contact.getBoundingClientRect().top > innerHeight * 0.85;
    if (show !== this.visible()) this.zone.run(() => this.visible.set(show));
  }

  track(kind: 'contact' | 'resume'): void {
    void this.analytics.trackCtaClick(`sticky_${kind}`, 'sticky', kind === 'resume' ? 'resume' : 'contact');
  }
}
