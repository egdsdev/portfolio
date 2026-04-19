import { Component, inject, signal, OnInit, OnDestroy, NgZone } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { FormsModule } from '@angular/forms';
import { AnalyticsService } from '../../core/services/analytics.service';
import { FirebaseService, ChatMessage } from '../../core/services/firebase.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [FontAwesomeModule, FormsModule],
  template: `
    <section id="contato" class="py-24 px-8">
      <div class="max-w-4xl mx-auto text-center">
        <div class="mb-16">
          <h2 class="text-4xl font-bold bg-linear-to-r from-blue-400 to-cyan-400 text-transparent bg-clip-text inline-block">
            Vamos Conversar?
          </h2>
          <div class="mt-3 mx-auto w-16 h-px bg-linear-to-r from-blue-400 to-cyan-400 rounded-full"></div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

          <!-- Email -->
          <a href="mailto:egds.dev@gmail.com"
             (click)="onEmailClick($event)"
             class="group p-6 bg-gray-800/50 rounded-2xl hover:bg-gray-800/70 transition-all duration-300
                    backdrop-blur-sm border border-gray-700/50 hover:border-cyan-500/30 hover:-translate-y-1">
            <div class="w-14 h-14 rounded-xl bg-cyan-500/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-cyan-500/20 transition-colors">
              <span class="text-2xl">✉️</span>
            </div>
            <h3 class="text-base font-semibold text-gray-200 mb-1">Email</h3>
            <p class="text-gray-400 text-sm">egds.dev&#64;gmail.com</p>
          </a>

          <!-- WhatsApp -->
          <a href="https://wa.me/5564992726932"
             target="_blank"
             rel="noopener noreferrer"
             (click)="onWhatsappClick($event)"
             class="group p-6 bg-gray-800/50 rounded-2xl hover:bg-gray-800/70 transition-all duration-300
                    backdrop-blur-sm border border-gray-700/50 hover:border-green-500/30 hover:-translate-y-1">
            <div class="w-14 h-14 rounded-xl bg-green-500/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-green-500/20 transition-colors">
              <fa-icon [icon]="whatsappIcon" class="text-2xl text-green-500"></fa-icon>
            </div>
            <h3 class="text-base font-semibold text-gray-200 mb-1">WhatsApp</h3>
            <p class="text-gray-400 text-sm">+55 64 99272-6932</p>
          </a>

          <!-- Chat ao Vivo -->
          <button (click)="openEntryModal()"
                  class="group p-6 bg-gray-800/50 rounded-2xl hover:bg-gray-800/70 transition-all duration-300
                         backdrop-blur-sm border border-gray-700/50 hover:border-violet-500/30 hover:-translate-y-1
                         cursor-pointer text-center w-full">
            <div class="w-14 h-14 rounded-xl bg-violet-500/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-violet-500/20 transition-colors">
              <span class="text-2xl">💬</span>
            </div>
            <h3 class="text-base font-semibold text-gray-200 mb-1">Chat ao Vivo</h3>
            <p class="text-gray-400 text-sm">Fale diretamente aqui</p>
          </button>

          <!-- Localização -->
          <div class="group p-6 bg-gray-800/50 rounded-2xl hover:bg-gray-800/70 transition-all duration-300
                      backdrop-blur-sm border border-gray-700/50 hover:border-blue-500/30 hover:-translate-y-1 cursor-default">
            <div class="w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-500/20 transition-colors">
              <span class="text-2xl">📍</span>
            </div>
            <h3 class="text-base font-semibold text-gray-200 mb-1">Localização</h3>
            <p class="text-gray-400 text-sm">Piracanjuba, GO</p>
          </div>
        </div>
      </div>
    </section>

    <!-- â”€â”€ Modal de entrada no chat â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ -->
    @if (chatState() === 'entry') {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
           (click)="closeModal()">
        <div class="bg-gray-900 border border-gray-700/60 rounded-2xl p-8 w-full max-w-md mx-4 shadow-2xl"
             (click)="$event.stopPropagation()">
          <div class="text-center mb-6">
            <div class="w-14 h-14 rounded-2xl bg-violet-500/10 flex items-center justify-center mx-auto mb-3">
              <span class="text-3xl">💬</span>
            </div>
            <h3 class="text-xl font-semibold text-white">Iniciar conversa</h3>
            <p class="text-gray-400 text-sm mt-1">Assim sei com quem estou falando!</p>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1.5">
                Nome <span class="text-red-400">*</span>
              </label>
              <input [(ngModel)]="chatUsername"
                     name="chatUsername"
                     class="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm
                            placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors"
                     placeholder="Seu nome"
                     (keydown.enter)="startChat()" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1.5">
                Empresa <span class="text-gray-500 text-xs">(opcional)</span>
              </label>
              <input [(ngModel)]="chatCompany"
                     name="chatCompany"
                     class="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm
                            placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors"
                     placeholder="Nome da empresa" />
            </div>
          </div>

          @if (chatError()) {
            <p class="text-red-400 text-xs text-center mt-3">{{ chatError() }}</p>
          }
          <div class="flex gap-3 mt-6">
            <button (click)="closeModal()"
                    class="flex-1 py-2.5 rounded-xl border border-gray-700 text-gray-400
                           hover:text-white hover:border-gray-600 transition-colors text-sm cursor-pointer">
              Cancelar
            </button>
            <button (click)="startChat()"
                    [disabled]="!chatUsername.trim() || isStartingChat()"
                    class="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500
                           disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm transition-colors cursor-pointer">
              @if (isStartingChat()) { Aguarde... } @else { Entrar no chat }
            </button>
          </div>
        </div>
      </div>
    }

    <!-- â”€â”€ Janela de chat (fixed bottom-right) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ -->
    @if (chatState() === 'open') {
      <div class="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] flex flex-col
                  rounded-2xl bg-gray-900 border border-gray-700/60 shadow-2xl overflow-hidden"
           style="height:520px">

        <!-- Header -->
        <div class="flex items-center gap-3 px-4 py-3 bg-gray-800/80 border-b border-gray-700/50 shrink-0">
          <div class="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center shrink-0">
            <span class="text-sm">💬</span>
          </div>
          <div class="flex-1 min-w-0 text-left">
            <p class="text-sm font-medium text-white truncate">{{ chatCompany ? chatCompany + ' · ' + chatUsername : chatUsername }}</p>
            <p class="text-xs flex items-center gap-1" [class]="isOwnerOnline() ? 'text-green-400' : 'text-gray-500'">
              <span class="inline-block w-1.5 h-1.5 rounded-full" [class]="isOwnerOnline() ? 'bg-green-400' : 'bg-gray-500'"></span>
              {{ isOwnerOnline() ? 'Online' : 'Offline' }}
            </p>
          </div>
          <button (click)="closeChat()"
                  class="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-700/50 shrink-0 cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Mensagens -->
        <div #msgContainer data-chat-msgs class="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          @if (chatMessages().length === 0) {
            <div class="flex flex-col items-center justify-center h-full text-center">
              <span class="text-3xl mb-2">👋</span>
              <p class="text-gray-400 text-sm">Olá, {{ chatUsername }}!<br>Deixe sua mensagem e eu respondo em breve.</p>
            </div>
          }
          @for (msg of chatMessages(); track msg.id) {
            <div [class]="msg.sender === 'visitor' ? 'flex justify-end' : 'flex justify-start'">
              <div [class]="msg.sender === 'visitor'
                  ? 'max-w-[78%] bg-violet-600 text-white rounded-2xl rounded-br-sm px-3.5 py-2 text-sm'
                  : 'max-w-[78%] bg-gray-700/80 text-gray-100 rounded-2xl rounded-bl-sm px-3.5 py-2 text-sm'">
                @if (msg.sender === 'owner') {
                  <p class="text-[10px] text-violet-300 font-semibold mb-1">Enzo</p>
                }
                <p class="break-words whitespace-pre-wrap">{{ msg.text }}</p>
                <p [class]="msg.sender === 'visitor'
                    ? 'text-violet-300/70 text-[10px] mt-1 text-right'
                    : 'text-gray-400 text-[10px] mt-1 text-right'">
                  {{ formatTime(msg.sentAt) }}
                </p>
              </div>
            </div>
          }
        </div>

        <!-- Input -->
        <div class="px-3 py-3 border-t border-gray-700/50 bg-gray-800/40 flex items-end gap-2 shrink-0">
          <textarea [(ngModel)]="chatInput"
                    name="chatInput"
                    (keydown)="onChatKeydown($event)"
                    (input)="autoGrow($event)"
                    rows="1"
                    class="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3.5 py-2.5 text-white text-sm
                           placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors
                           resize-none max-h-24 overflow-y-auto"
                    placeholder="Digite sua mensagem..."></textarea>
          <button (click)="sendMessage()"
                  [disabled]="!chatInput.trim() || isSendingMsg()"
                  class="shrink-0 w-9 self-stretch rounded-xl bg-violet-600 hover:bg-violet-500
                         disabled:opacity-40 disabled:cursor-not-allowed transition-colors
                         flex items-center justify-center cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    }
  `
})
export class ContactComponent implements OnInit, OnDestroy {
  private analytics = inject(AnalyticsService);
  private firebase = inject(FirebaseService);
  private zone = inject(NgZone);

