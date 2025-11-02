import { Component, ElementRef, AfterViewInit, ViewChild } from '@angular/core';
import { NgxStarrySkyComponent } from '@omnedia/ngx-starry-sky';
import { HeaderComponent } from './features/header/header.component';
import { PersonalDetailsComponent } from './features/personal-details/personal-details.component';
import { EducationComponent } from './features/education/education.component';
import { ExperienceComponent } from './features/experience/experience.component';
import { SkillsComponent } from './features/skills/skills.component';
import { CertificationsComponent } from './features/certifications/certifications.component';
import { ContactComponent } from './features/contact/contact.component';
import { FooterComponent } from './shared/components/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    NgxStarrySkyComponent,
    HeaderComponent,
    PersonalDetailsComponent,
    EducationComponent,
    ExperienceComponent,
    SkillsComponent,
    CertificationsComponent,
    ContactComponent,
    FooterComponent
  ],
  template: `
    <om-starry-sky
      [shootingStarsConfig]="{ minDelay: 2000, maxDelay: 8000 }"
      [starsBackgroundConfig]="{ starDensity: 0.001 }"
      class="min-h-screen">
      <div class="min-h-screen bg-transparent text-gray-100 relative">
        <!-- Cursor follower -->
        <div #cursorFollower class="pointer-events-none fixed w-2 h-2 bg-white/80 rounded-full z-50"></div>

        <app-header></app-header>
        <app-personal-details></app-personal-details>
        <app-education></app-education>
        <app-experience></app-experience>
        <app-skills></app-skills>
        <app-certifications></app-certifications>
        <app-contact></app-contact>
        <app-footer></app-footer>
      </div>
    </om-starry-sky>
  `,
  styleUrl: './app.css'
})
export class App implements AfterViewInit {
  @ViewChild('cursorFollower') cursorFollower!: ElementRef;

  ngAfterViewInit() {
    if (this.cursorFollower) {
      document.addEventListener('mousemove', (e) => {
        this.cursorFollower.nativeElement.style.transform = 
          `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      });
    }
  }

}
