import { Component, computed, inject, signal } from '@angular/core';
import { LanguageService, Lang } from '../../core/i18n/language.service';
import { AnalyticsService } from '../../core/services/analytics.service';

interface ExperienceEntry {
  date: string;
  company: string;
  /** O que a empresa faz — dá contexto de negócio para as entregas abaixo. */
  context: string;
  role: string;
  modality: string;
  stack: string[];
  bullets: string[];
}

const COPY: Record<Lang, {
  eyebrow: string; title1: string; title2: string; lead: string; current: string;
  earlier: string; show: string; hide: string; more: (n: number) => string;
}> = {
  pt: {
    eyebrow: '01 — Experiência', title1: 'Onde eu já', title2: 'entreguei software',
    lead: 'Sete anos construindo sistemas que rodam em produção — varejo automotivo, seguros, certificação digital e indústria. Do banco de dados e da infraestrutura à interface, hoje como desenvolvedor sênior e supervisor do backend de uma plataforma de ERP e dados.',
    current: 'Atual', earlier: 'Experiências anteriores', show: 'Ver detalhes', hide: 'Ocultar detalhes',
    more: (n) => `Mais ${n} entregas`,
  },
  en: {
    eyebrow: '01 — Experience', title1: 'Where I’ve', title2: 'shipped software',
    lead: 'Seven years building systems that run in production — automotive retail, insurance, digital certification and manufacturing. From databases and infrastructure to the interface; today a senior developer and backend supervisor for an ERP and data platform.',
    current: 'Current', earlier: 'Earlier experience', show: 'Show details', hide: 'Hide details',
    more: (n) => `${n} more highlights`,
  },
};

@Component({
  selector: 'app-experience',
  standalone: true,
  templateUrl: './experience.component.html',
  styleUrls: ['./experience.component.scss']
})
export class ExperienceComponent {
  private analytics = inject(AnalyticsService);
  private expandTracked = new Set<string>();
  private readonly i18n = inject(LanguageService);
  readonly t = computed(() => COPY[this.i18n.lang()]);
  readonly entries = computed(() => (this.i18n.isEn() ? this.en : this.pt));

  /** com o selo ao lado, a data do cargo atual não repete a palavra (Atual/Present) */
  dateLabel(date: string, first: boolean): string {
    return first ? date.replace(/\s(Atual|Present)$/, '') : date;
  }

  /** No celular, a partir deste índice os cargos aparecem compactos. */
  readonly OLDER_FROM = 3;
  readonly opened = signal<ReadonlySet<number>>(new Set());

  toggle(i: number, company: string): void {
    const next = new Set(this.opened());
    if (next.has(i)) next.delete(i);
    else {
      next.add(i);
      if (!this.expandTracked.has(company + i)) {
        this.expandTracked.add(company + i);
        void this.analytics.trackExperienceExpand(company);
      }
    }
    this.opened.set(next);
  }

  /** Só a abertura interessa, e uma vez por empresa. */
  onExpand(event: Event, company: string): void {
    const el = event.target as HTMLDetailsElement;
    if (!el.open || this.expandTracked.has(company)) return;
    this.expandTracked.add(company);
    void this.analytics.trackExperienceExpand(company);
  }

