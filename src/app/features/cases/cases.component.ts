import { Component, inject } from '@angular/core';
import { AnalyticsService } from '../../core/services/analytics.service';

interface FlowStep {
  label: string;
  /** detalhe curto embaixo do nome */
  note?: string;
  /** peça central da solução: ganha destaque no diagrama */
  key?: boolean;
}

interface Case {
  id: string;
  where: string;
  title: string;
  goal: string;
  flow: FlowStep[];
  decisions: string[];
  stack: string[];
  link?: { href: string; label: string };
}

@Component({
  selector: 'app-cases',
  standalone: true,
  template: `
    <section id="cases" class="py-20 sm:py-28 border-b border-zinc-900">
      <div class="wrap">
        <div class="mb-12 sm:mb-20 max-w-4xl">
          <div class="eyebrow mb-5">02 — Cases</div>
          <h2 class="section-title mb-6">Como eu resolvo<br>problemas</h2>
          <p class="section-lead">
            Alguns sistemas que projetei, explicados como numa entrevista técnica: o objetivo,
            o desenho da solução e as decisões que fizeram diferença.
          </p>
        </div>

        <div class="cases">
          @for (c of cases; track c.id; let i = $index) {
            <article class="case" [attr.aria-labelledby]="'case-' + c.id">
              <div class="case-body">
                <div class="eyebrow case-where">{{ (i + 1).toString().padStart(2, '0') }} · {{ c.where }}</div>
                <h3 class="case-title" [id]="'case-' + c.id">{{ c.title }}</h3>
                <p class="case-goal">{{ c.goal }}</p>

                <p class="case-label">Decisões que importaram</p>
                <ul class="case-decisions">
                  @for (d of c.decisions; track d) { <li>{{ d }}</li> }
                </ul>

                <div class="case-stack">
                  @for (s of c.stack; track s) { <span class="pill">{{ s }}</span> }
                </div>

                @if (c.link; as link) {
                  <a class="case-link" [href]="link.href" target="_blank" rel="noopener noreferrer" (click)="onLink(c.id)">
                    {{ link.label }} <span aria-hidden="true">→</span>
                  </a>
                }
              </div>

              <div class="case-flow">
                <p class="case-label">Arquitetura</p>
                <ol [attr.aria-label]="'Fluxo da arquitetura: ' + c.title">
                  @for (s of c.flow; track s.label) {
                    <li [class.is-key]="s.key">
                      <span class="node-label">{{ s.label }}</span>
                      @if (s.note) { <span class="node-note">{{ s.note }}</span> }
                    </li>
                  }
                </ol>
              </div>
            </article>
          }
        </div>
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }

    .cases { display: flex; flex-direction: column; }

    .case {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.75rem;
      padding: 2.5rem 0;
      border-top: 1px solid var(--border);
    }
    .case:last-child { border-bottom: 1px solid var(--border); }
    @media (min-width: 960px) {
      .case { grid-template-columns: minmax(0, 1fr) minmax(16rem, 22rem); gap: 4rem; padding: 3rem 0; }
    }

    .case-where { margin-bottom: .75rem; }
    .case-title {
      font-family: var(--font-display);
      font-size: clamp(1.35rem, 2.4vw, 1.75rem);
      font-weight: 600;
      letter-spacing: -0.02em;
      color: var(--fg);
      line-height: 1.2;
    }
    .case-goal { margin-top: .75rem; color: var(--fg-muted); font-size: 1rem; line-height: 1.65; max-width: 62ch; }

    .case-label {
      margin: 1.5rem 0 .75rem;
      font-family: var(--font-mono);
      font-size: .6875rem;
      letter-spacing: .14em;
      text-transform: uppercase;
      color: var(--fg-faint);
    }
    .case-flow .case-label { margin-top: 0; }

    .case-decisions { list-style: none; display: flex; flex-direction: column; gap: .6rem; max-width: 66ch; }
    .case-decisions li { position: relative; padding-left: 1.25rem; color: var(--fg-muted); font-size: .9375rem; line-height: 1.6; }
    .case-decisions li::before { content: ''; position: absolute; left: 0; top: .7em; width: 6px; height: 1px; background: var(--fg-faint); }

    .case-stack { display: flex; flex-wrap: wrap; gap: .4rem; margin-top: 1.5rem; }

    .case-link {
      display: inline-flex; align-items: center; gap: .4rem;
      margin-top: 1.5rem;
      font-size: .9375rem; font-weight: 500;
      color: var(--fg);
      border-bottom: 1px solid var(--border-hi);
      padding-bottom: .15rem;
      transition: border-color .2s;
    }
    .case-link:hover { border-color: var(--fg); }

    /* Diagrama: etapas ligadas por uma linha vertical */
    .case-flow {
      align-self: start;
      padding: 1.25rem 1.25rem 1.4rem;
      border: 1px solid var(--border);
      border-radius: .875rem;
      background: var(--bg-raised);
    }
    .case-flow ol { list-style: none; display: flex; flex-direction: column; gap: .7rem; position: relative; }
    .case-flow li {
      position: relative;
      display: flex; flex-direction: column; gap: .1rem;
      padding: .55rem .8rem .55rem 2rem;
      border-radius: .6rem;
      border: 1px solid var(--border);
      background: var(--surface);
    }
    /* bolinha de cada etapa */
    .case-flow li::before {
      content: '';
      position: absolute; left: .8rem; top: 50%;
      width: .45rem; height: .45rem; margin-top: -.225rem;
      border-radius: 999px;
      background: var(--fg-faint);
    }
    /* conector até a próxima etapa */
    .case-flow li:not(:last-child)::after {
      content: '';
      position: absolute; left: calc(.8rem + .2rem); top: 100%;
      width: 1px; height: .7rem;
      background: var(--border-hi);
    }
    .case-flow li.is-key { border-color: rgba(255, 90, 31, .45); background: rgba(255, 90, 31, .08); }
    .case-flow li.is-key::before { background: #ff5a1f; box-shadow: 0 0 8px rgba(255, 90, 31, .7); }
    .node-label { font-size: .875rem; color: var(--fg); font-weight: 500; }
    .node-note { font-size: .75rem; color: var(--fg-muted); }

    /* Celular/tablet: fluxo horizontal compacto (etapas → etapas), sem as notas */
    @media (max-width: 959px) {
      .case-flow { padding: 1rem; }
      .case-flow ol { flex-direction: row; flex-wrap: wrap; align-items: center; gap: .55rem 1.35rem; }
      .case-flow li { padding: .35rem .65rem; }
      .case-flow li::before { display: none; }
      .case-flow li:not(:last-child)::after {
        content: '→';
        left: auto; right: -1.05rem; top: 50%;
        width: auto; height: auto;
        transform: translateY(-50%);
        background: none;
        color: var(--fg-faint);
        font-size: .8rem;
      }
      .node-label { font-size: .8125rem; }
      .node-note { display: none; }
    }
  `],
})
export class CasesComponent {
  private analytics = inject(AnalyticsService);

