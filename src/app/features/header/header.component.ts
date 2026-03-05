import { Component } from '@angular/core';
import { NgxThemeToggleComponent, OmDarkIcon, OmLightIcon } from '@omnedia/ngx-theme-toggle';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [NgxThemeToggleComponent, OmDarkIcon, OmLightIcon],
  template: `
    <nav class="fixed top-0 left-0 right-0 bg-gray-900/90 backdrop-blur-md z-50 border-b border-gray-800/50">
      <div class="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        <a href="#detalhes" class="text-cyan-400 font-bold text-base tracking-widest font-mono hover:text-cyan-300 transition-colors">&lt;EG /&gt;</a>
        <ul class="flex items-center space-x-6">
          <li><a href="#escolaridade" class="nav-link text-gray-400 hover:text-cyan-400 transition-colors text-sm tracking-wide">Formação</a></li>
          <li><a href="#experiencia" class="nav-link text-gray-400 hover:text-cyan-400 transition-colors text-sm tracking-wide">Experiência</a></li>
          <li><a href="#habilidades" class="nav-link text-gray-400 hover:text-cyan-400 transition-colors text-sm tracking-wide">Skills</a></li>
          <li><a href="#certificacoes" class="nav-link text-gray-400 hover:text-cyan-400 transition-colors text-sm tracking-wide">Certificações</a></li>
          <li><a href="#contato" class="px-4 py-1.5 rounded-full border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 transition-all text-sm tracking-wide">Contato</a></li>
          <li class="flex items-center">
            <om-theme-toggle
              animationStyle="circle"
              darkThemeClass="dark"
              lightThemeClass="light"
              themeTarget="html"
              [duration]="500">
              <ng-template omDarkIcon>🌙</ng-template>
              <ng-template omLightIcon>☀️</ng-template>
            </om-theme-toggle>
          </li>
        </ul>
      </div>
    </nav>
  `,
  styles: [`
    :host om-theme-toggle {
      cursor: pointer;
    }
  `]
})
export class HeaderComponent {}
