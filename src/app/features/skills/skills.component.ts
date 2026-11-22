import { Component, computed, inject, signal } from '@angular/core';
import { LanguageService, Lang } from '../../core/i18n/language.service';

interface SkillPill {
  name: string;
  years?: string;
}

interface SkillGroup {
  title: string;
  pills: SkillPill[];
}

const COPY: Record<Lang, { eyebrow: string; title1: string; title2: string; lead: string; tabsAria: string }> = {
  pt: { eyebrow: '03 — Stack', title1: 'O que eu uso', title2: 'no dia a dia', lead: 'Anos indicam tempo de uso em projetos reais, não em cursos.', tabsAria: 'Categorias de skills' },
  en: { eyebrow: '03 — Stack', title1: 'What I use', title2: 'every day', lead: 'Years show time spent using it in real projects, not in courses.', tabsAria: 'Skill categories' },
};

/** só o que muda em inglês (o resto é nome de tecnologia, igual nas duas línguas) */
const EN: Record<string, string> = {
  'Banco de dados': 'Databases',
  'BI & Dados': 'BI & Data',
  'Liderança & Processo': 'Leadership & Process',
  'Indexação': 'Indexing',
  'Modelagem dimensional': 'Dimensional modeling',
  'SQL analítico': 'Analytical SQL',
  'Supervisão de equipe': 'Team supervision',
};

@Component({
  selector: 'app-skills',
  standalone: true,
  template: `
    <section id="habilidades" class="py-16 sm:py-28 border-b border-zinc-900">
      <div class="wrap">
        <div class="mb-10 sm:mb-20 max-w-4xl">
          <div class="eyebrow mb-5">{{ t().eyebrow }}</div>
          <h2 class="section-title mb-6">{{ t().title1 }}<br>{{ t().title2 }}</h2>
          <p class="section-lead">{{ t().lead }}</p>
        </div>

        <!-- celular: uma categoria por vez (as demais seguem no HTML para buscadores) -->
        <div class="skill-tabs" role="tablist" [attr.aria-label]="t().tabsAria">
          @for (group of groups; track group.title; let i = $index) {
            <button type="button" role="tab" class="skill-tab" [class.is-active]="active() === i"
                    [attr.aria-selected]="active() === i" [attr.aria-controls]="'skills-' + i"
                    (click)="active.set(i)">
              {{ tr(group.title) }}
            </button>
          }
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-16">
          @for (group of groups; track group.title; let i = $index) {
            <div class="skill-group py-8 border-t border-zinc-900" [id]="'skills-' + i" role="tabpanel"
                 [class.is-active]="active() === i">
              <h3 class="text-zinc-100 font-medium mb-5 text-[0.9375rem]">{{ tr(group.title) }}</h3>
              <div class="flex flex-wrap gap-2">
                @for (pill of group.pills; track pill.name) {
                  <span class="pill">
                    {{ tr(pill.name) }}
                    @if (pill.years) {
                      <span class="ml-1.5 text-zinc-500 font-mono text-[11px]">{{ years(pill.years) }}</span>
                    }
                  </span>
                }
              </div>
            </div>
          }
        </div>
      </div>
    </section>
  `,
  styles: [`
    .skill-tabs { display: none; }

    @media (max-width: 639px) {
      .skill-tabs {
        display: flex;
        gap: .4rem;
        margin: 0 calc(-1 * var(--gutter, 1.5rem)) 1.25rem;
        padding: 0 var(--gutter, 1.5rem) .25rem;
        overflow-x: auto;
        scroll-snap-type: x proximity;
        scroll-padding-inline: var(--gutter, 1.5rem);
        scrollbar-width: none;
      }
      .skill-tabs::-webkit-scrollbar { display: none; }
      .skill-tab {
        flex: none;
        scroll-snap-align: start;
        padding: .5rem .9rem;
        border-radius: 999px;
        border: 1px solid var(--border);
        background: var(--bg-raised);
        color: var(--fg-muted);
        font-size: .8125rem;
        white-space: nowrap;
        transition: color .2s, border-color .2s, background .2s;
      }
      .skill-tab.is-active { color: var(--bg); background: var(--fg); border-color: var(--fg); font-weight: 500; }

      .skill-group { display: none; }
      .skill-group.is-active { display: block; padding-top: 1.25rem; animation: skill-in .25s ease-out; }
      .skill-group h3 { display: none; }
      @keyframes skill-in { from { opacity: 0; transform: translateY(4px); } }
    }
  `]
})
export class SkillsComponent {
  readonly active = signal(0);
  private readonly i18n = inject(LanguageService);
  readonly t = computed(() => COPY[this.i18n.lang()]);

  tr(text: string): string {
    return this.i18n.isEn() ? EN[text] ?? text : text;
  }

  /** "7a" (anos) vira "7y" em inglês */
  years(value: string): string {
    return this.i18n.isEn() ? value.replace(/a$/, 'y') : value;
  }

  groups: SkillGroup[] = [
    {
      title: 'Backend',
      pills: [
        { name: 'PHP', years: '7a' }, { name: 'Laravel', years: '6a' }, { name: 'Node.js', years: '5a' },
        { name: 'Python', years: '3a' }, { name: 'REST API' }, { name: 'SOAP' },
        { name: 'AWS SQS' }, { name: 'Redis' }, { name: 'WebSocket' },
        { name: 'JWT / SSO' }, { name: 'OpenAPI' }, { name: 'Cron Jobs' },
      ],
    },
    {
      title: 'Banco de dados',
      pills: [
        { name: 'MySQL', years: '5a' }, { name: 'PostgreSQL', years: '4a' }, { name: 'SQL Server', years: '4a' },
        { name: 'MongoDB', years: '3a' }, { name: 'Stored Procedures' }, { name: 'Triggers & Views' },
        { name: 'Indexação' }, { name: 'Migrations' },
      ],
    },
    {
      title: 'Frontend',
      pills: [
        { name: 'JavaScript', years: '7a' }, { name: 'Vue.js', years: '5a' }, { name: 'TypeScript', years: '4a' },
        { name: 'React', years: '3a' }, { name: 'React Native', years: '2a' }, { name: 'Angular', years: '2a' },
        { name: 'HTML5 & CSS3' }, { name: 'Tailwind CSS' },
      ],
    },
    {
      title: 'BI & Dados',
      pills: [
        { name: 'Power BI' }, { name: 'DAX' }, { name: 'Pentaho ETL' },
        { name: 'Modelagem dimensional' }, { name: 'Star Schema' }, { name: 'SQL analítico' },
      ],
    },
    {
      title: 'DevOps & Cloud',
      pills: [
        { name: 'Docker' }, { name: 'Git' }, { name: 'GitLab CI' }, { name: 'GitHub Actions' },
        { name: 'CI/CD' }, { name: 'AWS (S3, SQS)' }, { name: 'Azure' }, { name: 'Azure Functions' },
        { name: 'Firebase' }, { name: 'Linux' },
      ],
    },
    {
      title: 'Liderança & Processo',
      pills: [
        { name: 'Supervisão de equipe' }, { name: 'Code Review' }, { name: 'GitFlow / Release' },
        { name: 'SOLID' }, { name: 'Clean Code' }, { name: 'Design Patterns' },
        { name: 'Scrum' }, { name: 'Kanban' }, { name: 'Jira' },
      ],
    },
  ];
}
