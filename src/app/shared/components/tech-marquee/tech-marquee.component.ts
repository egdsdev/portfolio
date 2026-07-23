import { Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faPhp, faLaravel, faPython, faNodeJs, faJs, faVuejs, faReact, faAngular, faHtml5, faCss3Alt, faGithub, faDocker, faAws, faGitAlt, faJira, faLinux } from '@fortawesome/free-brands-svg-icons';
import { faDatabase, faChartBar, faGears, faCode, faCloud, faFire } from '@fortawesome/free-solid-svg-icons';

interface Tech {
  icon: IconDefinition;
  label: string;
  color: string;
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
              <div class="tech-pill" [class]="t.color"><fa-icon [icon]="t.icon"></fa-icon><span>{{ t.label }}</span></div>
            }
          </div>
        }
      </div>

      <!-- Linha 2 (reversa) -->
      <div class="marquee-track reverse">
        @for (copy of [0, 1, 2]; track copy) {
          <div class="marquee-content" [attr.aria-hidden]="copy > 0 ? true : null">
            @for (t of row2; track $index) {
              <div class="tech-pill" [class]="t.color"><fa-icon [icon]="t.icon"></fa-icon><span>{{ t.label }}</span></div>
            }
          </div>
        }
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

    .tech-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      padding: 0.4rem 0.95rem;
      border-radius: 9999px;
      font-size: 0.78rem;
      font-weight: 500;
      white-space: nowrap;
      margin: 0 0.4rem;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.09);
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.04), 0 1px 2px rgba(0,0,0,0.2);
      transition: transform 0.25s ease, background 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
      cursor: default;
    }
    .tech-pill:hover {
      transform: translateY(-3px) scale(1.06);
      background: rgba(255,255,255,0.09);
      border-color: rgba(255,255,255,0.16);
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.06), 0 6px 16px rgba(0,0,0,0.3);
    }
    .tech-pill span { color: #cbd5e1; font-family: monospace; letter-spacing: 0.01em; }

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
  row1: Tech[] = [
    { icon: faPhp, label: 'PHP', color: 'indigo' },
    { icon: faLaravel, label: 'Laravel', color: 'red' },
    { icon: faPython, label: 'Python', color: 'yellow' },
    { icon: faNodeJs, label: 'Node.js', color: 'green' },
    { icon: faJs, label: 'JavaScript', color: 'amber' },
    { icon: faCode, label: 'TypeScript', color: 'blue' },
    { icon: faVuejs, label: 'Vue.js', color: 'emerald' },
    { icon: faReact, label: 'React', color: 'cyan' },
    { icon: faAngular, label: 'Angular', color: 'rose' },
    { icon: faHtml5, label: 'HTML5', color: 'orange' },
    { icon: faCss3Alt, label: 'CSS3', color: 'sky' },
    { icon: faGithub, label: 'GitHub', color: 'slate' },
  ];

  row2: Tech[] = [
    { icon: faDatabase, label: 'MongoDB', color: 'green' },
    { icon: faDatabase, label: 'PostgreSQL', color: 'blue' },
    { icon: faDatabase, label: 'SQL Server', color: 'red' },
    { icon: faAws, label: 'AWS', color: 'yellow' },
    { icon: faCloud, label: 'Azure', color: 'sky' },
    { icon: faDocker, label: 'Docker', color: 'sky' },
    { icon: faGitAlt, label: 'Git', color: 'orange' },
    { icon: faChartBar, label: 'Power BI', color: 'amber' },
    { icon: faJira, label: 'Jira', color: 'blue' },
    { icon: faGears, label: 'Pentaho', color: 'orange' },
    { icon: faLinux, label: 'Linux', color: 'slate' },
    { icon: faFire, label: 'Firebase', color: 'amber' },
  ];
}