  whatsappIcon = faWhatsapp;

  // â”€â”€ Chat state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  chatState = signal<'closed' | 'entry' | 'open'>('closed');
  chatMessages = signal<ChatMessage[]>([]);
  isStartingChat = signal(false);
  isSendingMsg = signal(false);
  chatError = signal('');
  isOwnerOnline = signal(false);

  chatUsername = '';
  chatCompany = '';
  chatInput = '';

  private readonly STORAGE_NAME = 'portfolio-chat-name';
  private readonly STORAGE_COMPANY = 'portfolio-chat-company';
  private conversationId: string | null = null;
  private unsubMessages?: () => void;
  private unsubPresence?: () => void;

  ngOnInit(): void {
    this.unsubPresence = this.firebase.listenToOwnerPresence(online =>
      this.zone.run(() => this.isOwnerOnline.set(online))
    );
  }

  openEntryModal(): void {
    this.chatError.set('');
    const savedName = localStorage.getItem(this.STORAGE_NAME) ?? '';
    if (savedName) {
      this.chatUsername = savedName;
      this.chatCompany = localStorage.getItem(this.STORAGE_COMPANY) ?? '';
      void this.startChat();
    } else {
      this.chatState.set('entry');
    }
  }

  closeModal(): void { this.chatState.set('closed'); }

