import { Component } from '@angular/core';

interface SkillPill {
  name: string;
  years?: string;
}

interface SkillGroup {
  title: string;
  pills: SkillPill[];
}

@Component({
  selector: 'app-skills',
  standalone: true,
  template: `
    <section id="habilidades" class="py-20 sm:py-28 px-6 sm:px-8 border-b border-zinc-900">
      <div class="max-w-6xl mx-auto">
        <div class="mb-12 sm:mb-20 max-w-4xl">
          <div class="eyebrow mb-5">02 — Stack</div>
          <h2 class="section-title mb-6">O que eu uso<br>no dia a dia</h2>
          <p class="section-lead">
            Anos indicam tempo de uso em projetos reais, não em cursos.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-16">
          @for (group of groups; track group.title) {
            <div class="py-8 border-t border-zinc-900">
              <h3 class="text-zinc-100 font-medium mb-5 text-[0.9375rem]">{{ group.title }}</h3>
              <div class="flex flex-wrap gap-2">
                @for (pill of group.pills; track pill.name) {
                  <span class="pill">
                    {{ pill.name }}
                    @if (pill.years) {
                      <span class="ml-1.5 text-zinc-600 font-mono text-[11px]">{{ pill.years }}</span>
                    }
                  </span>
                }
              </div>
            </div>
          }
        </div>
      </div>
    </section>
  `
})
export class SkillsComponent {
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
