import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  template: `
    <nav class="fixed top-0 left-0 right-0 bg-gray-900/80 backdrop-blur-sm z-50 border-b border-gray-800/50">
      <div class="max-w-6xl mx-auto px-6 py-4">
        <ul class="flex justify-center space-x-8">
          <li><a href="#detalhes" class="text-gray-300 hover:text-cyan-400 transition-colors">Detalhes Pessoais</a></li>
          <li><a href="#escolaridade" class="text-gray-300 hover:text-cyan-400 transition-colors">Escolaridade</a></li>
          <li><a href="#experiencia" class="text-gray-300 hover:text-cyan-400 transition-colors">Experiência</a></li>
          <li><a href="#habilidades" class="text-gray-300 hover:text-cyan-400 transition-colors">Habilidades</a></li>
          <li><a href="#certificacoes" class="text-gray-300 hover:text-cyan-400 transition-colors">Certificações</a></li>
        </ul>
      </div>
    </nav>
  `
})
export class HeaderComponent {}