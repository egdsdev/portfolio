import { Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [FontAwesomeModule],
  template: `
    <section id="contato" class="py-20 px-8">
      <div class="max-w-4xl mx-auto text-center">
        <h2 class="text-4xl font-bold mb-16 bg-linear-to-r from-blue-400 to-cyan-400 text-transparent bg-clip-text">
          Vamos Conversar?
        </h2>
        <div class="grid md:grid-cols-3 gap-8">
          <a href="mailto:egds.dev@gmail.com" 
             class="group p-6 bg-gray-800/50 rounded-2xl hover:bg-gray-800/70 transition-all duration-300
                    transform hover:scale-105 backdrop-blur-sm border border-gray-700/50 hover:border-cyan-500/30">
            <div class="text-cyan-400 text-3xl mb-4 group-hover:scale-110 transition-transform">
              ✉️
            </div>
            <h3 class="text-lg font-semibold text-gray-200 mb-2">Email</h3>
            <p class="text-gray-400">egds.dev@gmail.com</p>
          </a>

          <a href="https://wa.me/5564992726932"
             target="_blank"
             rel="noopener noreferrer"
             class="group p-6 bg-gray-800/50 rounded-2xl hover:bg-gray-800/70 transition-all duration-300
                    transform hover:scale-105 backdrop-blur-sm border border-gray-700/50 hover:border-cyan-500/30">
            <div class="text-green-500 text-3xl mb-4 group-hover:scale-110 transition-transform">
              <fa-icon [icon]="whatsappIcon" class="text-4xl"></fa-icon>
            </div>
            <h3 class="text-lg font-semibold text-gray-200 mb-2">WhatsApp</h3>
            <p class="text-gray-400">+55 64 99272-6932</p>
          </a>

          <div class="group p-6 bg-gray-800/50 rounded-2xl hover:bg-gray-800/70 transition-all duration-300
                      transform hover:scale-105 backdrop-blur-sm border border-gray-700/50 hover:border-cyan-500/30">
            <div class="text-cyan-400 text-3xl mb-4 group-hover:scale-110 transition-transform">
              📍
            </div>
            <h3 class="text-lg font-semibold text-gray-200 mb-2">Localização</h3>
            <p class="text-gray-400">Piracanjuba, GO</p>
          </div>
        </div>
      </div>
    </section>
  `
})
export class ContactComponent {
  whatsappIcon = faWhatsapp;
}