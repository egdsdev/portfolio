import { Component } from '@angular/core';

@Component({
  selector: 'app-skills',
  standalone: true,
  template: `
    <section id="habilidades" class="py-20 px-8">
      <div class="max-w-6xl mx-auto">
        <h2 class="text-4xl font-bold text-center mb-16 bg-linear-to-r from-blue-400 to-cyan-400 text-transparent bg-clip-text">
          Habilidades e Competências
        </h2>
        <div class="flex flex-wrap justify-center items-center gap-6 mx-auto max-w-6xl">
          <div class="p-6 bg-gray-800/50 rounded-xl hover:bg-gray-800/70 transition-all duration-300 backdrop-blur-sm
                      border border-gray-700/50 hover:border-cyan-500/30 group w-full md:w-[calc(50%-1.5rem)] lg:w-[calc(33.33%-1.5rem)] flex flex-col items-center">
            <h3 class="text-xl font-semibold text-cyan-400 mb-4">Backend</h3>
            <div class="flex flex-wrap gap-2 justify-center">
              <span class="px-3 py-1 text-sm bg-gray-700/50 text-gray-300 rounded-full hover:bg-cyan-500/20 transition-colors">PHP</span>
              <span class="px-3 py-1 text-sm bg-gray-700/50 text-gray-300 rounded-full hover:bg-cyan-500/20 transition-colors">Laravel</span>
              <span class="px-3 py-1 text-sm bg-gray-700/50 text-gray-300 rounded-full hover:bg-cyan-500/20 transition-colors">Python</span>
              <span class="px-3 py-1 text-sm bg-gray-700/50 text-gray-300 rounded-full hover:bg-cyan-500/20 transition-colors">Node.js</span>
            </div>
          </div>

          <div class="p-6 bg-gray-800/50 rounded-xl hover:bg-gray-800/70 transition-all duration-300 backdrop-blur-sm
                      border border-gray-700/50 hover:border-cyan-500/30 group w-full md:w-[calc(50%-1.5rem)] lg:w-[calc(33.33%-1.5rem)] flex flex-col items-center">
            <h3 class="text-xl font-semibold text-cyan-400 mb-4">Frontend</h3>
            <div class="flex flex-wrap gap-2 justify-center">
              <span class="px-3 py-1 text-sm bg-gray-700/50 text-gray-300 rounded-full hover:bg-cyan-500/20 transition-colors">Vue.js</span>
              <span class="px-3 py-1 text-sm bg-gray-700/50 text-gray-300 rounded-full hover:bg-cyan-500/20 transition-colors">React</span>
              <span class="px-3 py-1 text-sm bg-gray-700/50 text-gray-300 rounded-full hover:bg-cyan-500/20 transition-colors">TypeScript</span>
              <span class="px-3 py-1 text-sm bg-gray-700/50 text-gray-300 rounded-full hover:bg-cyan-500/20 transition-colors">JavaScript</span>
            </div>
          </div>

          <div class="p-6 bg-gray-800/50 rounded-xl hover:bg-gray-800/70 transition-all duration-300 backdrop-blur-sm
                      border border-gray-700/50 hover:border-cyan-500/30 group w-full md:w-[calc(50%-1.5rem)] lg:w-[calc(33.33%-1.5rem)] flex flex-col items-center">
            <h3 class="text-xl font-semibold text-cyan-400 mb-4">Banco de Dados</h3>
            <div class="flex flex-wrap gap-2 justify-center">
              <span class="px-3 py-1 text-sm bg-gray-700/50 text-gray-300 rounded-full hover:bg-cyan-500/20 transition-colors">MongoDB</span>
              <span class="px-3 py-1 text-sm bg-gray-700/50 text-gray-300 rounded-full hover:bg-cyan-500/20 transition-colors">MySQL</span>
              <span class="px-3 py-1 text-sm bg-gray-700/50 text-gray-300 rounded-full hover:bg-cyan-500/20 transition-colors">PostgreSQL</span>
              <span class="px-3 py-1 text-sm bg-gray-700/50 text-gray-300 rounded-full hover:bg-cyan-500/20 transition-colors">SQL Server</span>
            </div>
          </div>

          <div class="p-6 bg-gray-800/50 rounded-xl hover:bg-gray-800/70 transition-all duration-300 backdrop-blur-sm
                      border border-gray-700/50 hover:border-cyan-500/30 group w-full md:w-[calc(50%-1.5rem)] lg:w-[calc(33.33%-1.5rem)] flex flex-col items-center">
            <h3 class="text-xl font-semibold text-cyan-400 mb-4">Ferramentas e Outros</h3>
            <div class="flex flex-wrap gap-2 justify-center">
              <span class="px-3 py-1 text-sm bg-gray-700/50 text-gray-300 rounded-full hover:bg-cyan-500/20 transition-colors">Azure</span>
              <span class="px-3 py-1 text-sm bg-gray-700/50 text-gray-300 rounded-full hover:bg-cyan-500/20 transition-colors">Power BI</span>
              <span class="px-3 py-1 text-sm bg-gray-700/50 text-gray-300 rounded-full hover:bg-cyan-500/20 transition-colors">Pentaho</span>
              <span class="px-3 py-1 text-sm bg-gray-700/50 text-gray-300 rounded-full hover:bg-cyan-500/20 transition-colors">Electron</span>
              <span class="px-3 py-1 text-sm bg-gray-700/50 text-gray-300 rounded-full hover:bg-cyan-500/20 transition-colors">CI/CD</span>
              <span class="px-3 py-1 text-sm bg-gray-700/50 text-gray-300 rounded-full hover:bg-cyan-500/20 transition-colors">Scrum</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  `
})
export class SkillsComponent {}