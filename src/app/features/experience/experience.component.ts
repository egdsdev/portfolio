import { Component } from '@angular/core';
import { NgxTimelineComponent, TimelineEntry } from '@omnedia/ngx-timeline';

@Component({
  selector: 'app-experience',
  standalone: true,
  imports: [NgxTimelineComponent],
  templateUrl: './experience.component.html',
  styleUrls: ['./experience.component.scss']
})
export class ExperienceComponent {
  timelineData: TimelineEntry[] = [
    {
      title: `<div class="timeline-title">
        <div class="date">2026</div>
        <div class="company">ByToken</div>
      </div>`,
      content: `<div class="timeline-content">
        <strong>Desenvolvedor Full Stack</strong> (Presencial, Goiânia, GO)
        <details class="experience-details"><summary class="experience-summary">Ver detalhes</summary>
        <ul>
          <li>Plataforma SaaS multi-tenant para gestão de certificados digitais ICP-Brasil (PHP, Laravel, Vue.js, PostgreSQL)</li>
          <li>Modelagem e otimização de banco de dados com stored procedures, triggers, views e índices para alta performance em ambiente multi-tenant</li>
          <li>Automação de rotinas com Laravel Scheduler (cron jobs): alertas de vencimento de certificados, sincronizações e relatórios periódicos</li>
          <li>Processamento assíncrono com Laravel Queues e Redis para envio de notificações, geração de documentos e tarefas de longa duração</li>
          <li>Monitoramento em tempo real de sites e processos via WebSocket, com painel de histórico e exportação de dados</li>
          <li>Módulo de procurações e-CAC com controle de status, bloqueio e integração com API externa da Receita Federal</li>
          <li>Análise de risco automatizada com IA (OpenAI e Gemini) e motor de regras de monitoramento configuráveis por tenant</li>
          <li>Autenticação 2FA, OAuth multi-host e controle granular de permissões por perfil (RBAC)</li>
          <li>Notificações push via Firebase, e-mails automáticos de vencimento e pipeline de CI/CD com GitHub Actions</li>
        </ul>
        </details>
      </div>`
    },
    {
      title: `<div class="timeline-title">
        <div class="date">2025</div>
        <div class="company">EQ Seguros</div>
      </div>`,
      content: `<div class="timeline-content">
        <strong>Desenvolvedor Backend / BI</strong> (Presencial, Goiânia, GO)
        <details class="experience-details"><summary class="experience-summary">Ver detalhes</summary>
        <ul>
          <li>Desenvolvimento e manutenção de dashboards analíticos no Power BI para acompanhamento de KPIs comerciais e operacionais</li>
          <li>Elaboração de queries SQL complexas no SQL Server para extração, tratamento e modelagem de dados para relatórios</li>
          <li>Criação de medidas e colunas calculadas com DAX para métricas de negócio (conversão, churn, comissões)</li>
          <li>Modelagem dimensional de dados (star schema) para otimização de desempenho nos relatórios</li>
        </ul>
        </details>
      </div>`
    },
    {
      title: `<div class="timeline-title">
        <div class="date">2022 - 2025</div>
        <div class="company">Meeta Solutions</div>
      </div>`,
      content: `<div class="timeline-content">
        <strong>Desenvolvedor Backend</strong> (Remoto)
        <details class="experience-details"><summary class="experience-summary">Ver detalhes</summary>
        <ul>
          <li>Desenvolvimento, integração e manutenção de sistemas corporativos com PHP/Laravel, SQL Server e PostgreSQL</li>
          <li>Criação e manutenção de stored procedures, functions, triggers e views para encapsular regras de negócio e garantir integridade dos dados</li>
          <li>Implementação de agendamentos com SQL Server Agent e cron jobs Linux para rotinas automáticas de processamento, relatórios e manutenção de dados</li>
          <li>Otimização de queries lentas com análise de plano de execução, criação de índices e refatoração de procedures críticas</li>
          <li>Migração de servidores de banco de dados de Windows Server para Linux, incluindo reescrita de procedures e ajuste de collation</li>
          <li>Desenvolvimento de sistemas distribuídos com múltiplos repositórios usando Python, Azure Functions (HTTP e Timer Triggers), React e MongoDB</li>
          <li>Criação e manutenção de APIs REST e SOAP com autenticação, versionamento e documentação</li>
          <li>Desenvolvimento de dashboards analíticos no Power BI com modelagem de dados e métricas em DAX</li>
        </ul>
        </details>
      </div>`
    },
    {
      title: `<div class="timeline-title">
        <div class="date">2020 - 2023</div>
        <div class="company">Mattos & Cia Ltda</div>
      </div>`,
      content: `<div class="timeline-content">
        <strong>Desenvolvedor Full Stack Pleno</strong> (Remoto)
        <details class="experience-details"><summary class="experience-summary">Ver detalhes</summary>
        <ul>
          <li>Desenvolvimento, implantação e manutenção de dashboards corporativos no Power BI com KPIs de produção, vendas e estoque</li>
          <li>Criação de pipelines ETL com Pentaho para integração e transformação de grandes volumes de dados entre múltiplos bancos (SQL Server, MySQL)</li>
          <li>Desenvolvimento de stored procedures, views e scripts SQL de automação para suporte aos pipelines de BI e geração de relatórios</li>
          <li>Modernização de sistema legado de fábrica de calçados: migração para aplicação web full stack (PHP, Vue.js, Node.js) com remodelagem completa do banco de dados</li>
          <li>Sistema desktop de autenticação e monitoramento de estações de trabalho com Electron (cross-platform)</li>
        </ul>
        </details>
      </div>`
    },
    {
      title: `<div class="timeline-title">
        <div class="date">2022 - 2023</div>
        <div class="company">Sales Farm</div>
      </div>`,
      content: `<div class="timeline-content">
        <strong>Desenvolvedor Web Full Stack</strong> (Remoto)
        <details class="experience-details"><summary class="experience-summary">Ver detalhes</summary>
        <ul>
          <li>Desenvolvimento de novas funcionalidades, correção de bugs e otimização de performance na plataforma de vendas (PHP/Laravel, MySQL)</li>
          <li>Análise e refatoração de queries e stored procedures para redução de tempo de resposta em relatórios de alta demanda</li>
          <li>Condução de code reviews, definição de padrões de código e boas práticas de desenvolvimento em equipe</li>
          <li>Mentoria e onboarding técnico de novos desenvolvedores, acelerando a curva de aprendizado do time</li>
          <li>Participação ativa em reuniões de planejamento de sprint, definição de stack e levantamento de requisitos</li>
        </ul>
        </details>
      </div>`
    },
    {
      title: `<div class="timeline-title">
        <div class="date">2021 - 2022</div>
        <div class="company">VirtuaMax Comunicação Ltda</div>
      </div>`,
      content: `<div class="timeline-content">
        <strong>Desenvolvedor Web Full Stack Pleno</strong> (Remoto)
        <details class="experience-details"><summary class="experience-summary">Ver detalhes</summary>
        <ul>
          <li>Desenvolvimento de sites e landing pages responsivos (PHP, JavaScript, CSS3, HTML5, jQuery, Vue.js, Node.js, MySQL)</li>
          <li>Desenvolvimento full stack da plataforma Deskkio (sistema de suporte e atendimento ao cliente) com PHP/Laravel, Vue.js e MySQL</li>
          <li>Modelagem de banco de dados relacional, criação de queries otimizadas, relacionamentos complexos e stored procedures</li>
          <li>Integração de chatbot automatizado com Twilio para atendimento via WhatsApp e SMS</li>
          <li>Gestão de backlog, tarefas e sprints com metodologia ágil utilizando Jira</li>
        </ul>
        </details>
      </div>`
    }
  ];
}
