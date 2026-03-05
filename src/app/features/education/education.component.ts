import { Component } from '@angular/core';

@Component({
  selector: 'app-education',
  standalone: true,
  template: `
    <section id="escolaridade" class="py-24 px-8">
      <div class="max-w-4xl mx-auto">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold bg-linear-to-r from-blue-400 to-cyan-400 text-transparent bg-clip-text inline-block">
            Formação Acadêmica
          </h2>
          <div class="mt-3 mx-auto w-16 h-px bg-linear-to-r from-blue-400 to-cyan-400 rounded-full"></div>
        </div>
        <div class="space-y-6">
          <div class="group bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 hover:border-cyan-500/30
                      shadow-lg transition-all duration-300 hover:-translate-y-0.5 relative overflow-hidden">
            <div class="absolute left-0 top-0 bottom-0 w-1 bg-linear-to-b from-blue-400 to-cyan-400 rounded-l-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div class="flex items-start space-x-5">
              <div class="w-11 h-11 rounded-xl bg-cyan-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span class="text-xl">🎓</span>
              </div>
              <div>
                <p class="text-cyan-400 text-xs font-mono tracking-wide mb-1 uppercase">2020 – 2022 · UNIMAIS</p>
                <h3 class="text-xl font-semibold text-white mb-2">Pós-Graduação</h3>
                <p class="text-gray-300 text-sm leading-relaxed">Qualidade, Teste e Desenvolvimento de Software com Metodologia Ágil</p>
              </div>
            </div>
          </div>

          <div class="group bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 hover:border-cyan-500/30
                      shadow-lg transition-all duration-300 hover:-translate-y-0.5 relative overflow-hidden">
            <div class="absolute left-0 top-0 bottom-0 w-1 bg-linear-to-b from-blue-400 to-cyan-400 rounded-l-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div class="flex items-start space-x-5">
              <div class="w-11 h-11 rounded-xl bg-cyan-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span class="text-xl">🎓</span>
              </div>
              <div>
                <p class="text-cyan-400 text-xs font-mono tracking-wide mb-1 uppercase">2015 – 2019 · PUC Goiás</p>
                <h3 class="text-xl font-semibold text-white mb-3">Graduação em Engenharia da Computação</h3>
                <ul class="space-y-2 text-gray-300 text-sm">
                  <li class="flex items-start"><span class="text-cyan-400 mr-2 mt-0.5 text-xs">▹</span>Diretor do Centro Acadêmico</li>
                  <li class="flex items-start"><span class="text-cyan-400 mr-2 mt-0.5 text-xs">▹</span>TCC na Área de Segurança da Informação (Redes IEEE 802.11)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `
})
export class EducationComponent {}
