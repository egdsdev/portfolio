import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="py-10 px-6 sm:px-8 border-t border-zinc-900">
      <div class="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p class="text-zinc-500 text-sm">Elias Gomes da Silva · Engenheiro de Computação · Full Stack Sênior</p>
        <p class="eyebrow">© {{ year }}</p>
      </div>
    </footer>
  `
})
export class FooterComponent {
  readonly year = new Date().getFullYear();
}
