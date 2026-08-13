import { Component } from '@angular/core';

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
}
