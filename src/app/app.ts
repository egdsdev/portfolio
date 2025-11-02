import { Component, ElementRef, AfterViewInit, ViewChild } from '@angular/core';
import { NgxFuzzyTextComponent } from '@omnedia/ngx-fuzzy-text';
import { NgxStarrySkyComponent } from '@omnedia/ngx-starry-sky';
import { NgxTimelineComponent, TimelineEntry } from '@omnedia/ngx-timeline';
import { NgxMarqueeComponent } from '@omnedia/ngx-marquee';
import { NgxGlitchTextComponent } from '@omnedia/ngx-glitch-text';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { 
  faWhatsapp, 
  faPhp, 
  faPython, 
  faJs, 
  faVuejs, 
  faReact, 
  faNode,
  faLaravel,
  faNodeJs,
  faAws,
  faDocker,
  faGitAlt,
  faJira,
  faAngular,
  faHtml5,
  faCss3Alt,
  faSass,
  faBootstrap,
  faWindows,
  faLinux
} from '@fortawesome/free-brands-svg-icons';
import { 
  faDatabase, 
  faChartBar, 
  faServer, 
  faGears,
  faCode,
  faMobile,
  faDesktop,
  faCloud
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgxStarrySkyComponent, NgxFuzzyTextComponent, NgxTimelineComponent, FontAwesomeModule, NgxMarqueeComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements AfterViewInit {
  @ViewChild('cursorFollower') cursorFollower!: ElementRef;
  whatsappIcon = faWhatsapp;
  
  // Ícones de tecnologias
  // Backend
  phpIcon = faPhp;
  pythonIcon = faPython;
  laravelIcon = faLaravel;
  nodeJsIcon = faNodeJs;
  
  // Frontend
  jsIcon = faJs;
  vueIcon = faVuejs;
  reactIcon = faReact;
  angularIcon = faAngular;
  html5Icon = faHtml5;
  css3Icon = faCss3Alt;
  sassIcon = faSass;
  bootstrapIcon = faBootstrap;
  typescriptIcon = faCode; // Usando ícone genérico para TypeScript
  
  // Banco de Dados
  databaseIcon = faDatabase;
  postgresIcon = faDatabase;
  mongoIcon = faDatabase;
  sqlServerIcon = faDatabase;
  
  // DevOps e Cloud
  awsIcon = faAws;
  azureIcon = faCloud;
  dockerIcon = faDocker;
  gitIcon = faGitAlt;
  
  // Sistemas Operacionais
  windowsIcon = faWindows;
  linuxIcon = faLinux;
  
  // Ferramentas e Outros
  powerbiIcon = faChartBar;
  jiraIcon = faJira;
  pentahoIcon = faGears;
  electronIcon = faDesktop;
  cicdIcon = faServer;

  timelineData: TimelineEntry[] = [
    {
      title: '<div class="timeline-title">Desenvolvedor Backend @ EQ Seguros<br><span class="text-sm text-gray-400">Set 2025 - Out 2025</span></div>',
      content: `
        <div class="timeline-content">
          <ul>
            <li>Desenvolvimento de dashboards em PowerBI</li>
          </ul>
        </div>
      `
    },
    {
      title: '<div class="timeline-title">Desenvolvedor Backend @ Meeta Solutions<br><span class="text-sm text-gray-400">Nov 2022 - Out 2025</span></div>',
      content: `
        <div class="timeline-content">
          <ul>
            <li>Desenvolvimento, integração e manutenção de sistemas com PHP/Laravel, SQL, SQLSERVER</li>
            <li>Migração de servidores de BD de Windows para Linux</li>
            <li>Dashboards em Power BI</li>
            <li>Sistemas complexos com Python, Azure Functions, React e MongoDB</li>
            <li>APIs REST e SOAP</li>
          </ul>
        </div>
      `
    },
    {
      title: '<div class="timeline-title">Desenvolvedor Full Stack Pleno @ Mattos & Cia Ltda<br><span class="text-sm text-gray-400">Mai 2020 - Jul 2023</span></div>',
      content: `
        <div class="timeline-content">
          <ul>
            <li>Dashboards em PowerBI, ETLs em Pentaho</li>
            <li>Conversão de sistema legado para web</li>
          </ul>
        </div>
      `
    },
    {
      title: '<div class="timeline-title">Desenvolvedor Web Full Stack @ Sales Farm<br><span class="text-sm text-gray-400">Out 2022 - Abr 2023</span></div>',
      content: `
        <div class="timeline-content">
          <ul>
            <li>Desenvolvimento e otimização de plataforma de vendas</li>
          </ul>
        </div>
      `
    },
    {
      title: '<div class="timeline-title">Desenvolvedor Web FullStack @ VirtuaMax<br><span class="text-sm text-gray-400">Ago 2021 - Mai 2022</span></div>',
      content: `
        <div class="timeline-content">
          <ul>
            <li>Desenvolvimento full-stack e chatbot com Twilio</li>
          </ul>
        </div>
      `
    }
  ];

  private mouseX = -100;
  private mouseY = -100;
  private cursorX = -100;
  private cursorY = -100;
  private animationFrame: number | null = null;

  ngAfterViewInit() {
    this.initCursorFollower();
  }

  private initCursorFollower() {
    document.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    });

    this.updatePosition();
  }

  private updatePosition = () => {
    const dx = this.mouseX - this.cursorX;
    const dy = this.mouseY - this.cursorY;
    
    this.cursorX += dx * 0.10;
    this.cursorY += dy * 0.10;
    
    if (this.cursorFollower?.nativeElement) {
      this.cursorFollower.nativeElement.style.transform = 
        `translate3d(${this.cursorX}px, ${this.cursorY}px, 0)`;
    }
    
    this.animationFrame = requestAnimationFrame(this.updatePosition);
  }

}
