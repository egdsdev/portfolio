import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="py-12 relative overflow-hidden group">
      <div class="absolute inset-0 bg-linear-to-r from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div class="max-w-7xl mx-auto text-center relative z-10">
        <div class="flex flex-col items-center space-y-6">
          <p class="text-gray-400 text-lg">
            Desenvolvido com <span class="text-cyan-400">❤</span> por Elias Gomes da Silva
          </p>
          <p class="text-gray-500 text-sm">© 2025. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {}