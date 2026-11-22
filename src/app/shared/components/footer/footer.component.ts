import { Component, inject } from '@angular/core';
import { LanguageService } from '../../../core/i18n/language.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="py-10 border-t border-zinc-900">
      <div class="wrap flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p class="text-zinc-400 text-sm">Elias Gomes da Silva · {{ i18n.isEn() ? 'Computer Engineer · Senior Full Stack' : 'Engenheiro de Computação · Full Stack Sênior' }}</p>
        <div class="flex items-center gap-6">
          <p class="eyebrow">© {{ year }}</p>
          <a href="#detalhes" class="nav-link text-sm">{{ i18n.isEn() ? 'Back to top' : 'Voltar ao topo' }} ↑</a>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {
  readonly i18n = inject(LanguageService);
  readonly year = new Date().getFullYear();
}
