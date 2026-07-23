import { Component, signal } from '@angular/core';

interface SkillPill {
  name: string;
  years?: string;
}

interface SkillGroup {
  icon: string;
  title: string;
  accent: string;      // classe de cor do título / hover
  border: string;      // classe de hover da borda do card
  iconBg: string;      // classe de fundo do ícone
  pills: SkillPill[];
  collapsible?: boolean;
}

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
          <p class="text-gray-400 mt-4">Stack full stack completa — do banco de dados à interface, com foco em performance</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (group of groups; track group.title) {
            @if (!group.collapsible || showAll()) {
              <div class="group p-6 bg-gray-800/50 rounded-2xl border border-gray-700/50 transition-all duration-300
                          backdrop-blur-sm flex flex-col items-center hover:-translate-y-1"
                   [class]="group.border">
                <div class="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors"
                     [class]="group.iconBg">
                  <span class="text-xl">{{ group.icon }}</span>
                </div>
                <h3 class="text-lg font-semibold mb-4" [class]="group.accent">{{ group.title }}</h3>
                <div class="flex flex-wrap gap-2 justify-center">
                  @for (pill of group.pills; track pill.name) {
                    <span class="skill-pill border border-gray-600/50">
                      {{ pill.name }}
                      @if (pill.years) {
                        <span class="opacity-50 font-mono text-[10px] ml-0.5">· {{ pill.years }}</span>
                      }
                    </span>
                  }
                </div>
              </div>
            }
          }
        </div>

        <!-- Botão expandir/recolher -->
        <div class="flex justify-center pt-8">
          <button (click)="showAll.set(!showAll())"
                  class="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-gray-600/50 text-gray-400
                         hover:border-cyan-500/50 hover:text-cyan-300 text-sm transition-all duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 transition-transform duration-300"
                 [class.rotate-180]="showAll()" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
            </svg>
            {{ showAll() ? 'Ver menos' : 'Ver todas as habilidades' }}
          </button>
        </div>
      </div>
    </section>
  `
})
export class SkillsComponent {
  showAll = signal(false);

  groups: SkillGroup[] = [
    {
      icon: '⚙️', title: 'Backend', accent: 'text-blue-400',
      border: 'hover:border-blue-500/40', iconBg: 'bg-blue-500/10 group-hover:bg-blue-500/20',
      pills: [
        { name: 'PHP', years: '7a' }, { name: 'Laravel', years: '6a' }, { name: 'Python', years: '3a' },
        { name: 'Node.js', years: '5a' }, { name: 'REST API' }, { name: 'SOAP' },
        { name: 'Filas (Queues)' }, { name: 'Cron Jobs' }, { name: 'WebSocket' },
      ],
    },
    {
      icon: '🖥️', title: 'Frontend', accent: 'text-cyan-400',
      border: 'hover:border-cyan-500/40', iconBg: 'bg-cyan-500/10 group-hover:bg-cyan-500/20',
      pills: [
        { name: 'Vue.js', years: '5a' }, { name: 'React', years: '3a' }, { name: 'React Native', years: '2a' },
        { name: 'Angular', years: '2a' }, { name: 'TypeScript', years: '4a' }, { name: 'JavaScript', years: '7a' },
        { name: 'HTML5' }, { name: 'CSS3' }, { name: 'Tailwind CSS' },
      ],
    },
    {
      icon: '🗄️', title: 'Banco de Dados', accent: 'text-purple-400',
      border: 'hover:border-purple-500/40', iconBg: 'bg-purple-500/10 group-hover:bg-purple-500/20',
      pills: [
        { name: 'PostgreSQL', years: '4a' }, { name: 'SQL Server', years: '4a' }, { name: 'MySQL', years: '5a' },
        { name: 'MongoDB', years: '3a' }, { name: 'Stored Procedures' }, { name: 'Triggers' },
        { name: 'Views' }, { name: 'Migrations' }, { name: 'Indexação' },
      ],
    },
    {
      icon: '☁️', title: 'DevOps & Cloud', accent: 'text-green-400', collapsible: true,
      border: 'hover:border-green-500/40', iconBg: 'bg-green-500/10 group-hover:bg-green-500/20',
      pills: [
        { name: 'Docker' }, { name: 'Git' }, { name: 'GitHub Actions' }, { name: 'CI/CD' }, { name: 'Azure' },
        { name: 'Azure Functions' }, { name: 'AWS' }, { name: 'Firebase' }, { name: 'Linux' },
      ],
    },
    {
      icon: '📊', title: 'BI & Dados', accent: 'text-orange-400', collapsible: true,
      border: 'hover:border-orange-500/40', iconBg: 'bg-orange-500/10 group-hover:bg-orange-500/20',
      pills: [
        { name: 'Power BI' }, { name: 'DAX' }, { name: 'Pentaho ETL' },
        { name: 'Modelagem Dimensional' }, { name: 'Star Schema' }, { name: 'SQL Analítico' },
      ],
    },
    {
      icon: '🏆', title: 'Boas Práticas', accent: 'text-rose-400', collapsible: true,
      border: 'hover:border-rose-500/40', iconBg: 'bg-rose-500/10 group-hover:bg-rose-500/20',
      pills: [
        { name: 'SOLID' }, { name: 'Clean Code' }, { name: 'Design Patterns' }, { name: 'DDD' },
        { name: 'Code Review' }, { name: 'Scrum' }, { name: 'Kanban' }, { name: 'Jira' },
      ],
    },
  ];
}
