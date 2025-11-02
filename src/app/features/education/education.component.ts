import { Component } from '@angular/core';

@Component({
  selector: 'app-education',
  standalone: true,
  template: `
    <section id="escolaridade" class="py-20 px-8">
      <div class="max-w-4xl mx-auto">
        <h2 class="text-4xl font-bold text-center mb-16 bg-linear-to-r from-blue-400 to-cyan-400 text-transparent bg-clip-text">
          Formação Acadêmica
        </h2>
        <div class="space-y-8">
          <div class="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 hover:bg-gray-800/60 transition-all duration-300
                      border border-gray-700/50 hover:border-cyan-500/30 shadow-lg">
            <div class="flex items-start space-x-4">
              <span class="text-cyan-400 text-xl">🎓</span>
              <div>
                <h3 class="text-xl font-semibold text-white mb-2">Pós-Graduação</h3>
                <p class="text-gray-300">Qualidade, Teste e Desenvolvimento de Software com Metodologia Ágil</p>
                <p class="text-gray-400 mt-2">UNIMAIS (2020-2022)</p>
              </div>
            </div>
          </div>

          <div class="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 hover:bg-gray-800/60 transition-all duration-300
                      border border-gray-700/50 hover:border-cyan-500/30 shadow-lg">
            <div class="flex items-start space-x-4">
              <span class="text-cyan-400 text-xl">🎓</span>
              <div>
                <h3 class="text-xl font-semibold text-white mb-2">Graduação em Engenharia da Computação</h3>
                <p class="text-gray-300">PUC Goiás</p>
                <p class="text-gray-400 mt-2">2015-2019</p>
                <ul class="mt-4 space-y-2 text-gray-300">
                  <li class="flex items-start">
                    <span class="text-cyan-400 mr-2">▹</span>
                    Diretor do Centro Acadêmico
                  </li>
                  <li class="flex items-start">
                    <span class="text-cyan-400 mr-2">▹</span>
                    TCC na Área de Segurança da Informação (Redes IEEE 802.11)
                  </li>
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