  readonly cases: Case[] = [
    {
      id: 'data-warehouse',
      where: 'Dadus Fábrica de Software',
      title: 'Data Warehouse do zero para o ERP de autopeças',
      goal: 'Dar ao BI uma base analítica própria, separada do banco transacional do ERP, com dados atualizados de forma incremental.',
      flow: [
        { label: 'ERP', note: 'banco transacional' },
        { label: 'ETL em Python', note: 'carga incremental por watermark' },
        { label: 'Data Warehouse', note: 'PostgreSQL · modelo estrela', key: true },
        { label: 'Fila AWS SQS', note: 'consultas de BI' },
        { label: 'Cache Redis' },
        { label: 'Relatórios e dashboards' },
      ],
      decisions: [
        'Modelo estrela (fatos e dimensões): consultas analíticas simples de escrever e rápidas de executar.',
        'Carga incremental por watermark: cada execução processa só o que mudou desde a anterior.',
        'Consultas servidas por fila SQS com cache em Redis: relatório pesado não disputa recurso com a API, e consulta repetida sai do cache.',
      ],
      stack: ['PostgreSQL', 'Python', 'AWS SQS', 'Redis'],
    },
    {
      id: 'relatorios',
      where: 'Dadus Fábrica de Software',
      title: 'Relatórios pesados sem travar o usuário',
      goal: 'Gerar relatórios em PDF e CSV de forma assíncrona: a tela continua responsiva enquanto o arquivo é produzido.',
      flow: [
        { label: 'API Laravel', note: 'recebe o pedido e responde na hora' },
        { label: 'Fila AWS SQS' },
        { label: 'Worker Python', note: 'gera PDF/CSV', key: true },
        { label: 'AWS S3', note: 'guarda o arquivo' },
        { label: 'Redis', note: 'devolve o resultado' },
      ],
      decisions: [
        'A API só publica o pedido na fila: nenhuma requisição fica presa esperando o relatório.',
        'Worker em Python dedicado à geração, separado da API.',
        'Arquivo no S3 e resultado entregue via Redis: o usuário recebe o link quando o arquivo fica pronto.',
      ],
      stack: ['Laravel', 'Python', 'AWS SQS', 'AWS S3', 'Redis'],
    },
    {
      id: 'sso',
      where: 'Dadus Fábrica de Software',
      title: 'Login único para ~12 serviços com SDK próprio',
      goal: 'Centralizar a autenticação da plataforma para que nenhum serviço precise reimplementar login e validação de token.',
      flow: [
        { label: 'Usuário' },
        { label: 'SSO em Laravel', note: 'emite o token JWT', key: true },
        { label: 'SDK PHP próprio', note: 'valida via JWKS · middleware PSR-15' },
        { label: 'Serviços da plataforma', note: 'ERP, Data Warehouse, relatórios…' },
      ],
      decisions: [
        'Um único ponto de login (SSO) emitindo tokens JWT para todos os serviços.',
        'SDK PHP compartilhado que valida os tokens com as chaves públicas (JWKS), plugado como middleware PSR-15.',
        'Cada serviço só instala o SDK: autenticação igual em todos e manutenção em um lugar só.',
      ],
      stack: ['Laravel', 'PHP', 'JWT', 'JWKS', 'PSR-15'],
    },
    {
      id: 'saas-certificados',
      where: 'ByToken',
      title: 'SaaS multi-tenant de certificados digitais',
      goal: 'Permitir que escritórios contábeis usem certificados digitais ICP-Brasil com controle de acesso e auditoria, sem distribuir arquivo ou senha.',
      flow: [
        { label: 'Escritório (tenant)' },
        { label: 'Login 2FA + RBAC', note: 'quem pode usar qual certificado' },
        { label: 'Uso do certificado', note: 'sem expor arquivo ou senha', key: true },
        { label: 'Trilha de auditoria' },
      ],
      decisions: [
        'Bases isoladas por cliente, com procedures, triggers, views e índices para manter as consultas rápidas.',
        'Tarefas longas em Laravel Queues com Redis e alertas de vencimento automáticos com o Scheduler.',
        'Monitoramento em tempo real por WebSocket e integração com a API da Receita Federal (procurações e-CAC).',
      ],
      stack: ['Laravel', 'Vue.js', 'PostgreSQL', 'Redis', 'WebSocket'],
    },
    {
      id: 'portfolio',
      where: 'Projeto pessoal · código aberto',
      title: 'Este portfólio, com analytics próprio',
      goal: 'Um site pessoal que também mede como recrutadores navegam: origem das visitas, seções lidas e contatos, num painel em tempo real.',
      flow: [
        { label: 'Visitante', note: 'Angular 20' },
        { label: 'Eventos de navegação', note: 'seções vistas, cliques, currículo' },
        { label: 'Firestore', key: true },
        { label: 'Painel em tempo real', note: 'mapa ao vivo, funil, leads' },
      ],
      decisions: [
        'Intro em canvas com milhares de partículas, otimizada para celular (cache do que está parado e repouso sem interação).',
        'SDK do Firebase carregado sob demanda: o JavaScript inicial caiu de 1 MB para 519 KB.',
        'Painel administrativo com dados em tempo real (onSnapshot) e mapa sincronizado com a lista de visitantes.',
      ],
      stack: ['Angular', 'TypeScript', 'Firebase', 'Canvas', 'Tailwind CSS'],
      link: { href: 'https://github.com/egdsdev/portfolio', label: 'Ver o código no GitHub' },
    },
  ];

  onLink(id: string): void {
    void this.analytics.trackCtaClick(`case_${id}_code`, 'cases', 'project');
  }
}
