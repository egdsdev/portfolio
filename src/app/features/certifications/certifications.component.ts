import { Component } from '@angular/core';

@Component({
  selector: 'app-certifications',
  standalone: true,
  template: `
    <section id="certificacoes" class="py-20 px-8">
      <div class="max-w-4xl mx-auto">
        <h2 class="text-4xl font-bold text-center mb-16 bg-linear-to-r from-blue-400 to-cyan-400 text-transparent bg-clip-text">
          Certificações & Licenças
        </h2>
        <div class="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 hover:bg-gray-800/60 transition-all duration-300
                    border border-gray-700/50 hover:border-cyan-500/30 shadow-lg">
          <div class="space-y-4 text-gray-300">
            <div class="flex items-start space-x-4">
              <span class="text-cyan-400 text-xl">🏆</span>
              <div>
                <h3 class="text-xl font-semibold text-white mb-2">Certificado de Mérito no TCC</h3>
                <p class="text-gray-400">V Congresso de Ciência e Tecnologia da PUCGO (2019)</p>
                <p class="text-gray-300 mt-2">"REDES IEEE 802.11 PROTOCOLOS DE SEGURANÇA, VULNERABILIDADES E PROTEÇÃO" - Apresentação Oral</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `
})
export class CertificationsComponent {}