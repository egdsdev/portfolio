import { Component } from '@angular/core';

interface TechEra {
  year: string;
  label: string;
  icon: string;
  accent: string;
  techs: { name: string; color: string }[];
  highlight: string;
}

@Component({
  selector: 'app-tech-timeline',
  standalone: true,
  template: `
    <section id="tech-timeline" class="py-24 px-8">
      <div class="max-w-4xl mx-auto">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold bg-linear-to-r from-purple-400 to-cyan-400 text-transparent bg-clip-text inline-block">
            Evolução Tecnológica
          </h2>
          <div class="mt-3 mx-auto w-16 h-px bg-linear-to-r from-purple-400 to-cyan-400 rounded-full"></div>
          <p class="text-gray-400 mt-4">+6 anos de aprendizado contínuo — cada fase construiu a próxima</p>
        </div>

        <div class="relative">
          <!-- Linha vertical central -->
          <div class="absolute left-6 lg:left-1/2 top-0 bottom-0 w-px bg-linear-to-b from-purple-500/50 via-cyan-500/30 to-transparent -translate-x-1/2"></div>

          <div class="space-y-12">
            @for (era of eras; track era.year; let i = $index; let even = $even) {
              <div class="relative flex items-start gap-6 lg:gap-0"
                   [class.lg:flex-row-reverse]="even">

                <!-- Dot na linha -->
                <div class="absolute left-6 lg:left-1/2 w-4 h-4 rounded-full border-2 border-gray-900 -translate-x-1/2 mt-1 z-10"
                     [class]="era.accent.replace('border-', 'bg-').split(' ')[0]"></div>

                <!-- Card (ocupa metade no desktop) -->
                <div class="ml-14 lg:ml-0 lg:w-[calc(50%-2rem)]"
                     [class.lg:mr-8]="!even"
                     [class.lg:ml-8]="even">
                  <div class="group rounded-2xl border border-gray-800/60 bg-gray-900/50 p-5 hover:border-gray-700 transition-all duration-300 hover:-translate-y-0.5">
                    <div class="flex items-center gap-3 mb-3">
                      <span class="text-2xl">{{ era.icon }}</span>
                      <div>
                        <p class="text-xs text-gray-600 font-mono">{{ era.year }}</p>
                        <p class="text-sm font-bold text-white leading-tight">{{ era.label }}</p>
                      </div>
                    </div>
                    <p class="text-xs text-gray-500 mb-4 leading-relaxed italic">{{ era.highlight }}</p>
                    <div class="flex flex-wrap gap-1.5">
                      @for (tech of era.techs; track tech.name) {
                        <span class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold border"
                              [class]="tech.color">
                          {{ tech.name }}
                        </span>
                      }
                    </div>
                  </div>
                </div>

                <!-- Espaçador para alinhar no desktop (lado oposto) -->
                <div class="hidden lg:block lg:w-[calc(50%-2rem)]"></div>
              </div>
            }
          </div>
        </div>
      </div>
    </section>
  `,
})
export class TechTimelineComponent {
  eras: TechEra[] = [
    {
      year: '2018 – 2019',
      label: 'Os primeiros passos',
      icon: '🌱',
      accent: 'bg-green-500',
      highlight: 'Descobri a programação pelo WordPress e PHP puro — o bug virou professor.',
      techs: [
        { name: 'PHP', color: 'bg-indigo-900/40 text-indigo-300 border-indigo-700/50' },
        { name: 'HTML/CSS', color: 'bg-orange-900/40 text-orange-300 border-orange-700/50' },
        { name: 'JavaScript', color: 'bg-yellow-900/40 text-yellow-300 border-yellow-700/50' },
        { name: 'MySQL', color: 'bg-blue-900/40 text-blue-300 border-blue-700/50' },
        { name: 'WordPress', color: 'bg-cyan-900/40 text-cyan-300 border-cyan-700/50' },
      ],
    },
    {
      year: '2020 – 2021',
      label: 'Backend profissional',
      icon: '⚙️',
      accent: 'bg-blue-500',
      highlight: 'Laravel e SQL avançado — aprendi que banco de dados bem modelado resolve 80% dos problemas.',
      techs: [
        { name: 'Laravel', color: 'bg-red-900/40 text-red-300 border-red-700/50' },
        { name: 'SQL Server', color: 'bg-blue-900/40 text-blue-300 border-blue-700/50' },
        { name: 'PostgreSQL', color: 'bg-blue-900/40 text-blue-300 border-blue-700/50' },
        { name: 'Redis', color: 'bg-rose-900/40 text-rose-300 border-rose-700/50' },
        { name: 'REST APIs', color: 'bg-gray-800 text-gray-300 border-gray-700' },
      ],
    },
    {
      year: '2022 – 2023',
      label: 'Full Stack & Cloud',
      icon: '☁️',
      accent: 'bg-purple-500',
      highlight: 'Entrei no frontend moderno e cloud. Vue, React e Azure Functions abriram o olho pro ecosistema distribuído.',
      techs: [
        { name: 'Vue.js', color: 'bg-green-900/40 text-green-300 border-green-700/50' },
        { name: 'React', color: 'bg-cyan-900/40 text-cyan-300 border-cyan-700/50' },
        { name: 'Azure Functions', color: 'bg-blue-900/40 text-blue-300 border-blue-700/50' },
        { name: 'Python', color: 'bg-yellow-900/40 text-yellow-300 border-yellow-700/50' },
        { name: 'MongoDB', color: 'bg-green-900/40 text-green-300 border-green-700/50' },
        { name: 'Power BI', color: 'bg-amber-900/40 text-amber-300 border-amber-700/50' },
      ],
    },
    {
      year: '2024 – 2025',
      label: 'IA & Sistemas Críticos',
      icon: '🤖',
      accent: 'bg-cyan-500',
      highlight: 'Integração de IA no dia-a-dia e sistemas de alta criticidade com ICP-Brasil, multi-tenant e segurança.',
      techs: [
        { name: 'OpenAI', color: 'bg-gray-800 text-gray-300 border-gray-700' },
        { name: 'Gemini AI', color: 'bg-blue-900/40 text-blue-300 border-blue-700/50' },
        { name: 'Firebase', color: 'bg-amber-900/40 text-amber-300 border-amber-700/50' },
        { name: 'WebSocket', color: 'bg-purple-900/40 text-purple-300 border-purple-700/50' },
        { name: 'RBAC', color: 'bg-red-900/40 text-red-300 border-red-700/50' },
        { name: '2FA / OAuth', color: 'bg-green-900/40 text-green-300 border-green-700/50' },
      ],
    },
    {
      year: '2025 – Hoje',
      label: 'Angular moderno & DevOps',
      icon: '🚀',
      accent: 'bg-amber-500',
      highlight: 'Angular 20 signals, Tailwind v4, CI/CD com GitHub Actions e foco em UX de alta conversão.',
      techs: [
        { name: 'Angular 20', color: 'bg-red-900/40 text-red-300 border-red-700/50' },
        { name: 'Tailwind v4', color: 'bg-cyan-900/40 text-cyan-300 border-cyan-700/50' },
        { name: 'GitHub Actions', color: 'bg-gray-800 text-gray-300 border-gray-700' },
        { name: 'Signals', color: 'bg-purple-900/40 text-purple-300 border-purple-700/50' },
        { name: 'SSR/Prerender', color: 'bg-indigo-900/40 text-indigo-300 border-indigo-700/50' },
      ],
    },
  ];
}
