import { Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faPhp, faLaravel, faPython, faNodeJs, faJs, faVuejs, faReact, faAngular, faHtml5, faCss3Alt, faGithub, faDocker, faAws, faGitAlt, faJira, faLinux } from '@fortawesome/free-brands-svg-icons';
import { faDatabase, faChartBar, faGears, faCode, faCloud, faFire } from '@fortawesome/free-solid-svg-icons';

interface Tech {
  icon: IconDefinition;
  label: string;
}

@Component({
  selector: 'app-tech-marquee',
  standalone: true,
  imports: [FontAwesomeModule],
  template: `
    <div class="marquee-wrapper">
      <!-- Linha 1 -->
      <div class="marquee-track">
        @for (copy of [0, 1, 2]; track copy) {
          <div class="marquee-content" [attr.aria-hidden]="copy > 0 ? true : null">
            @for (t of row1; track $index) {
              <div class="tech-pill"><fa-icon [icon]="t.icon"></fa-icon><span>{{ t.label }}</span></div>
            }
          </div>
        }
      </div>

      <!-- Linha 2 (reversa) -->
      <div class="marquee-track reverse">
        @for (copy of [0, 1, 2]; track copy) {
          <div class="marquee-content" [attr.aria-hidden]="copy > 0 ? true : null">
            @for (t of row2; track $index) {
              <div class="tech-pill"><fa-icon [icon]="t.icon"></fa-icon><span>{{ t.label }}</span></div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; }

    .marquee-wrapper {
      width: 100%;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
      padding: 0.5rem 0;
      -webkit-mask-image: linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%);
      mask-image: linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%);
    }

    .marquee-track {
      display: flex;
      width: max-content;
      animation: scroll-left 45s linear infinite;
    }
    .marquee-track.reverse {
      animation: scroll-right 45s linear infinite;
    }
    .marquee-track:hover {
      animation-play-state: paused;
    }

    .marquee-content {
      display: flex;
      align-items: center;
      flex-shrink: 0;
    }

    /* 3 cópias contíguas → deslocar 1/3 mantém a viewport sempre preenchida,
       inclusive em telas largas (sem vão inicial no meio da página). */
    @keyframes scroll-left {
      0%   { transform: translateX(0); }
      100% { transform: translateX(-33.3333%); }
    }
    @keyframes scroll-right {
      0%   { transform: translateX(-33.3333%); }
      100% { transform: translateX(0); }
    }

    /* Monocromático: as tecnologias viram uma faixa de textura, não um arco-íris.
       A cor fica reservada para o accent do site. */
    .tech-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.35rem 0.9rem;
      font-size: 0.8125rem;
      white-space: nowrap;
      margin: 0 0.35rem;
      color: var(--fg-faint);
      transition: color 0.25s ease;
      cursor: default;
    }
    .tech-pill:hover { color: var(--fg); }
    .tech-pill span { font-family: var(--font-mono); letter-spacing: 0.01em; }
  `]
})
export class TechMarqueeComponent {
  row1: Tech[] = [
    { icon: faPhp, label: 'PHP' },
    { icon: faLaravel, label: 'Laravel' },
    { icon: faPython, label: 'Python' },
    { icon: faNodeJs, label: 'Node.js' },
    { icon: faJs, label: 'JavaScript' },
    { icon: faCode, label: 'TypeScript' },
    { icon: faVuejs, label: 'Vue.js' },
    { icon: faReact, label: 'React' },
    { icon: faAngular, label: 'Angular' },
    { icon: faHtml5, label: 'HTML5' },
    { icon: faCss3Alt, label: 'CSS3' },
    { icon: faGithub, label: 'GitHub' },
  ];

  row2: Tech[] = [
    { icon: faDatabase, label: 'MongoDB' },
    { icon: faDatabase, label: 'PostgreSQL' },
    { icon: faDatabase, label: 'SQL Server' },
    { icon: faAws, label: 'AWS' },
    { icon: faCloud, label: 'Azure' },
    { icon: faDocker, label: 'Docker' },
    { icon: faGitAlt, label: 'Git' },
    { icon: faChartBar, label: 'Power BI' },
    { icon: faJira, label: 'Jira' },
    { icon: faGears, label: 'Pentaho' },
    { icon: faLinux, label: 'Linux' },
    { icon: faFire, label: 'Firebase' },
  ];
}
