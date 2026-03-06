import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="py-10 border-t border-gray-800/50">
      <div class="max-w-7xl mx-auto text-center">
        <p class="text-cyan-500/50 font-mono text-sm font-bold tracking-widest mb-2 footer-brand">&lt;EG /&gt;</p>
        <p class="text-gray-500 text-sm mb-1">
          Desenvolvido com <span class="text-cyan-400">❤</span> por Elias Gomes da Silva
        </p>
        <p class="text-gray-600 text-xs mb-3">© 2026. Todos os direitos reservados.</p>
        <a routerLink="/admin/login" class="text-gray-700 hover:text-cyan-400 transition-colors text-xs font-mono tracking-wide">⚙ Admin</a>
      </div>
    </footer>
  `
})
export class FooterComponent {}
