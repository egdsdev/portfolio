import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-skills',
  standalone: true,
  template: `
    <section id="habilidades" class="py-24 px-8">
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold bg-linear-to-r from-blue-400 to-cyan-400 text-transparent bg-clip-text inline-block">
            Habilidades e Competências
          </h2>
          <div class="mt-3 mx-auto w-16 h-px bg-linear-to-r from-blue-400 to-cyan-400 rounded-full"></div>
        </div>
        <div class="flex flex-wrap justify-center items-stretch gap-6 mx-auto max-w-6xl">
          <!-- Backend -->
          <div class="group p-6 bg-gray-800/50 rounded-2xl border border-gray-700/50 hover:border-blue-500/40 transition-all duration-300
                      backdrop-blur-sm w-full md:w-[calc(50%-1.5rem)] lg:w-[calc(33.33%-1.5rem)] flex flex-col items-center hover:-translate-y-1">
            <div class="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
              <span class="text-xl">⚙️</span>
            </div>
            <h3 class="text-lg font-semibold text-blue-400 mb-4">Backend</h3>
            <div class="flex flex-wrap gap-2 justify-center">
              <span class="skill-pill border border-gray-600/50 hover:border-blue-500/50 hover:text-blue-300">PHP <span class="text-blue-400/50 font-mono text-[10px]">· 7a</span></span>
              <span class="skill-pill border border-gray-600/50 hover:border-blue-500/50 hover:text-blue-300">Laravel <span class="text-blue-400/50 font-mono text-[10px]">· 6a</span></span>
              <span class="skill-pill border border-gray-600/50 hover:border-blue-500/50 hover:text-blue-300">Python <span class="text-blue-400/50 font-mono text-[10px]">· 3a</span></span>
              <span class="skill-pill border border-gray-600/50 hover:border-blue-500/50 hover:text-blue-300">Node.js <span class="text-blue-400/50 font-mono text-[10px]">· 5a</span></span>
              <span class="skill-pill border border-gray-600/50 hover:border-blue-500/50 hover:text-blue-300">REST API</span>
              <span class="skill-pill border border-gray-600/50 hover:border-blue-500/50 hover:text-blue-300">SOAP</span>
              <span class="skill-pill border border-gray-600/50 hover:border-blue-500/50 hover:text-blue-300">Filas (Queues)</span>
              <span class="skill-pill border border-gray-600/50 hover:border-blue-500/50 hover:text-blue-300">Cron Jobs</span>
              <span class="skill-pill border border-gray-600/50 hover:border-blue-500/50 hover:text-blue-300">WebSocket</span>
            </div>
          </div>

          <!-- Frontend -->
          <div class="group p-6 bg-gray-800/50 rounded-2xl border border-gray-700/50 hover:border-cyan-500/40 transition-all duration-300
                      backdrop-blur-sm w-full md:w-[calc(50%-1.5rem)] lg:w-[calc(33.33%-1.5rem)] flex flex-col items-center hover:-translate-y-1">
            <div class="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-4 group-hover:bg-cyan-500/20 transition-colors">
              <span class="text-xl">🖥️</span>
            </div>
            <h3 class="text-lg font-semibold text-cyan-400 mb-4">Frontend</h3>
            <div class="flex flex-wrap gap-2 justify-center">
              <span class="skill-pill border border-gray-600/50 hover:border-cyan-500/50 hover:text-cyan-300">Vue.js <span class="text-cyan-400/50 font-mono text-[10px]">· 5a</span></span>
              <span class="skill-pill border border-gray-600/50 hover:border-cyan-500/50 hover:text-cyan-300">React <span class="text-cyan-400/50 font-mono text-[10px]">· 3a</span></span>
              <span class="skill-pill border border-gray-600/50 hover:border-cyan-500/50 hover:text-cyan-300">Angular <span class="text-cyan-400/50 font-mono text-[10px]">· 2a</span></span>
              <span class="skill-pill border border-gray-600/50 hover:border-cyan-500/50 hover:text-cyan-300">TypeScript <span class="text-cyan-400/50 font-mono text-[10px]">· 4a</span></span>
              <span class="skill-pill border border-gray-600/50 hover:border-cyan-500/50 hover:text-cyan-300">JavaScript <span class="text-cyan-400/50 font-mono text-[10px]">· 7a</span></span>
              <span class="skill-pill border border-gray-600/50 hover:border-cyan-500/50 hover:text-cyan-300">HTML5</span>
              <span class="skill-pill border border-gray-600/50 hover:border-cyan-500/50 hover:text-cyan-300">CSS3</span>
              <span class="skill-pill border border-gray-600/50 hover:border-cyan-500/50 hover:text-cyan-300">Tailwind CSS</span>
            </div>
          </div>

          <!-- Banco de Dados -->
          <div class="group p-6 bg-gray-800/50 rounded-2xl border border-gray-700/50 hover:border-purple-500/40 transition-all duration-300
                      backdrop-blur-sm w-full md:w-[calc(50%-1.5rem)] lg:w-[calc(33.33%-1.5rem)] flex flex-col items-center hover:-translate-y-1">
            <div class="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4 group-hover:bg-purple-500/20 transition-colors">
              <span class="text-xl">🗄️</span>
            </div>
            <h3 class="text-lg font-semibold text-purple-400 mb-4">Banco de Dados</h3>
            <div class="flex flex-wrap gap-2 justify-center">
              <span class="skill-pill border border-gray-600/50 hover:border-purple-500/50 hover:text-purple-300">PostgreSQL <span class="text-purple-400/50 font-mono text-[10px]">· 4a</span></span>
              <span class="skill-pill border border-gray-600/50 hover:border-purple-500/50 hover:text-purple-300">SQL Server <span class="text-purple-400/50 font-mono text-[10px]">· 4a</span></span>
              <span class="skill-pill border border-gray-600/50 hover:border-purple-500/50 hover:text-purple-300">MySQL <span class="text-purple-400/50 font-mono text-[10px]">· 5a</span></span>
              <span class="skill-pill border border-gray-600/50 hover:border-purple-500/50 hover:text-purple-300">MongoDB <span class="text-purple-400/50 font-mono text-[10px]">· 3a</span></span>
              <span class="skill-pill border border-gray-600/50 hover:border-purple-500/50 hover:text-purple-300">Stored Procedures</span>
              <span class="skill-pill border border-gray-600/50 hover:border-purple-500/50 hover:text-purple-300">Triggers</span>
              <span class="skill-pill border border-gray-600/50 hover:border-purple-500/50 hover:text-purple-300">Views</span>
              <span class="skill-pill border border-gray-600/50 hover:border-purple-500/50 hover:text-purple-300">Migrations</span>
              <span class="skill-pill border border-gray-600/50 hover:border-purple-500/50 hover:text-purple-300">Indexação</span>
            </div>
          </div>

          <!-- DevOps & Cloud, BI & Dados, Boas Práticas: colapsáveis -->
          @if (showAll()) {
          <!-- DevOps & Cloud -->
          <div class="group p-6 bg-gray-800/50 rounded-2xl border border-gray-700/50 hover:border-green-500/40 transition-all duration-300
                      backdrop-blur-sm w-full md:w-[calc(50%-1.5rem)] lg:w-[calc(33.33%-1.5rem)] flex flex-col items-center hover:-translate-y-1">
            <div class="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-4 group-hover:bg-green-500/20 transition-colors">
              <span class="text-xl">☁️</span>
            </div>
            <h3 class="text-lg font-semibold text-green-400 mb-4">DevOps & Cloud</h3>
            <div class="flex flex-wrap gap-2 justify-center">
              <span class="skill-pill border border-gray-600/50 hover:border-green-500/50 hover:text-green-300">Docker</span>
              <span class="skill-pill border border-gray-600/50 hover:border-green-500/50 hover:text-green-300">Git</span>
              <span class="skill-pill border border-gray-600/50 hover:border-green-500/50 hover:text-green-300">GitHub Actions</span>
              <span class="skill-pill border border-gray-600/50 hover:border-green-500/50 hover:text-green-300">CI/CD</span>
              <span class="skill-pill border border-gray-600/50 hover:border-green-500/50 hover:text-green-300">Azure</span>
              <span class="skill-pill border border-gray-600/50 hover:border-green-500/50 hover:text-green-300">Azure Functions</span>
              <span class="skill-pill border border-gray-600/50 hover:border-green-500/50 hover:text-green-300">AWS</span>
              <span class="skill-pill border border-gray-600/50 hover:border-green-500/50 hover:text-green-300">Firebase</span>
              <span class="skill-pill border border-gray-600/50 hover:border-green-500/50 hover:text-green-300">Linux</span>
            </div>
          </div>

          <!-- BI & Dados -->
          <div class="group p-6 bg-gray-800/50 rounded-2xl border border-gray-700/50 hover:border-orange-500/40 transition-all duration-300
                      backdrop-blur-sm w-full md:w-[calc(50%-1.5rem)] lg:w-[calc(33.33%-1.5rem)] flex flex-col items-center hover:-translate-y-1">
            <div class="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center mb-4 group-hover:bg-orange-500/20 transition-colors">
              <span class="text-xl">📊</span>
            </div>
            <h3 class="text-lg font-semibold text-orange-400 mb-4">BI & Dados</h3>
            <div class="flex flex-wrap gap-2 justify-center">
              <span class="skill-pill border border-gray-600/50 hover:border-orange-500/50 hover:text-orange-300">Power BI</span>
              <span class="skill-pill border border-gray-600/50 hover:border-orange-500/50 hover:text-orange-300">DAX</span>
              <span class="skill-pill border border-gray-600/50 hover:border-orange-500/50 hover:text-orange-300">Pentaho ETL</span>
              <span class="skill-pill border border-gray-600/50 hover:border-orange-500/50 hover:text-orange-300">Modelagem Dimensional</span>
              <span class="skill-pill border border-gray-600/50 hover:border-orange-500/50 hover:text-orange-300">Star Schema</span>
              <span class="skill-pill border border-gray-600/50 hover:border-orange-500/50 hover:text-orange-300">SQL Analítico</span>
            </div>
          </div>

          <!-- Boas Práticas -->
          <div class="group p-6 bg-gray-800/50 rounded-2xl border border-gray-700/50 hover:border-rose-500/40 transition-all duration-300
                      backdrop-blur-sm w-full md:w-[calc(50%-1.5rem)] lg:w-[calc(33.33%-1.5rem)] flex flex-col items-center hover:-translate-y-1">
            <div class="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center mb-4 group-hover:bg-rose-500/20 transition-colors">
              <span class="text-xl">🏆</span>
            </div>
            <h3 class="text-lg font-semibold text-rose-400 mb-4">Boas Práticas</h3>
            <div class="flex flex-wrap gap-2 justify-center">
              <span class="skill-pill border border-gray-600/50 hover:border-rose-500/50 hover:text-rose-300">SOLID</span>
              <span class="skill-pill border border-gray-600/50 hover:border-rose-500/50 hover:text-rose-300">Clean Code</span>
              <span class="skill-pill border border-gray-600/50 hover:border-rose-500/50 hover:text-rose-300">Design Patterns</span>
              <span class="skill-pill border border-gray-600/50 hover:border-rose-500/50 hover:text-rose-300">DDD</span>
              <span class="skill-pill border border-gray-600/50 hover:border-rose-500/50 hover:text-rose-300">Code Review</span>
              <span class="skill-pill border border-gray-600/50 hover:border-rose-500/50 hover:text-rose-300">Scrum</span>
              <span class="skill-pill border border-gray-600/50 hover:border-rose-500/50 hover:text-rose-300">Kanban</span>
              <span class="skill-pill border border-gray-600/50 hover:border-rose-500/50 hover:text-rose-300">Jira</span>
            </div>
          </div>
          } <!-- /showAll -->

          <!-- Botão expandir/recolher -->
          <div class="w-full flex justify-center pt-2">
            <button (click)="showAll.set(!showAll())"
                    class="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-gray-600/50 text-gray-400
                           hover:border-cyan-500/50 hover:text-cyan-300 text-sm transition-all duration-300">
              @if (showAll()) {
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7"/>
                </svg>
                Ver menos
              } @else {
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
                </svg>
                Ver todas as habilidades
              }
            </button>
          </div>

        </div>
      </div>
    </section>
  `
})
export class SkillsComponent {
  showAll = signal(false);
}
