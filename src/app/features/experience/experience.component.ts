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
        <div class="date">Set 2025 - Out 2025</div>
        <div class="company">EQ Seguros</div>
      </div>`,
      content: `<div class="timeline-content">
        <strong>Desenvolvedor Backend</strong> (Goiânia, GO)
        <ul>
          <li>Desenvolvimento de dashboards em PowerBI</li>
        </ul>
      </div>`
    },
    {
      title: `<div class="timeline-title">
        <div class="date">Nov 2022 - Out 2025</div>
        <div class="company">Meeta Solutions</div>
      </div>`,
      content: `<div class="timeline-content">
        <strong>Desenvolvedor Backend</strong> (Remoto)
        <ul>
          <li>Desenvolvimento, integração e manutenção de sistemas com PHP/Laravel, SQL, SQLSERVER</li>
          <li>Migração de servidores de BD de Windows para Linux</li>
          <li>Desenvolvimento de Dashboards usando Power BI</li>
          <li>Desenvolvimento de sistemas complexos com múltiplos repositórios utilizando Python, Azure Functions, React e MongoDB</li>
          <li>Criação e manutenção de API's REST e SOAP</li>
        </ul>
      </div>`
    },
    {
      title: `<div class="timeline-title">
        <div class="date">Mai 2020 - Jul 2023</div>
        <div class="company">Mattos & Cia Ltda</div>
      </div>`,
      content: `<div class="timeline-content">
        <strong>Desenvolvedor Full Stack Pleno</strong> (Remoto)
        <ul>
          <li>Desenvolvimento, implantação, manutenção e reparos de dashboards em PowerBI</li>
          <li>Desenvolvimento de ETLs para bancos com grande volume de dados em Pentaho</li>
          <li>Conversão de sistema legado de fábrica de sapatos em sistema web utilizando PHP, VueJs e NodeJs</li>
          <li>Criação de sistema de login e monitoramento com Electron</li>
        </ul>
      </div>`
    },
    {
      title: `<div class="timeline-title">
        <div class="date">Out 2022 - Abr 2023</div>
        <div class="company">Sales Farm</div>
      </div>`,
      content: `<div class="timeline-content">
        <strong>Desenvolvedor Web Full Stack</strong> (Remoto)
        <ul>
          <li>Desenvolvimento de novas funcionalidades, correção de bugs e otimização da plataforma de vendas com PHP/Laravel</li>
          <li>Treinamento e orientação dos novos Dev's</li>
          <li>Participação em reuniões para definir stacks e requisitos</li>
        </ul>
      </div>`
    },
    {
      title: `<div class="timeline-title">
        <div class="date">Ago 2021 - Mai 2022</div>
        <div class="company">VirtuaMax Comunicação Ltda</div>
      </div>`,
      content: `<div class="timeline-content">
        <strong>Desenvolvedor Web FullStack Pleno</strong> (Remoto)
        <ul>
          <li>Desenvolvimento de sites responsivos com PHP, JS, CSS, HTML, JQuery, VueJs, NodeJs, MySQL</li>
          <li>Desenvolvimento da plataforma Deskkio com PHP (Laravel), Vue (JS) e MySQL</li>
          <li>Desenvolvimento de Chatbot utilizando Twilio</li>
          <li>Gerenciamento e organização de features via Jira</li>
        </ul>
      </div>`
    }
  ];
}