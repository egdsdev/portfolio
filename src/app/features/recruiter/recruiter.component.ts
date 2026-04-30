import { Component, inject } from '@angular/core';
import { AnalyticsService } from '../../core/services/analytics.service';

@Component({
  selector: 'app-recruiter',
  standalone: true,
  template: `
    <div class="min-h-screen bg-gray-950 text-gray-100 py-12 px-6">
      <div class="max-w-3xl mx-auto">

        <!-- Header da versão recruiter -->
        <div class="flex items-center justify-between mb-8">
          <div class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold">
            <span class="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            Versão Resumida — Recruiter
          </div>
          <a href="/portfolio/" class="text-xs text-gray-500 hover:text-gray-300 transition-colors">
            Ver versão completa →
          </a>
        </div>

        <!-- Identidade -->
        <div class="rounded-2xl border border-gray-800/70 bg-gray-900/50 p-8 mb-6">
          <div class="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <img src="/portfolio/profile.jpg" alt="Elias Gomes"
                 class="w-20 h-20 rounded-2xl object-cover object-top border-2 border-cyan-400/30 shrink-0" />
            <div class="flex-1">
              <h1 class="text-2xl font-bold text-white">Elias Gomes da Silva</h1>
              <p class="text-cyan-400 font-semibold mt-0.5">Desenvolvedor Full Stack Sênior</p>
              <p class="text-gray-500 text-sm mt-1">PHP · Laravel · Python · Angular · Cloud · IA</p>
              <div class="flex flex-wrap gap-2 mt-3">
                <span class="px-2.5 py-0.5 rounded-full text-xs bg-green-500/15 text-green-400 border border-green-500/30 font-semibold">
                  ✓ Disponível
                </span>
                <span class="px-2.5 py-0.5 rounded-full text-xs bg-gray-800 text-gray-400 border border-gray-700">
                  📍 Goiânia, GO (Remoto)
                </span>
                <span class="px-2.5 py-0.5 rounded-full text-xs bg-gray-800 text-gray-400 border border-gray-700">
                  🗓 +6 anos de experiência
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- KPIs -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          @for (kpi of kpis; track kpi.label) {
            <div class="rounded-xl border border-gray-800/70 bg-gray-900/50 p-4 text-center">
              <p class="text-2xl font-bold text-cyan-400">{{ kpi.value }}</p>
              <p class="text-xs text-gray-500 mt-0.5 leading-snug">{{ kpi.label }}</p>
            </div>
          }
        </div>

        <!-- O que entrego -->
        <div class="rounded-2xl border border-gray-800/70 bg-gray-900/50 p-6 mb-6">
          <h2 class="text-sm font-bold text-white uppercase tracking-widest mb-4">O que entrego</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            @for (item of delivers; track item.title) {
              <div class="flex items-start gap-3">
                <span class="text-xl shrink-0">{{ item.icon }}</span>
                <div>
                  <p class="text-sm font-semibold text-white">{{ item.title }}</p>
                  <p class="text-xs text-gray-500 leading-relaxed">{{ item.desc }}</p>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Stack principal -->
        <div class="rounded-2xl border border-gray-800/70 bg-gray-900/50 p-6 mb-6">
          <h2 class="text-sm font-bold text-white uppercase tracking-widest mb-4">Stack principal</h2>
          <div class="flex flex-wrap gap-2">
            @for (tech of stack; track tech.name) {
              <span class="px-3 py-1 rounded-full text-xs font-semibold border"
                    [class]="tech.color">
                {{ tech.name }}
              </span>
            }
          </div>
        </div>

        <!-- Experiências resumidas -->
        <div class="rounded-2xl border border-gray-800/70 bg-gray-900/50 p-6 mb-6">
          <h2 class="text-sm font-bold text-white uppercase tracking-widest mb-4">Últimas experiências</h2>
          <div class="space-y-4">
            @for (exp of experiences; track exp.company) {
              <div class="flex items-start gap-4">
                <div class="w-10 h-10 rounded-xl bg-gray-800/80 border border-gray-700/50 flex items-center justify-center text-xl shrink-0">
                  {{ exp.icon }}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <p class="text-sm font-bold text-white">{{ exp.role }}</p>
                      <p class="text-xs text-gray-400">{{ exp.company }}</p>
                    </div>
                    <span class="text-xs text-gray-600 font-mono shrink-0">{{ exp.period }}</span>
                  </div>
                  <p class="text-xs text-gray-500 mt-1 leading-relaxed">{{ exp.highlight }}</p>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- CTAs -->
        <div class="flex flex-col sm:flex-row gap-3">
          <a href="mailto:eliasgomesdev@gmail.com"
             (click)="onContactClick('email')"
             class="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl
                    bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500
                    text-white font-bold text-sm transition-all hover:scale-105 text-center">
            ✉️ Enviar e-mail
          </a>
          <a href="curriculo-elias-gomes.pdf"
             download="Curriculo-Elias-Gomes-da-Silva.pdf"
             (click)="onResumeDownload()"
             class="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border
                    border-gray-700 hover:border-cyan-500/50 text-gray-300 hover:text-cyan-300
                    text-sm font-semibold transition-all hover:scale-105 hover:bg-cyan-500/5">
            ⬇️ Baixar currículo
          </a>
          <a href="https://www.linkedin.com/in/egds/" target="_blank" rel="noopener"
             class="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border
                    border-blue-700/50 hover:border-blue-500 text-blue-400 hover:text-blue-300
                    text-sm font-semibold transition-all hover:scale-105 hover:bg-blue-500/5">
            💼 LinkedIn
          </a>
        </div>

        <p class="text-center text-xs text-gray-700 mt-8">
          Página gerada automaticamente a partir do portfolio completo ·
          <a href="/portfolio/" class="text-gray-600 hover:text-gray-400 transition-colors">egdsdev.github.io/portfolio</a>
        </p>
      </div>
    </div>
  `,
})
export class RecruiterComponent {
  private analytics = inject(AnalyticsService);

