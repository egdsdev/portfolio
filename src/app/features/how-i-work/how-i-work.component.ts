import { Component } from '@angular/core';

interface WorkStep {
  icon: string;
  title: string;
  description: string;
  tags: string[];
  accent: string;
}

@Component({
  selector: 'app-how-i-work',
  standalone: true,
  template: `
    <section id="como-trabalho" class="py-24 px-8">
      <div class="max-w-5xl mx-auto">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold bg-linear-to-r from-purple-400 to-cyan-400 text-transparent bg-clip-text inline-block">
            Como Eu Trabalho
          </h2>
          <div class="mt-3 mx-auto w-16 h-px bg-linear-to-r from-purple-400 to-cyan-400 rounded-full"></div>
          <p class="text-gray-400 mt-4">Do problema ao produto — processo claro, entrega previsível</p>
        </div>

        <!-- Steps horizontais (desktop) / verticais (mobile) -->
        <div class="relative">
          <!-- Linha conectora desktop -->
          <div class="hidden lg:block absolute top-12 left-0 right-0 h-px bg-linear-to-r from-purple-500/30 via-cyan-500/30 to-purple-500/30 z-0"></div>

          <div class="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-4 relative z-10">
            @for (step of steps; track step.title; let i = $index) {
              <div class="group flex flex-col items-center text-center">
                <!-- Ícone com número -->
                <div class="relative mb-4">
                  <div class="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl
                               border transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
                       [class]="step.accent">
                    {{ step.icon }}
                  </div>
                  <span class="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gray-900 border border-gray-700
                               text-[10px] font-bold text-gray-400 flex items-center justify-center">
                    {{ i + 1 }}
                  </span>
                </div>

                <!-- Conteúdo -->
                <h3 class="text-sm font-bold text-white mb-2 leading-tight">{{ step.title }}</h3>
                <p class="text-gray-500 text-xs leading-relaxed mb-3">{{ step.description }}</p>

                <!-- Tags -->
                <div class="flex flex-wrap justify-center gap-1">
                  @for (tag of step.tags; track tag) {
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-800/80 text-gray-400 border border-gray-700/60">
                      {{ tag }}
                    </span>
                  }
                </div>
              </div>

              <!-- Seta entre etapas (desktop) -->
              @if (i < steps.length - 1) {
                <div class="hidden lg:flex items-start justify-center pt-10 -mx-2">
                  <svg class="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5l7 7-7 7"/>
                  </svg>
                </div>
              }
            }
          </div>
        </div>

        <!-- Banner de valores -->
        <div class="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4">
          @for (value of values; track value.label) {
            <div class="rounded-xl border border-gray-800/60 bg-gray-900/40 p-5 text-center hover:border-gray-700 transition-colors">
              <div class="text-2xl mb-2">{{ value.icon }}</div>
              <p class="text-sm font-bold text-white mb-1">{{ value.label }}</p>
              <p class="text-xs text-gray-500 leading-relaxed">{{ value.desc }}</p>
            </div>
          }
        </div>
      </div>
    </section>
  `,
})
export class HowIWorkComponent {
  steps: WorkStep[] = [
    {
      icon: '🔍',
      title: 'Descoberta',
      description: 'Entendo o problema, o contexto do negócio e os objetivos reais antes de qualquer linha de código.',
      tags: ['Reunião', 'Briefing', 'Requisitos'],
      accent: 'bg-purple-900/40 border-purple-500/40 group-hover:border-purple-400/70 group-hover:shadow-purple-500/20',
    },
    {
      icon: '🗺️',
      title: 'Planejamento',
      description: 'Defino arquitetura, stack, cronograma e critérios de aceite. Sem surpresas no meio do caminho.',
      tags: ['Arquitetura', 'Sprint', 'Estimativa'],
      accent: 'bg-blue-900/40 border-blue-500/40 group-hover:border-blue-400/70 group-hover:shadow-blue-500/20',
    },
    {
      icon: '⚙️',
      title: 'Desenvolvimento',
      description: 'Código limpo, testável e documentado. Commits atômicos, revisões frequentes, entrega incremental.',
      tags: ['Clean Code', 'Git', 'CI/CD'],
      accent: 'bg-cyan-900/40 border-cyan-500/40 group-hover:border-cyan-400/70 group-hover:shadow-cyan-500/20',
    },
    {
      icon: '✅',
      title: 'Revisão',
      description: 'Testes, ajustes e validação com o cliente. Garanto que o que foi pedido é o que foi entregue.',
      tags: ['QA', 'Feedback', 'Ajustes'],
      accent: 'bg-green-900/40 border-green-500/40 group-hover:border-green-400/70 group-hover:shadow-green-500/20',
    },
    {
      icon: '🚀',
      title: 'Entrega',
      description: 'Deploy em produção, documentação e suporte pós-entrega. O projeto não termina com o deploy.',
      tags: ['Deploy', 'Docs', 'Suporte'],
      accent: 'bg-amber-900/40 border-amber-500/40 group-hover:border-amber-400/70 group-hover:shadow-amber-500/20',
    },
  ];

  values = [
    { icon: '🎯', label: 'Foco no problema', desc: 'A tecnologia é meio, não fim. Escolho a stack certa para cada contexto.' },
    { icon: '💬', label: 'Comunicação clara', desc: 'Atualizações frequentes, sem jargão desnecessário, prazo cumprido.' },
    { icon: '📈', label: 'Resultado mensurável', desc: 'Entrego impacto real: performance, conversão, redução de custo.' },
  ];
}
