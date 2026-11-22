import { Component, computed, inject } from '@angular/core';
import { LanguageService } from '../../core/i18n/language.service';

const COPY = {
  pt: {
    eyebrow: '04 — Formação', title1: 'Formação', title2: 'acadêmica',
    postTitle: 'Pós-graduação em Qualidade, Teste e Desenvolvimento de Software',
    postDesc: 'Especialização com foco em metodologia ágil e práticas de qualidade de software.',
    bscTitle: 'Bacharelado em Engenharia da Computação',
    thesisLabel: 'TCC em Segurança da Informação',
    thesisTitle: '“Redes IEEE 802.11: protocolos de segurança, vulnerabilidades e proteção”',
    merit: 'Certificado de mérito e apresentação oral no V Congresso de Ciência e Tecnologia da PUC Goiás (2019)',
    director: 'Diretor do Centro Acadêmico',
  },
  en: {
    eyebrow: '04 — Education', title1: 'Academic', title2: 'background',
    postTitle: 'Postgraduate degree in Software Quality, Testing and Development',
    postDesc: 'Specialization focused on agile methodology and software quality practices.',
    bscTitle: 'Bachelor’s degree in Computer Engineering',
    thesisLabel: 'Final thesis in Information Security',
    thesisTitle: '“IEEE 802.11 networks: security protocols, vulnerabilities and protection”',
    merit: 'Certificate of merit and oral presentation at the 5th Science and Technology Congress of PUC Goiás (2019)',
    director: 'Director of the student association',
  },
};

@Component({
  selector: 'app-education',
  standalone: true,
  template: `
    <section id="escolaridade" class="py-16 sm:py-28 border-b border-zinc-900">
      <div class="wrap">
        <div class="mb-10 sm:mb-20 max-w-4xl">
          <div class="eyebrow mb-5">{{ t().eyebrow }}</div>
          <h2 class="section-title">{{ t().title1 }}<br>{{ t().title2 }}</h2>
        </div>

        <div>
          <article class="grid grid-cols-1 md:grid-cols-[10rem_1fr] gap-x-12 gap-y-2 py-7 sm:py-8 border-t border-zinc-900">
            <div class="eyebrow pt-1">2020 — 2022</div>
            <div class="max-w-2xl">
              <h3 class="text-zinc-50 text-lg font-medium mb-1">{{ t().postTitle }}</h3>
              <p class="text-zinc-500 text-sm mb-3">UNIMAIS</p>
              <p class="text-zinc-400 text-[0.9375rem] leading-relaxed">{{ t().postDesc }}</p>
            </div>
          </article>

          <article class="grid grid-cols-1 md:grid-cols-[10rem_1fr] gap-x-12 gap-y-2 py-7 sm:py-8 border-t border-b border-zinc-900">
            <div class="eyebrow pt-1">2015 — 2019</div>
            <div class="max-w-2xl">
              <h3 class="text-zinc-50 text-lg font-medium mb-1">{{ t().bscTitle }}</h3>
              <p class="text-zinc-500 text-sm mb-4">PUC Goiás</p>
              <ul class="flex flex-col gap-2.5">
                <li class="edu-item">{{ t().thesisLabel }} — <span class="text-zinc-300">{{ t().thesisTitle }}</span></li>
                <li class="edu-item">{{ t().merit }}</li>
                <li class="edu-item">{{ t().director }}</li>
              </ul>
            </div>
          </article>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .edu-item {
      position: relative;
      padding-left: 1.25rem;
      color: var(--fg-muted);
      font-size: 0.9375rem;
      line-height: 1.65;
    }
    .edu-item::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0.65em;
      width: 5px;
      height: 1px;
      background: var(--fg-faint);
    }
  `]
})
export class EducationComponent {
  private readonly i18n = inject(LanguageService);
  readonly t = computed(() => COPY[this.i18n.lang()]);}
