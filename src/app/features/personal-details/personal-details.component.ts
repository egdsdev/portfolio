import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TechMarqueeComponent } from '../../shared/components/tech-marquee/tech-marquee.component';

@Component({
  selector: 'app-personal-details',
  standalone: true,
  imports: [TechMarqueeComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styleUrls: ['./personal-details.scss'],
  template: `
    <section id="detalhes" class="min-h-screen pt-20 flex items-center justify-center relative overflow-hidden">
      <!-- Círculos decorativos -->
      <div class="absolute top-20 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div class="absolute top-20 right-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div class="absolute -bottom-8 left-40 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

      <div class="relative z-10 text-center justify-center items-center px-8 flex flex-col items-center">
        <!-- Avatar -->
        <div class="relative inline-flex items-center justify-center mb-5">
          <div class="avatar-ring w-32 h-32 rounded-full border-2 border-cyan-400/40 overflow-hidden">
            <img src="profile.jpg" alt="Elias Gomes" class="w-full h-full object-cover object-top">
          </div>
          <span class="absolute top-1 right-1 flex h-4 w-4">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-4 w-4 bg-green-500 border-2 border-gray-900"></span>
          </span>
        </div>

        <!-- Badge -->
        <div class="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full border border-cyan-500/30 bg-cyan-500/5 text-cyan-300 text-sm font-medium">
          <span class="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
          Disponível para novos projetos
        </div>

        <h1 class="text-5xl md:text-6xl font-bold mb-3 text-gradient-name">
          Elias Gomes da Silva
        </h1>
        <p class="text-xl md:text-2xl text-gray-300 opacity-90 mb-2">Desenvolvedor Full Stack</p>
        <p class="text-gray-500 text-xs tracking-widest uppercase font-mono mb-10">PHP · Python · Angular · Cloud</p>

        <app-tech-marquee></app-tech-marquee>

        <a href="#contato"
           class="mt-10 inline-block px-10 py-3.5 bg-linear-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-full
                  transform hover:scale-105 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/40 text-sm tracking-wide">
          Entre em Contato
        </a>
      </div>

      <!-- Scroll indicator -->
      <div class="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-gray-600 z-10">
        <span class="text-xs tracking-widest uppercase font-mono">scroll</span>
        <div class="w-5 h-8 border border-gray-600 rounded-full flex justify-center pt-1.5">
          <div class="scroll-dot w-1 h-2 bg-cyan-400 rounded-full"></div>
        </div>
      </div>
    </section>
  `
})
export class PersonalDetailsComponent {}
