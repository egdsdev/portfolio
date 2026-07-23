import { Component } from '@angular/core';

interface ExperienceEntry {
  date: string;
  company: string;
  role: string;
  modality: string;
  bullets: string[];
}

@Component({
  selector: 'app-experience',
  standalone: true,
  templateUrl: './experience.component.html',
  styleUrls: ['./experience.component.scss']
})
export class ExperienceComponent {
  entries: ExperienceEntry[] = [
    {
      date: '2026',
      company: '🔐 ByToken',
      role: 'Desenvolvedor Full Stack',
      modality: 'Presencial, Goiânia, GO',
      bullets: [
        'Plataforma SaaS multi-tenant para gestão de certificados digitais ICP-Brasil (PHP, Laravel, Vue.js, PostgreSQL)',
        'Modelagem e otimização de banco de dados com stored procedures, triggers, views e índices para alta performance em ambiente multi-tenant',
        'Automação de rotinas com Laravel Scheduler (cron jobs): alertas de vencimento de certificados, sincronizações e relatórios periódicos',
        'Processamento assíncrono com Laravel Queues e Redis para envio de notificações, geração de documentos e tarefas de longa duração',
        'Monitoramento em tempo real de sites e processos via WebSocket, com painel de histórico e exportação de dados',
        'Módulo de procurações e-CAC com controle de status, bloqueio e integração com API externa da Receita Federal',
        'Análise de risco automatizada com IA (OpenAI e Gemini) e motor de regras de monitoramento configuráveis por tenant',
        'Autenticação 2FA, OAuth multi-host e controle granular de permissões por perfil (RBAC)',
        'Notificações push via Firebase, e-mails automáticos de vencimento e pipeline de CI/CD com GitHub Actions',
      ],
    },
    {
      date: '2025',
      company: '🛡️ EQ Seguros',
      role: 'Desenvolvedor Backend / BI',
      modality: 'Presencial, Goiânia, GO',
      bullets: [
        'Desenvolvimento e manutenção de dashboards analíticos no Power BI para acompanhamento de KPIs comerciais e operacionais',
        'Elaboração de queries SQL complexas no SQL Server para extração, tratamento e modelagem de dados para relatórios',
        'Criação de medidas e colunas calculadas com DAX para métricas de negócio (conversão, churn, comissões)',
        'Modelagem dimensional de dados (star schema) para otimização de desempenho nos relatórios',
      ],
    },
    {
      date: '2022 - 2025',
      company: '💡 Meeta Solutions',
      role: 'Desenvolvedor Backend',
      modality: 'Remoto',
      bullets: [
        'Desenvolvimento, integração e manutenção de sistemas corporativos com PHP/Laravel, SQL Server e PostgreSQL',
        'Criação e manutenção de stored procedures, functions, triggers e views para encapsular regras de negócio e garantir integridade dos dados',
        'Implementação de agendamentos com SQL Server Agent e cron jobs Linux para rotinas automáticas de processamento, relatórios e manutenção de dados',
        'Otimização de queries lentas com análise de plano de execução, criação de índices e refatoração de procedures críticas',
        'Migração de servidores de banco de dados de Windows Server para Linux, incluindo reescrita de procedures e ajuste de collation',
        'Desenvolvimento de sistemas distribuídos com múltiplos repositórios usando Python, Azure Functions (HTTP e Timer Triggers), React, React Native e MongoDB',
        'Criação e manutenção de APIs REST e SOAP com autenticação, versionamento e documentação',
        'Desenvolvimento de dashboards analíticos no Power BI com modelagem de dados e métricas em DAX',
      ],
    },
    {
      date: '2020 - 2023',
      company: '👟 Mattos & Cia Ltda',
      role: 'Desenvolvedor Full Stack Pleno',
      modality: 'Remoto',
      bullets: [
        'Desenvolvimento, implantação e manutenção de dashboards corporativos no Power BI com KPIs de produção, vendas e estoque',
        'Criação de pipelines ETL com Pentaho para integração e transformação de grandes volumes de dados entre múltiplos bancos (SQL Server, MySQL)',
        'Desenvolvimento de stored procedures, views e scripts SQL de automação para suporte aos pipelines de BI e geração de relatórios',
        'Modernização de sistema legado de fábrica de calçados: migração para aplicação web full stack (PHP, Vue.js, Node.js) com remodelagem completa do banco de dados',
        'Sistema desktop de autenticação e monitoramento de estações de trabalho com Electron (cross-platform)',
      ],
    },
    {
      date: '2022 - 2023',
      company: '📈 Sales Farm',
      role: 'Desenvolvedor Web Full Stack',
      modality: 'Remoto',
      bullets: [
        'Desenvolvimento de novas funcionalidades, correção de bugs e otimização de performance na plataforma de vendas (PHP/Laravel, MySQL)',
        'Análise e refatoração de queries e stored procedures para redução de tempo de resposta em relatórios de alta demanda',
        'Condução de code reviews, definição de padrões de código e boas práticas de desenvolvimento em equipe',
        'Mentoria e onboarding técnico de novos desenvolvedores, acelerando a curva de aprendizado do time',
        'Participação ativa em reuniões de planejamento de sprint, definição de stack e levantamento de requisitos',
      ],
    },
    {
      date: '2021 - 2022',
      company: '🌐 VirtuaMax Comunicação Ltda',
      role: 'Desenvolvedor Web Full Stack Pleno',
      modality: 'Remoto',
      bullets: [
        'Desenvolvimento de sites e landing pages responsivos (PHP, JavaScript, CSS3, HTML5, jQuery, Vue.js, Node.js, MySQL)',
        'Desenvolvimento full stack da plataforma Deskkio (sistema de suporte e atendimento ao cliente) com PHP/Laravel, Vue.js e MySQL',
        'Modelagem de banco de dados relacional, criação de queries otimizadas, relacionamentos complexos e stored procedures',
        'Integração de chatbot automatizado com Twilio para atendimento via WhatsApp e SMS',
        'Gestão de backlog, tarefas e sprints com metodologia ágil utilizando Jira',
      ],
    },
  ];
}
