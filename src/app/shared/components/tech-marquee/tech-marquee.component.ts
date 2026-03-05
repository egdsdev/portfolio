import { Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPhp, faLaravel, faPython, faNodeJs, faJs, faVuejs, faReact, faAngular, faHtml5, faCss3Alt, faGithub, faDocker, faAws, faGitAlt, faJira, faLinux } from '@fortawesome/free-brands-svg-icons';
import { faDatabase, faChartBar, faGears, faCode, faCloud, faFire } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-tech-marquee',
  standalone: true,
  imports: [FontAwesomeModule],
  template: `
    <div class="marquee-wrapper">

      <!-- Linha 1 -->
      <div class="marquee-track">
        <div class="marquee-content">
          <div class="tech-pill indigo"><fa-icon [icon]="phpIcon"></fa-icon><span>PHP</span></div>
          <div class="tech-pill red"><fa-icon [icon]="laravelIcon"></fa-icon><span>Laravel</span></div>
          <div class="tech-pill yellow"><fa-icon [icon]="pythonIcon"></fa-icon><span>Python</span></div>
          <div class="tech-pill green"><fa-icon [icon]="nodeJsIcon"></fa-icon><span>Node.js</span></div>
          <div class="tech-pill amber"><fa-icon [icon]="jsIcon"></fa-icon><span>JavaScript</span></div>
          <div class="tech-pill blue"><fa-icon [icon]="codeIcon"></fa-icon><span>TypeScript</span></div>
          <div class="tech-pill emerald"><fa-icon [icon]="vueIcon"></fa-icon><span>Vue.js</span></div>
          <div class="tech-pill cyan"><fa-icon [icon]="reactIcon"></fa-icon><span>React</span></div>
          <div class="tech-pill rose"><fa-icon [icon]="angularIcon"></fa-icon><span>Angular</span></div>
          <div class="tech-pill orange"><fa-icon [icon]="html5Icon"></fa-icon><span>HTML5</span></div>
          <div class="tech-pill sky"><fa-icon [icon]="css3Icon"></fa-icon><span>CSS3</span></div>
          <div class="tech-pill slate"><fa-icon [icon]="githubIcon"></fa-icon><span>GitHub</span></div>
        </div>
        <!-- duplicado para loop contínuo -->
        <div class="marquee-content" aria-hidden="true">
          <div class="tech-pill indigo"><fa-icon [icon]="phpIcon"></fa-icon><span>PHP</span></div>
          <div class="tech-pill red"><fa-icon [icon]="laravelIcon"></fa-icon><span>Laravel</span></div>
          <div class="tech-pill yellow"><fa-icon [icon]="pythonIcon"></fa-icon><span>Python</span></div>
          <div class="tech-pill green"><fa-icon [icon]="nodeJsIcon"></fa-icon><span>Node.js</span></div>
          <div class="tech-pill amber"><fa-icon [icon]="jsIcon"></fa-icon><span>JavaScript</span></div>
          <div class="tech-pill blue"><fa-icon [icon]="codeIcon"></fa-icon><span>TypeScript</span></div>
          <div class="tech-pill emerald"><fa-icon [icon]="vueIcon"></fa-icon><span>Vue.js</span></div>
          <div class="tech-pill cyan"><fa-icon [icon]="reactIcon"></fa-icon><span>React</span></div>
          <div class="tech-pill rose"><fa-icon [icon]="angularIcon"></fa-icon><span>Angular</span></div>
          <div class="tech-pill orange"><fa-icon [icon]="html5Icon"></fa-icon><span>HTML5</span></div>
          <div class="tech-pill sky"><fa-icon [icon]="css3Icon"></fa-icon><span>CSS3</span></div>
          <div class="tech-pill slate"><fa-icon [icon]="githubIcon"></fa-icon><span>GitHub</span></div>
        </div>
      </div>

      <!-- Linha 2 (reversa) -->
      <div class="marquee-track reverse">
        <div class="marquee-content">
          <div class="tech-pill green"><fa-icon [icon]="databaseIcon"></fa-icon><span>MongoDB</span></div>
          <div class="tech-pill blue"><fa-icon [icon]="databaseIcon"></fa-icon><span>PostgreSQL</span></div>
          <div class="tech-pill red"><fa-icon [icon]="databaseIcon"></fa-icon><span>SQL Server</span></div>
          <div class="tech-pill yellow"><fa-icon [icon]="awsIcon"></fa-icon><span>AWS</span></div>
          <div class="tech-pill sky"><fa-icon [icon]="cloudIcon"></fa-icon><span>Azure</span></div>
          <div class="tech-pill sky"><fa-icon [icon]="dockerIcon"></fa-icon><span>Docker</span></div>
          <div class="tech-pill orange"><fa-icon [icon]="gitIcon"></fa-icon><span>Git</span></div>
          <div class="tech-pill amber"><fa-icon [icon]="chartIcon"></fa-icon><span>Power BI</span></div>
          <div class="tech-pill blue"><fa-icon [icon]="jiraIcon"></fa-icon><span>Jira</span></div>
          <div class="tech-pill orange"><fa-icon [icon]="gearsIcon"></fa-icon><span>Pentaho</span></div>
          <div class="tech-pill slate"><fa-icon [icon]="linuxIcon"></fa-icon><span>Linux</span></div>
          <div class="tech-pill amber"><fa-icon [icon]="fireIcon"></fa-icon><span>Firebase</span></div>
        </div>
        <div class="marquee-content" aria-hidden="true">
          <div class="tech-pill green"><fa-icon [icon]="databaseIcon"></fa-icon><span>MongoDB</span></div>
          <div class="tech-pill blue"><fa-icon [icon]="databaseIcon"></fa-icon><span>PostgreSQL</span></div>
          <div class="tech-pill red"><fa-icon [icon]="databaseIcon"></fa-icon><span>SQL Server</span></div>
          <div class="tech-pill yellow"><fa-icon [icon]="awsIcon"></fa-icon><span>AWS</span></div>
          <div class="tech-pill sky"><fa-icon [icon]="cloudIcon"></fa-icon><span>Azure</span></div>
          <div class="tech-pill sky"><fa-icon [icon]="dockerIcon"></fa-icon><span>Docker</span></div>
          <div class="tech-pill orange"><fa-icon [icon]="gitIcon"></fa-icon><span>Git</span></div>
          <div class="tech-pill amber"><fa-icon [icon]="chartIcon"></fa-icon><span>Power BI</span></div>
          <div class="tech-pill blue"><fa-icon [icon]="jiraIcon"></fa-icon><span>Jira</span></div>
          <div class="tech-pill orange"><fa-icon [icon]="gearsIcon"></fa-icon><span>Pentaho</span></div>
          <div class="tech-pill slate"><fa-icon [icon]="linuxIcon"></fa-icon><span>Linux</span></div>
          <div class="tech-pill amber"><fa-icon [icon]="fireIcon"></fa-icon><span>Firebase</span></div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .marquee-wrapper {
      width: 100vw;
      margin-left: calc(-50vw + 50%);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      padding: 0.5rem 0;
    }

    .marquee-track {
      display: flex;
      width: max-content;
      animation: scroll-right 35s linear infinite;
    }
    .marquee-track.reverse {
      animation: scroll-left 35s linear infinite;
    }
    .marquee-track:hover {
      animation-play-state: paused;
    }

    .marquee-content {
      display: flex;
      align-items: center;
      flex-shrink: 0;
    }

    @keyframes scroll-right {
      0%   { transform: translateX(-50%); }
      100% { transform: translateX(0); }
    }
    @keyframes scroll-left {
      0%   { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }

    .tech-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.35rem 0.85rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
      white-space: nowrap;
      margin: 0 0.35rem;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.07);
      transition: transform 0.2s, background 0.2s;
      cursor: default;
    }
    .tech-pill:hover {
      transform: translateY(-2px) scale(1.06);
      background: rgba(255,255,255,0.08);
    }
    .tech-pill span { color: #94a3b8; font-family: monospace; }

    .indigo { color: #818cf8; }
    .red     { color: #f87171; }
    .yellow  { color: #fde68a; }
    .green   { color: #4ade80; }
    .amber   { color: #fbbf24; }
    .blue    { color: #60a5fa; }
    .emerald { color: #34d399; }
    .cyan    { color: #22d3ee; }
    .rose    { color: #fb7185; }
    .orange  { color: #fb923c; }
    .sky     { color: #38bdf8; }
    .slate   { color: #94a3b8; }
  `]
})
export class TechMarqueeComponent {
  phpIcon = faPhp;
  laravelIcon = faLaravel;
  pythonIcon = faPython;
  nodeJsIcon = faNodeJs;
  jsIcon = faJs;
  codeIcon = faCode;
  vueIcon = faVuejs;
  reactIcon = faReact;
  angularIcon = faAngular;
  html5Icon = faHtml5;
  css3Icon = faCss3Alt;
  githubIcon = faGithub;
  databaseIcon = faDatabase;
  chartIcon = faChartBar;
  gearsIcon = faGears;
  cloudIcon = faCloud;
  dockerIcon = faDocker;
  gitIcon = faGitAlt;
  jiraIcon = faJira;
  awsIcon = faAws;
  linuxIcon = faLinux;
  fireIcon = faFire;
}