  // Os 2 primeiros bullets de cada entrada aparecem sem clique — por isso são
  // sempre os de maior impacto para quem está avaliando o currículo.
  private readonly pt: ExperienceEntry[] = [
    {
      date: '2026 — Atual',
      company: 'Dadus Fábrica de Software',
      context: 'Software house do setor automotivo — ERP, BI e integrações para distribuidores e varejo de autopeças',
      role: 'Desenvolvedor Full Stack Sênior · Supervisor de Backend',
      modality: 'Goiânia, GO',
      stack: ['PHP', 'Laravel', 'Python', 'Vue.js', 'PostgreSQL', 'Redis', 'AWS SQS', 'S3', 'Docker', 'GitLab CI'],
      bullets: [
        'Supervisiono a equipe de backend do ERP de autopeças e dos serviços ao redor: SSO, Data Warehouse, motor de relatórios e SDK de autenticação compartilhado (~12 serviços)',
        'Projetei o Data Warehouse do zero — modelo estrela em PostgreSQL com ETL em Python, carga incremental por watermark e consultas de BI servidas via fila SQS com cache em Redis',
        'Defini o processo de release adotado por todos os projetos: GitFlow com Release Candidate, versionamento semanal e automação de merge requests integrada ao Discord',
        'Construí o serviço de relatórios assíncrono: a API publica na fila SQS, worker Python gera PDF/CSV no S3 e devolve o resultado por Redis, sem prender a requisição do usuário',
        'Autenticação centralizada com SSO em Laravel e SDK PHP próprio (JWT/JWKS, PSR-15) consumido pelos demais serviços',
        'Conduzo code review e integração das entregas do time nas branches de desenvolvimento, além de manter a documentação de APIs em OpenAPI',
      ],
    },
    {
      date: '2026',
      company: 'ByToken',
      context: 'SaaS de governança de certificados digitais ICP-Brasil para escritórios contábeis',
      role: 'Desenvolvedor Full Stack',
      modality: 'Presencial · Goiânia, GO',
      stack: ['PHP', 'Laravel', 'Vue.js', 'PostgreSQL', 'Redis', 'WebSocket', 'Firebase'],
      bullets: [
        'Plataforma SaaS multi-tenant que centraliza o uso de certificados digitais: cada escritório controla quem acessa qual certificado, com trilha de auditoria e sem distribuir arquivo ou senha',
        'Otimização de banco em ambiente multi-tenant com stored procedures, triggers, views e índices, sustentando consultas sobre bases isoladas por cliente',
        'Processamento assíncrono com Laravel Queues e Redis para notificações, geração de documentos e tarefas de longa duração',
        'Automação de rotinas com Laravel Scheduler: alertas de vencimento de certificados, sincronizações e relatórios periódicos',
        'Monitoramento em tempo real de sites e processos via WebSocket, com painel de histórico e exportação de dados',
        'Módulo de procurações e-CAC com controle de status, bloqueio e integração com API da Receita Federal',
        'Análise de risco automatizada com IA (OpenAI e Gemini) e motor de regras configurável por tenant',
        'Autenticação 2FA, OAuth multi-host e controle granular de permissões por perfil (RBAC)',
        'Notificações push via Firebase e pipeline de CI/CD com GitHub Actions',
      ],
    },
    {
      date: '2025',
      company: 'EQ Seguros',
      context: 'Seguradora de vida e previdência autorizada pela SUSEP, com distribuição digital via parceiros',
      role: 'Desenvolvedor Backend / BI',
      modality: 'Presencial · Goiânia, GO',
      stack: ['SQL Server', 'Power BI', 'DAX', 'Modelagem dimensional'],
      bullets: [
        'Dashboards de Power BI sobre a operação de seguros — apólices, produção por canal e desempenho da rede de parceiros — usados pela área de negócio para decisão comercial',
        'Modelagem dimensional (star schema) e queries SQL complexas no SQL Server para sustentar relatórios sobre alto volume de vendas mensais',
        'Medidas e colunas calculadas em DAX para métricas do setor: conversão, churn de apólices e comissionamento',
      ],
    },
    {
      date: '2022 — 2025',
      company: 'Meeta Solutions',
      context: 'Fábrica de software de CX e inteligência de dados, com soluções para operações de atendimento na América Latina',
      role: 'Desenvolvedor Backend',
      modality: 'Remoto',
      stack: ['PHP', 'Laravel', 'SQL Server', 'PostgreSQL', 'Python', 'Azure Functions', 'React Native', 'MongoDB'],
      bullets: [
        'Otimização de queries lentas com análise de plano de execução, criação de índices e refatoração de procedures críticas em bases de alto volume de atendimento',
        'Migração de servidores de banco de dados de Windows Server para Linux, incluindo reescrita de procedures e ajuste de collation',
        'Desenvolvimento e manutenção de sistemas corporativos sob demanda para clientes, com PHP/Laravel, SQL Server e PostgreSQL',
        'Stored procedures, functions, triggers e views para encapsular regras de negócio e garantir integridade dos dados',
        'Agendamentos com SQL Server Agent e cron jobs Linux para rotinas de processamento, relatórios e manutenção',
        'Sistemas distribuídos com múltiplos repositórios usando Python, Azure Functions (HTTP e Timer Triggers), React, React Native e MongoDB',
        'APIs REST e SOAP com autenticação, versionamento e documentação',
        'Dashboards analíticos no Power BI com modelagem de dados e métricas em DAX',
      ],
    },
    {
      date: '2020 — 2023',
      company: 'Dadus Fábrica de Software',
      context: 'Mesma empresa onde atuo hoje, em uma passagem anterior — na época com operação industrial e sistemas internos',
      role: 'Desenvolvedor Full Stack Pleno',
      modality: 'Remoto',
      stack: ['Power BI', 'Pentaho ETL', 'SQL Server', 'MySQL', 'PHP', 'Vue.js', 'Electron'],
      bullets: [
        'Modernização de sistema legado de fábrica de calçados: migração para aplicação web full stack (PHP, Vue.js, Node.js) com remodelagem completa do banco',
        'Pipelines ETL com Pentaho integrando grandes volumes de dados entre SQL Server e MySQL',
        'Dashboards corporativos no Power BI com KPIs de produção, vendas e estoque',
        'Stored procedures, views e scripts SQL de automação para suporte aos pipelines de BI',
        'Sistema desktop cross-platform de autenticação e monitoramento de estações de trabalho com Electron',
      ],
    },
    {
      date: '2022 — 2023',
      company: 'SalesFarm',
      context: 'Startup de Sales as a Service — plataforma que conecta empresas a vendedores e SDRs terceirizados',
      role: 'Desenvolvedor Web Full Stack',
      modality: 'Remoto',
      stack: ['PHP', 'Laravel', 'MySQL', 'Code review', 'Scrum'],
      bullets: [
        'Refatoração de queries e stored procedures para reduzir o tempo de resposta dos relatórios de performance de vendas, consultados por gestores durante a operação',
        'Mentoria e onboarding técnico de novos desenvolvedores, conduzindo code reviews e definindo padrões do time em fase de crescimento acelerado',
        'Novas funcionalidades, correção de bugs e otimização de performance na plataforma que conecta vendedores às empresas contratantes',
        'Participação em planejamento de sprint, definição de stack e levantamento de requisitos',
      ],
    },
    {
      date: '2021 — 2022',
      company: 'VirtuaMax Comunicação',
      context: 'Agência de comunicação e desenvolvimento web, com produto próprio de atendimento ao cliente',
      role: 'Desenvolvedor Web Full Stack Pleno',
      modality: 'Remoto',
      stack: ['PHP', 'Laravel', 'Vue.js', 'MySQL', 'Twilio', 'Jira'],
      bullets: [
        'Desenvolvimento full stack do Deskkio, produto de help desk da empresa: tickets, histórico de atendimento e painel do operador (PHP/Laravel, Vue.js, MySQL)',
        'Integração de chatbot automatizado com Twilio para atendimento via WhatsApp e SMS, reduzindo o volume que chegava ao atendimento humano',
        'Modelagem de banco relacional com relacionamentos complexos, queries otimizadas e stored procedures',
        'Sites e landing pages responsivos (PHP, JavaScript, CSS3, HTML5, Vue.js, Node.js, MySQL)',
      ],
    },
  ];