  closeChat(): void {
    this.unsubMessages?.();
    this.unsubMessages = undefined;
    this.chatMessages.set([]);
    this.chatInput = '';
    this.conversationId = null;
    this.chatState.set('closed');
  }

  async startChat(): Promise<void> {
    if (!this.chatUsername.trim() || this.isStartingChat()) return;
    this.isStartingChat.set(true);
    try {
      const ip = await this.analytics.getVisitorIp();
      this.conversationId = await this.firebase.createChatConversation({
        username: this.chatUsername.trim(),
        company: this.chatCompany.trim() || undefined,
        ip,
      });
      localStorage.setItem(this.STORAGE_NAME, this.chatUsername.trim());
      if (this.chatCompany.trim()) {
        localStorage.setItem(this.STORAGE_COMPANY, this.chatCompany.trim());
      } else {
        localStorage.removeItem(this.STORAGE_COMPANY);
      }
      this.unsubMessages = this.firebase.listenToChatMessages(
        this.conversationId,
        msgs => this.zone.run(() => {
          this.chatMessages.set(msgs);
          this.scrollToBottom();
        }),
      );
      this.chatState.set('open');
    } catch (err) {
      console.error('[Chat] startChat error:', err);
      const msg = err instanceof Error ? err.message : String(err);
      this.chatError.set(`Não foi possível iniciar o chat. Detalhe: ${msg}`);
    } finally {
      this.isStartingChat.set(false);
    }
  }

  async sendMessage(): Promise<void> {
    const text = this.chatInput.trim();
    if (!text || !this.conversationId || this.isSendingMsg()) return;
    this.chatInput = '';
    this.isSendingMsg.set(true);
    try {
      await this.firebase.sendChatMessage(this.conversationId, text, 'visitor');
    } finally {
      this.isSendingMsg.set(false);
    }
  }

  onChatKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void this.sendMessage();
    }
  }

  autoGrow(event: Event): void {
    const el = event.target as HTMLTextAreaElement;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 96) + 'px';
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  private scrollToBottom(): void {
    window.setTimeout(() => {
      const el = document.querySelector<HTMLDivElement>('[data-chat-msgs]');
      if (el) el.scrollTop = el.scrollHeight;
    }, 60);
  }

  ngOnDestroy(): void {
    this.unsubMessages?.();
    this.unsubPresence?.();
  }

  onEmailClick(event: MouseEvent): void {
    void this.trackAndFollowLink(event, this.analytics.trackContactClick('email'));
  }

  onWhatsappClick(_event: MouseEvent): void {
    void this.analytics.trackContactClick('whatsapp');
  }

  private async trackAndFollowLink(event: MouseEvent, tracking: Promise<void>): Promise<void> {
    const anchor = event.currentTarget;
    if (!(anchor instanceof HTMLAnchorElement)) return;

    event.preventDefault();

    await Promise.race([
      tracking.catch(() => undefined),
      new Promise<void>(resolve => window.setTimeout(resolve, 400)),
    ]);

    window.location.href = anchor.href;
  }
}
