import { Component, inject } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { AnalyticsService } from '../../core/services/analytics.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [FontAwesomeModule],
  template: `
    <section id="contato" class="py-24 px-8">
      <div class="max-w-4xl mx-auto text-center">
        <div class="mb-16">
          <h2 class="text-4xl font-bold bg-linear-to-r from-blue-400 to-cyan-400 text-transparent bg-clip-text inline-block">
            Vamos Conversar?
          </h2>
          <div class="mt-3 mx-auto w-16 h-px bg-linear-to-r from-blue-400 to-cyan-400 rounded-full"></div>
        </div>
        <div class="grid md:grid-cols-3 gap-6">
          <a href="mailto:egds.dev@gmail.com"
             (click)="onEmailClick($event)"
             class="group p-6 bg-gray-800/50 rounded-2xl hover:bg-gray-800/70 transition-all duration-300
                    backdrop-blur-sm border border-gray-700/50 hover:border-cyan-500/30 hover:-translate-y-1">
            <div class="w-14 h-14 rounded-xl bg-cyan-500/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-cyan-500/20 transition-colors">
              <span class="text-2xl">✉️</span>
            </div>
            <h3 class="text-base font-semibold text-gray-200 mb-1">Email</h3>
            <p class="text-gray-400 text-sm">egds.dev&#64;gmail.com</p>
          </a>

          <a href="https://wa.me/5564992726932"
             target="_blank"
             rel="noopener noreferrer"
             (click)="onWhatsappClick($event)"
             class="group p-6 bg-gray-800/50 rounded-2xl hover:bg-gray-800/70 transition-all duration-300
                    backdrop-blur-sm border border-gray-700/50 hover:border-green-500/30 hover:-translate-y-1">
            <div class="w-14 h-14 rounded-xl bg-green-500/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-green-500/20 transition-colors">
              <fa-icon [icon]="whatsappIcon" class="text-2xl text-green-500"></fa-icon>
            </div>
            <h3 class="text-base font-semibold text-gray-200 mb-1">WhatsApp</h3>
            <p class="text-gray-400 text-sm">+55 64 99272-6932</p>
          </a>



          <div class="group p-6 bg-gray-800/50 rounded-2xl hover:bg-gray-800/70 transition-all duration-300
                      backdrop-blur-sm border border-gray-700/50 hover:border-blue-500/30 hover:-translate-y-1 cursor-default">
            <div class="w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-500/20 transition-colors">
              <span class="text-2xl">📍</span>
            </div>
            <h3 class="text-base font-semibold text-gray-200 mb-1">Localização</h3>
            <p class="text-gray-400 text-sm">Piracanjuba, GO</p>
          </div>
        </div>
      </div>
    </section>
  `
})
export class ContactComponent {
  private analytics = inject(AnalyticsService);

  whatsappIcon = faWhatsapp;

  onEmailClick(event: MouseEvent): void {
    void this.trackAndFollowLink(event, this.analytics.trackContactClick('email'));
  }

  onWhatsappClick(_event: MouseEvent): void {
    void this.analytics.trackContactClick('whatsapp');
  }

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