  private readonly en: ExperienceEntry[] = [
    {
      date: '2026 — Present',
      company: 'Dadus Fábrica de Software',
      context: 'Automotive-sector software house — ERP, BI and integrations for auto parts distributors and retailers',
      role: 'Senior Full Stack Developer · Backend Supervisor',
      modality: 'Goiânia, Brazil',
      stack: ['PHP', 'Laravel', 'Python', 'Vue.js', 'PostgreSQL', 'Redis', 'AWS SQS', 'S3', 'Docker', 'GitLab CI'],
      bullets: [
        'I supervise the backend team for the auto parts ERP and its surrounding services: SSO, Data Warehouse, reporting engine and a shared authentication SDK (~12 services)',
        'Designed the Data Warehouse from scratch — star schema on PostgreSQL with Python ETL, watermark-based incremental loads and BI queries served through an SQS queue with Redis caching',
        'Defined the release process adopted by every project: GitFlow with Release Candidates, weekly versioning and merge request automation integrated with Discord',
        'Built the asynchronous reporting service: the API publishes to an SQS queue, a Python worker generates PDF/CSV files on S3 and returns the result via Redis, without blocking the user request',
        'Centralized authentication with a Laravel SSO and an in-house PHP SDK (JWT/JWKS, PSR-15) used by the other services',
        'I lead code reviews and the integration of the team’s deliveries into the development branches, and maintain the API documentation in OpenAPI',
      ],
    },
    {
      date: '2026',
      company: 'ByToken',
      context: 'SaaS for governance of ICP-Brasil digital certificates for accounting firms',
      role: 'Full Stack Developer',
      modality: 'On-site · Goiânia, Brazil',
      stack: ['PHP', 'Laravel', 'Vue.js', 'PostgreSQL', 'Redis', 'WebSocket', 'Firebase'],
      bullets: [
        'Multi-tenant SaaS platform that centralizes the use of digital certificates: each firm controls who can use which certificate, with an audit trail and without sharing files or passwords',
        'Database optimization in a multi-tenant environment with stored procedures, triggers, views and indexes, supporting queries over per-client isolated databases',
        'Asynchronous processing with Laravel Queues and Redis for notifications, document generation and long-running tasks',
        'Automated routines with Laravel Scheduler: certificate expiration alerts, synchronizations and periodic reports',
        'Real-time monitoring of websites and processes via WebSocket, with a history dashboard and data export',
        'Power of attorney module for e-CAC (Brazilian Federal Revenue portal) with status control, blocking and integration with the Federal Revenue API',
        'Automated risk analysis with AI (OpenAI and Gemini) and a rules engine configurable per tenant',
        '2FA authentication, multi-host OAuth and granular role-based access control (RBAC)',
        'Push notifications via Firebase and a CI/CD pipeline with GitHub Actions',
      ],
    },
    {
      date: '2025',
      company: 'EQ Seguros',
      context: 'Life insurance and pension company authorized by SUSEP (Brazil’s insurance regulator), with digital distribution through partners',
      role: 'Backend / BI Developer',
      modality: 'On-site · Goiânia, Brazil',
      stack: ['SQL Server', 'Power BI', 'DAX', 'Dimensional modeling'],
      bullets: [
        'Power BI dashboards on insurance operations — policies, production by channel and partner network performance — used by the business team for commercial decisions',
        'Dimensional modeling (star schema) and complex SQL queries on SQL Server to support reports over high monthly sales volumes',
        'DAX measures and calculated columns for industry metrics: conversion, policy churn and commissions',
      ],
    },
    {
      date: '2022 — 2025',
      company: 'Meeta Solutions',
      context: 'Software factory for customer experience and data intelligence, building solutions for customer service operations in Latin America',
      role: 'Backend Developer',
      modality: 'Remote',
      stack: ['PHP', 'Laravel', 'SQL Server', 'PostgreSQL', 'Python', 'Azure Functions', 'React Native', 'MongoDB'],
      bullets: [
        'Optimized slow queries through execution plan analysis, new indexes and refactoring of critical procedures on high-volume customer service databases',
        'Migrated database servers from Windows Server to Linux, including rewriting procedures and adjusting collation',
        'Developed and maintained custom business systems for clients with PHP/Laravel, SQL Server and PostgreSQL',
        'Stored procedures, functions, triggers and views to encapsulate business rules and ensure data integrity',
        'Scheduled jobs with SQL Server Agent and Linux cron for processing routines, reports and maintenance',
        'Distributed systems across multiple repositories using Python, Azure Functions (HTTP and Timer Triggers), React, React Native and MongoDB',
        'REST and SOAP APIs with authentication, versioning and documentation',
        'Analytical Power BI dashboards with data modeling and DAX metrics',
      ],
    },
    {
      date: '2020 — 2023',
      company: 'Dadus Fábrica de Software',
      context: 'Same company I work for today, in an earlier stint — back then focused on industrial operations and internal systems',
      role: 'Mid-level Full Stack Developer',
      modality: 'Remote',
      stack: ['Power BI', 'Pentaho ETL', 'SQL Server', 'MySQL', 'PHP', 'Vue.js', 'Electron'],
      bullets: [
        'Modernized a shoe factory’s legacy system: migration to a full stack web application (PHP, Vue.js, Node.js) with a complete database redesign',
        'ETL pipelines with Pentaho integrating large data volumes between SQL Server and MySQL',
        'Corporate Power BI dashboards with production, sales and inventory KPIs',
        'Stored procedures, views and SQL automation scripts supporting the BI pipelines',
        'Cross-platform desktop system for workstation authentication and monitoring, built with Electron',
      ],
    },
    {
      date: '2022 — 2023',
      company: 'SalesFarm',
      context: 'Sales-as-a-Service startup — a platform connecting companies to outsourced salespeople and SDRs',
      role: 'Full Stack Web Developer',
      modality: 'Remote',
      stack: ['PHP', 'Laravel', 'MySQL', 'Code review', 'Scrum'],
      bullets: [
        'Refactored queries and stored procedures to cut the response time of the sales performance reports managers used during operations',
        'Mentoring and technical onboarding of new developers, leading code reviews and setting team standards during a period of rapid growth',
        'New features, bug fixes and performance optimization on the platform connecting salespeople to client companies',
        'Took part in sprint planning, stack decisions and requirements gathering',
      ],
    },
    {
      date: '2021 — 2022',
      company: 'VirtuaMax Comunicação',
      context: 'Communication and web development agency with its own customer service product',
      role: 'Mid-level Full Stack Web Developer',
      modality: 'Remote',
      stack: ['PHP', 'Laravel', 'Vue.js', 'MySQL', 'Twilio', 'Jira'],
      bullets: [
        'Full stack development of Deskkio, the company’s help desk product: tickets, service history and operator dashboard (PHP/Laravel, Vue.js, MySQL)',
        'Integrated an automated Twilio chatbot for WhatsApp and SMS support, reducing the volume that reached human agents',
        'Relational database modeling with complex relationships, optimized queries and stored procedures',
        'Responsive websites and landing pages (PHP, JavaScript, CSS3, HTML5, Vue.js, Node.js, MySQL)',
      ],
    },
  ];
}