  kpis = [
    { value: '+6', label: 'Anos de experiência' },
    { value: '10+', label: 'Tecnologias dominadas' },
    { value: '100%', label: 'Remoto / presencial' },
    { value: 'Sênior', label: 'Nível técnico' },
  ];

  delivers = [
    { icon: '⚙️', title: 'APIs robustas', desc: 'REST e SOAP com auth, versionamento e documentação' },
    { icon: '🧩', title: 'Sistemas multi-tenant', desc: 'Isolamento de dados, RBAC e auditoria' },
    { icon: '🤖', title: 'Integração com IA', desc: 'OpenAI, Gemini — análise, automação e chatbots' },
    { icon: '📊', title: 'BI & Analytics', desc: 'Power BI, DAX, SQL avançado e dashboards' },
    { icon: '🚀', title: 'CI/CD & Deploy', desc: 'GitHub Actions, Docker, Firebase, Azure' },
    { icon: '🎨', title: 'Frontend moderno', desc: 'Angular, Vue, React com UX de alta conversão' },
  ];

  stack = [
    { name: 'PHP / Laravel', color: 'bg-red-900/40 text-red-300 border-red-700/50' },
    { name: 'Python', color: 'bg-yellow-900/40 text-yellow-300 border-yellow-700/50' },
    { name: 'Angular', color: 'bg-red-900/40 text-red-300 border-red-700/50' },
    { name: 'Vue.js', color: 'bg-green-900/40 text-green-300 border-green-700/50' },
    { name: 'PostgreSQL', color: 'bg-blue-900/40 text-blue-300 border-blue-700/50' },
    { name: 'SQL Server', color: 'bg-blue-900/40 text-blue-300 border-blue-700/50' },
    { name: 'Firebase', color: 'bg-amber-900/40 text-amber-300 border-amber-700/50' },
    { name: 'Azure Functions', color: 'bg-blue-900/40 text-blue-300 border-blue-700/50' },
    { name: 'Redis', color: 'bg-rose-900/40 text-rose-300 border-rose-700/50' },
    { name: 'GitHub Actions', color: 'bg-gray-800 text-gray-300 border-gray-700' },
    { name: 'OpenAI / Gemini', color: 'bg-purple-900/40 text-purple-300 border-purple-700/50' },
    { name: 'Power BI', color: 'bg-amber-900/40 text-amber-300 border-amber-700/50' },
  ];

  experiences = [
    {
      icon: '🔐',
      role: 'Desenvolvedor Full Stack',
      company: 'ByToken · 2026',
      period: '2026 – atual',
      highlight: 'SaaS multi-tenant para certificados ICP-Brasil: Laravel, Vue.js, PostgreSQL, IA para análise de risco, 2FA e integração e-CAC.',
    },
    {
      icon: '🛡️',
      role: 'Desenvolvedor Backend / BI',
      company: 'EQ Seguros',
      period: '2025',
      highlight: 'Dashboards analíticos no Power BI, queries SQL complexas e modelagem dimensional star schema para KPIs comerciais.',
    },
    {
      icon: '💡',
      role: 'Desenvolvedor Backend',
      company: 'Meeta Solutions',
      period: '2022 – 2025',
      highlight: 'Sistemas corporativos PHP/Laravel, migração de banco, Azure Functions, APIs REST/SOAP e dashboards BI em 3 anos.',
    },
  ];

  onContactClick(channel: string): void {
    void this.analytics.trackCtaClick(`contact_${channel}`, 'recruiter', 'direct_contact', { channel });
  }

  onResumeDownload(): void {
    void this.analytics.trackResumeDownload();
  }
}
