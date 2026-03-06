import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="py-10 border-t border-gray-800/50">
      <div class="max-w-7xl mx-auto text-center">
        <p class="text-cyan-500/50 font-mono text-sm font-bold tracking-widest mb-2 footer-brand">&lt;EG /&gt;</p>
        <p class="text-gray-500 text-sm mb-1">
          Desenvolvido com <span class="text-cyan-400">❤</span> por Elias Gomes da Silva
        </p>
        <p class="text-gray-600 text-xs">© 2026. Todos os direitos reservados.</p>
      </div>
    </footer>
  `
})
export class FooterComponent {}
