import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="py-10 border-t border-zinc-900">
      <div class="wrap flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p class="text-zinc-400 text-sm">Elias Gomes da Silva · Engenheiro de Computação · Full Stack Sênior</p>
        <div class="flex items-center gap-6">
          <p class="eyebrow">© {{ year }}</p>
          <a href="#detalhes" class="nav-link text-sm">Voltar ao topo ↑</a>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {
  readonly year = new Date().getFullYear();
}
