import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NgxFuzzyTextComponent } from '@omnedia/ngx-fuzzy-text';
import { TechMarqueeComponent } from '../../shared/components/tech-marquee/tech-marquee.component';

@Component({
  selector: 'app-personal-details',
  standalone: true,
  imports: [NgxFuzzyTextComponent, TechMarqueeComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <section id="detalhes" class="min-h-screen pt-20 flex items-center justify-center relative overflow-hidden">
      <!-- Círculos decorativos com blur -->
      <div class="absolute top-20 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div class="absolute top-20 right-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div class="absolute -bottom-8 left-40 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      
      <div class="relative z-10 text-center px-8">
        <h1 class="text-6xl font-bold mb-6">
          <om-fuzzy-text
            [text]="'Elias Gomes da Silva'"
            [baseIntensity]="0.05"
            [hoverIntensity]="0.3"
            [enableHover]="true"
            [fuzzRange]="20"
            styleClass="inline-block transform hover:scale-105 transition-transform duration-300"
          ></om-fuzzy-text>
        </h1>
        <div class="space-y-4 mb-8">
          <p class="text-2xl text-gray-300 opacity-90">Desenvolvedor Full Stack</p>
          <app-tech-marquee></app-tech-marquee>
        </div>
        <a href="#contato" 
           class="inline-block px-8 py-3 bg-linear-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-full 
                  transform hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/50">
          Entre em Contato
        </a>
      </div>
    </section>
  `
})
export class PersonalDetailsComponent {}