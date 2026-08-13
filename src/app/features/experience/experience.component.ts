import { Component } from '@angular/core';

interface ExperienceEntry {
  date: string;
  company: string;
  role: string;
  modality: string;
  stack: string[];
  bullets: string[];
}

@Component({
  selector: 'app-experience',
  standalone: true,
  templateUrl: './experience.component.html',
  styleUrls: ['./experience.component.scss']
})
export class ExperienceComponent {
  // Os 2 primeiros bullets de cada entrada aparecem sem clique — por isso são
  // sempre os de maior impacto para quem está avaliando o currículo.
  entries: ExperienceEntry[] = [
    {
      date: '2026 — Atual',
      company: 'Dadus',
      role: 'Supervisor da Equipe de Backend',
      modality: 'Goiânia, GO',
      stack: ['PHP', 'Laravel', 'Python', 'Vue.js', 'PostgreSQL', 'Redis', 'AWS SQS', 'S3', 'Docker', 'GitLab CI'],
      bullets: [
        'Supervisiono a equipe de backend em uma plataforma distribuída de ~12 serviços: ERP, SSO, Data Warehouse, motor de relatórios e SDK de autenticação compartilhado',
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
      role: 'Desenvolvedor Full Stack',
      modality: 'Presencial · Goiânia, GO',
      stack: ['PHP', 'Laravel', 'Vue.js', 'PostgreSQL', 'Redis', 'WebSocket', 'Firebase'],
      bullets: [
        'Plataforma SaaS multi-tenant para gestão de certificados digitais ICP-Brasil, do banco de dados à interface (PHP, Laravel, Vue.js, PostgreSQL)',
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
      role: 'Desenvolvedor Backend / BI',
      modality: 'Presencial · Goiânia, GO',
      stack: ['SQL Server', 'Power BI', 'DAX', 'Modelagem dimensional'],
      bullets: [
        'Dashboards analíticos no Power BI para acompanhamento de KPIs comerciais e operacionais usados pela área de negócio',
        'Modelagem dimensional (star schema) e queries SQL complexas no SQL Server para reduzir o tempo de carga dos relatórios',
        'Medidas e colunas calculadas em DAX para métricas de negócio: conversão, churn e comissões',
      ],
    },
    {
      date: '2022 — 2025',
      company: 'Meeta Solutions',
      role: 'Desenvolvedor Backend',
      modality: 'Remoto',
      stack: ['PHP', 'Laravel', 'SQL Server', 'PostgreSQL', 'Python', 'Azure Functions', 'React Native', 'MongoDB'],
      bullets: [
        'Otimização de queries lentas com análise de plano de execução, criação de índices e refatoração de procedures críticas',
        'Migração de servidores de banco de dados de Windows Server para Linux, incluindo reescrita de procedures e ajuste de collation',
        'Desenvolvimento e manutenção de sistemas corporativos com PHP/Laravel, SQL Server e PostgreSQL',
        'Stored procedures, functions, triggers e views para encapsular regras de negócio e garantir integridade dos dados',
        'Agendamentos com SQL Server Agent e cron jobs Linux para rotinas de processamento, relatórios e manutenção',
        'Sistemas distribuídos com múltiplos repositórios usando Python, Azure Functions (HTTP e Timer Triggers), React, React Native e MongoDB',
        'APIs REST e SOAP com autenticação, versionamento e documentação',
        'Dashboards analíticos no Power BI com modelagem de dados e métricas em DAX',
      ],
    },
    {
      date: '2020 — 2023',
      company: 'Dadus (ex-Mattos & Cia)',
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
      company: 'Sales Farm',
      role: 'Desenvolvedor Web Full Stack',
      modality: 'Remoto',
      stack: ['PHP', 'Laravel', 'MySQL', 'Code review', 'Scrum'],
      bullets: [
        'Refatoração de queries e stored procedures para redução do tempo de resposta em relatórios de alta demanda',
        'Mentoria e onboarding técnico de novos desenvolvedores, conduzindo code reviews e definindo padrões do time',
        'Novas funcionalidades, correção de bugs e otimização de performance na plataforma de vendas',
        'Participação em planejamento de sprint, definição de stack e levantamento de requisitos',
      ],
    },
    {
      date: '2021 — 2022',
      company: 'VirtuaMax Comunicação',
      role: 'Desenvolvedor Web Full Stack Pleno',
      modality: 'Remoto',
      stack: ['PHP', 'Laravel', 'Vue.js', 'MySQL', 'Twilio', 'Jira'],
      bullets: [
        'Desenvolvimento full stack da plataforma Deskkio (suporte e atendimento ao cliente) com PHP/Laravel, Vue.js e MySQL',
        'Integração de chatbot automatizado com Twilio para atendimento via WhatsApp e SMS',
        'Modelagem de banco relacional com relacionamentos complexos, queries otimizadas e stored procedures',
        'Sites e landing pages responsivos (PHP, JavaScript, CSS3, HTML5, Vue.js, Node.js, MySQL)',
      ],
    },
  ];
}
