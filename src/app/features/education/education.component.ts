import { Component } from '@angular/core';

@Component({
  selector: 'app-education',
  standalone: true,
  template: `
    <section id="escolaridade" class="py-20 sm:py-28 border-b border-zinc-900">
      <div class="wrap">
        <div class="mb-12 sm:mb-20 max-w-4xl">
          <div class="eyebrow mb-5">03 — Formação</div>
          <h2 class="section-title">Formação<br>acadêmica</h2>
        </div>

        <div>
          <article class="grid grid-cols-1 md:grid-cols-[10rem_1fr] gap-x-12 gap-y-2 py-7 sm:py-8 border-t border-zinc-900">
            <div class="eyebrow pt-1">2020 — 2022</div>
            <div class="max-w-2xl">
              <h3 class="text-zinc-50 text-lg font-medium mb-1">
                Pós-graduação em Qualidade, Teste e Desenvolvimento de Software
              </h3>
              <p class="text-zinc-500 text-sm mb-3">UNIMAIS</p>
              <p class="text-zinc-400 text-[0.9375rem] leading-relaxed">
                Especialização com foco em metodologia ágil e práticas de qualidade de software.
              </p>
            </div>
          </article>

          <article class="grid grid-cols-1 md:grid-cols-[10rem_1fr] gap-x-12 gap-y-2 py-7 sm:py-8 border-t border-b border-zinc-900">
            <div class="eyebrow pt-1">2015 — 2019</div>
            <div class="max-w-2xl">
              <h3 class="text-zinc-50 text-lg font-medium mb-1">
                Bacharelado em Engenharia da Computação
              </h3>
              <p class="text-zinc-500 text-sm mb-4">PUC Goiás</p>
              <ul class="flex flex-col gap-2.5">
                <li class="edu-item">
                  TCC em Segurança da Informação — <span class="text-zinc-300">“Redes IEEE 802.11:
                  protocolos de segurança, vulnerabilidades e proteção”</span>
                </li>
                <li class="edu-item">
                  Certificado de mérito e apresentação oral no V Congresso de Ciência e
                  Tecnologia da PUC Goiás (2019)
                </li>
                <li class="edu-item">Diretor do Centro Acadêmico</li>
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
export class EducationComponent {}
