import { Component } from '@angular/core';

@Component({
  selector: 'app-certifications',
  standalone: true,
  template: `
    <section id="certificacoes" class="py-24 px-8">
      <div class="max-w-4xl mx-auto">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold bg-linear-to-r from-blue-400 to-cyan-400 text-transparent bg-clip-text inline-block">
            Certificações & Licenças
          </h2>
          <div class="mt-3 mx-auto w-16 h-px bg-linear-to-r from-blue-400 to-cyan-400 rounded-full"></div>
        </div>
        <div class="group bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 hover:border-yellow-500/30
                    shadow-lg transition-all duration-300 hover:-translate-y-0.5 relative overflow-hidden">
          <div class="absolute left-0 top-0 bottom-0 w-1 bg-linear-to-b from-yellow-400 to-orange-400 rounded-l-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div class="flex items-start space-x-5">
            <div class="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center shrink-0">
              <span class="text-2xl">🏆</span>
            </div>
            <div>
              <p class="text-yellow-400 text-xs font-mono tracking-wide mb-1 uppercase cert-year">2019 · V Congresso de Ciência e Tecnologia da PUCGO</p>
              <h3 class="text-xl font-semibold text-white mb-2">Certificado de Mérito no TCC</h3>
              <p class="text-gray-300 text-sm leading-relaxed">"REDES IEEE 802.11 PROTOCOLOS DE SEGURANÇA, VULNERABILIDADES E PROTEÇÃO" — Apresentação Oral</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  `
})
export class CertificationsComponent {}
