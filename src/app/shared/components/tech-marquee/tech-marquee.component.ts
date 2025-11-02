import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgxMarqueeComponent } from '@omnedia/ngx-marquee';
import { faPhp, faLaravel, faPython, faNodeJs, faJs, faVuejs, faReact, faAngular, faHtml5, faCss3Alt, faGithub, faDocker, faAws, faGitAlt, faJira } from '@fortawesome/free-brands-svg-icons';
import { faDatabase, faChartBar, faServer, faGears, faCode, faCloud } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-tech-marquee',
  standalone: true,
  imports: [FontAwesomeModule, NgxMarqueeComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="w-screen -mx-8 overflow-hidden">
      <om-marquee>
        <ng-template>
          <div class="flex items-center gap-8 px-6">
            <fa-icon [icon]="phpIcon" class="text-3xl text-indigo-400 hover:scale-125 transition-transform cursor-pointer" title="PHP"></fa-icon>
            <fa-icon [icon]="laravelIcon" class="text-3xl text-red-500 hover:scale-125 transition-transform cursor-pointer" title="Laravel"></fa-icon>
            <fa-icon [icon]="pythonIcon" class="text-3xl text-yellow-400 hover:scale-125 transition-transform cursor-pointer" title="Python"></fa-icon>
            <fa-icon [icon]="nodeJsIcon" class="text-3xl text-green-500 hover:scale-125 transition-transform cursor-pointer" title="Node.js"></fa-icon>
            <fa-icon [icon]="jsIcon" class="text-3xl text-yellow-300 hover:scale-125 transition-transform cursor-pointer" title="JavaScript"></fa-icon>
            <fa-icon [icon]="codeIcon" class="text-3xl text-blue-500 hover:scale-125 transition-transform cursor-pointer" title="TypeScript"></fa-icon>
            <fa-icon [icon]="vueIcon" class="text-3xl text-green-400 hover:scale-125 transition-transform cursor-pointer" title="Vue.js"></fa-icon>
            <fa-icon [icon]="reactIcon" class="text-3xl text-cyan-400 hover:scale-125 transition-transform cursor-pointer" title="React"></fa-icon>
            <fa-icon [icon]="angularIcon" class="text-3xl text-red-600 hover:scale-125 transition-transform cursor-pointer" title="Angular"></fa-icon>
            <fa-icon [icon]="html5Icon" class="text-3xl text-orange-500 hover:scale-125 transition-transform cursor-pointer" title="HTML5"></fa-icon>
            <fa-icon [icon]="css3Icon" class="text-3xl text-blue-500 hover:scale-125 transition-transform cursor-pointer" title="CSS3"></fa-icon>
          </div>
        </ng-template>
      </om-marquee>

      <om-marquee [reverse]="true">
        <ng-template>
          <div class="flex items-center gap-8 px-6">
            <fa-icon [icon]="databaseIcon" class="text-3xl text-green-500 hover:scale-125 transition-transform cursor-pointer" title="MongoDB"></fa-icon>
            <fa-icon [icon]="databaseIcon" class="text-3xl text-blue-400 hover:scale-125 transition-transform cursor-pointer" title="PostgreSQL"></fa-icon>
            <fa-icon [icon]="databaseIcon" class="text-3xl text-red-400 hover:scale-125 transition-transform cursor-pointer" title="SQL Server"></fa-icon>
            <fa-icon [icon]="awsIcon" class="text-3xl text-yellow-500 hover:scale-125 transition-transform cursor-pointer" title="AWS"></fa-icon>
            <fa-icon [icon]="cloudIcon" class="text-3xl text-blue-500 hover:scale-125 transition-transform cursor-pointer" title="Azure"></fa-icon>
            <fa-icon [icon]="dockerIcon" class="text-3xl text-blue-400 hover:scale-125 transition-transform cursor-pointer" title="Docker"></fa-icon>
            <fa-icon [icon]="gitIcon" class="text-3xl text-orange-600 hover:scale-125 transition-transform cursor-pointer" title="Git"></fa-icon>
            <fa-icon [icon]="chartIcon" class="text-3xl text-yellow-500 hover:scale-125 transition-transform cursor-pointer" title="Power BI"></fa-icon>
            <fa-icon [icon]="jiraIcon" class="text-3xl text-blue-500 hover:scale-125 transition-transform cursor-pointer" title="Jira"></fa-icon>
            <fa-icon [icon]="gearsIcon" class="text-3xl text-orange-500 hover:scale-125 transition-transform cursor-pointer" title="Pentaho"></fa-icon>
          </div>
        </ng-template>
      </om-marquee>
    </div>
  `
})
export class TechMarqueeComponent {
  // Backend icons
  phpIcon = faPhp;
  pythonIcon = faPython;
  laravelIcon = faLaravel;
  nodeJsIcon = faNodeJs;
  
  // Frontend icons
  jsIcon = faJs;
  codeIcon = faCode;
  vueIcon = faVuejs;
  reactIcon = faReact;
  angularIcon = faAngular;
  html5Icon = faHtml5;
  css3Icon = faCss3Alt;
  
  // Database and tools icons
  databaseIcon = faDatabase;
  chartIcon = faChartBar;
  gearsIcon = faGears;
  cloudIcon = faCloud;
  dockerIcon = faDocker;
  gitIcon = faGitAlt;
  jiraIcon = faJira;
  awsIcon = faAws;
}