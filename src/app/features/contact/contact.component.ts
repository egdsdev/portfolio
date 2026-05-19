import { Component, inject, signal, OnInit, OnDestroy, NgZone } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { FormsModule } from '@angular/forms';
import { AnalyticsService } from '../../core/services/analytics.service';
import { FirebaseService, ChatMessage, isChatMessageWithinEditWindow } from '../../core/services/firebase.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [FontAwesomeModule, FormsModule, ConfirmDialogComponent],
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
          <a href="https://wa.me/5562981476096"
             target="_blank"
             rel="noopener noreferrer"
             (click)="onWhatsappClick($event)"
             class="group p-6 bg-gray-800/50 rounded-2xl hover:bg-gray-800/70 transition-all duration-300
                    backdrop-blur-sm border border-gray-700/50 hover:border-green-500/30 hover:-translate-y-1">
            <div class="w-14 h-14 rounded-xl bg-green-500/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-green-500/20 transition-colors">
              <fa-icon [icon]="whatsappIcon" class="text-2xl text-green-500"></fa-icon>
            </div>
            <h3 class="text-base font-semibold text-gray-200 mb-1">WhatsApp</h3>
            <p class="text-gray-400 text-sm">Fale por WhatsApp</p>
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
            <p class="text-gray-400 text-sm">Goiânia, GO</p>
          </div>
        </div>
      </div>
    </section>

    <!-- â”€â”€ Modal de entrada no chat â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ -->
    @if (chatState() === 'entry') {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
           (click)="closeModal()">
        <div class="chat-modal bg-gray-900 border border-gray-700/60 rounded-2xl p-8 w-full max-w-md mx-4 shadow-2xl"
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
      <div class="chat-window fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] flex flex-col
                  rounded-2xl bg-gray-900 border border-gray-700/60 shadow-2xl overflow-hidden"
           style="height:520px">

        <!-- ── Overlay: editar perfil ──────────────────────────────── -->
        @if (isEditingProfile()) {
          <div class="absolute inset-0 z-10 bg-gray-900 flex flex-col">
            <div class="flex items-center gap-3 px-4 py-3 bg-gray-800/80 border-b border-gray-700/50 shrink-0">
              <button (click)="cancelEditProfile()"
                      class="chat-close-btn text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-700/50 shrink-0 cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <p class="text-sm font-medium text-white flex-1">Editar perfil</p>
            </div>
            <div class="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4">
              <div>
                <label class="block text-xs font-medium text-gray-400 mb-1.5">Nome <span class="text-red-400">*</span></label>
                <input [(ngModel)]="editName"
                       name="editName"
                       (keydown.enter)="saveProfile()"
                       class="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm
                              placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors"
                       placeholder="Seu nome" />
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-400 mb-1.5">Empresa <span class="text-gray-500 text-xs">(opcional)</span></label>
                <input [(ngModel)]="editCompany"
                       name="editCompany"
                       (keydown.enter)="saveProfile()"
                       class="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm
                              placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors"
                       placeholder="Nome da empresa" />
              </div>
              <p class="text-xs text-gray-600 mt-1">As alterações ficam vinculadas ao seu IP e serão visíveis para Elias.</p>
            </div>
            <div class="px-5 py-4 border-t border-gray-700/50 flex gap-3 shrink-0">
              <button (click)="cancelEditProfile()"
                      class="flex-1 py-2.5 rounded-xl border border-gray-700 text-gray-400
                             hover:text-white hover:border-gray-600 transition-colors text-sm cursor-pointer">
                Cancelar
              </button>
              <button (click)="saveProfile()"
                      [disabled]="!editName.trim() || isSavingProfile()"
                      class="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500
                             disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm transition-colors cursor-pointer">
                @if (isSavingProfile()) { Salvando... } @else { Salvar }
              </button>
            </div>
          </div>
        }

        <!-- Header -->
        <div class="flex items-center gap-3 px-4 py-3 bg-gray-800/80 border-b border-gray-700/50 shrink-0">
          <div class="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center shrink-0">
            <span class="text-sm">💬</span>
          </div>
          <div class="flex-1 min-w-0 text-left">
            <p class="text-sm font-medium text-white truncate">Elias Gomes</p>
            <p class="text-xs flex items-center gap-1" [class]="isOwnerOnline() ? 'text-green-400' : 'text-gray-500'">
              <span class="inline-block w-1.5 h-1.5 rounded-full" [class]="isOwnerOnline() ? 'bg-green-400' : 'bg-gray-500'"></span>
              {{ isOwnerOnline() ? 'Online' : 'Offline' }}
            </p>
          </div>
          <button (click)="openEditProfile()"
                  title="Editar nome / empresa"
                  class="chat-close-btn text-gray-400 hover:text-violet-400 transition-colors p-1 rounded-lg hover:bg-gray-700/50 shrink-0 cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button (click)="closeChat()"
                  class="chat-close-btn text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-700/50 shrink-0 cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Mensagens -->
        <div #msgContainer data-chat-msgs class="flex-1 overflow-y-auto px-4 py-3 space-y-2"
             (click)="closeMessageMenu()"
             (scroll)="closeMessageMenu()">
          @if (chatMessages().length === 0) {
            <div class="flex flex-col items-center justify-center h-full text-center">
              <span class="text-3xl mb-2">👋</span>
              <p class="text-gray-400 text-sm">Olá, {{ chatUsername }}!<br>Deixe sua mensagem e eu respondo em breve.</p>
            </div>
          }
          @for (msg of chatMessages(); track msg.id) {
            <div [class]="msg.sender === 'visitor' ? 'group flex justify-end items-start gap-1.5' : 'group flex justify-start items-start gap-1.5'">
              <!-- Balonzinho -->
              <div [class]="msg.deletedAt
                  ? 'max-w-[78%] bg-gray-700/40 text-gray-500 rounded-2xl px-3.5 py-2 text-sm italic'
                  : msg.sender === 'visitor'
                    ? 'chat-msg-visitor max-w-[78%] bg-violet-600 text-white rounded-2xl rounded-br-sm px-3.5 py-2 text-sm'
                    : 'chat-msg-owner max-w-[78%] bg-gray-700/80 text-gray-100 rounded-2xl rounded-bl-sm px-3.5 py-2 text-sm'">
                @if (msg.deletedAt) {
                  <p class="flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
                    </svg>
                    Mensagem excluída
                  </p>
                } @else {
                  @if (msg.sender === 'owner') {
                    <p class="chat-owner-label text-xs text-violet-300 font-semibold mb-1">Elias</p>
                  }
                  @if (editingMessageId() === msg.id) {
                    <div class="space-y-2 min-w-[220px]" (click)="$event.stopPropagation()">
                      <textarea [ngModel]="editMessageText()"
                                (ngModelChange)="editMessageText.set($event)"
                                (keydown)="onEditMessageKeydown($event, msg)"
                                rows="3"
                                class="w-full bg-black/10 border border-white/15 rounded-xl px-3 py-2 text-sm text-white
                                       placeholder-white/50 focus:outline-none focus:border-white/30 resize-none"
                                placeholder="Edite sua mensagem..."></textarea>
                      <div class="flex items-center justify-end gap-2">
                        <button (click)="cancelEditMessage()"
                                class="px-2.5 py-1 rounded-lg text-xs bg-black/15 hover:bg-black/25 transition-colors cursor-pointer">
                          Cancelar
                        </button>
                        <button (click)="saveEditedMessage(msg)"
                                [disabled]="!editMessageText().trim() || isSavingEditedMsg()"
                                class="px-2.5 py-1 rounded-lg text-xs bg-white/15 hover:bg-white/25 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer">
                          @if (isSavingEditedMsg()) { Salvando... } @else { Salvar }
                        </button>
                      </div>
                    </div>
                  } @else {
                    @if (msg.text) {
                      <p class="wrap-break-word whitespace-pre-wrap">{{ msg.text }}</p>
                    }
                    @if (msg.fileUrl) {
                      <a [href]="msg.fileUrl" target="_blank" rel="noopener noreferrer"
                         class="flex items-center gap-1.5 mt-1 text-xs underline opacity-80 break-all">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        {{ msg.fileName }}
                      </a>
                    }
                    <p [class]="msg.sender === 'visitor'
                        ? 'text-violet-300/70 text-xs mt-1 text-right'
                        : 'text-gray-400 text-xs mt-1 text-right'">
                      {{ formatTime(msg.sentAt) }}@if (msg.editedAt) { · editada }
                    </p>
                  }
                }
              </div>
              @if (msg.sender === 'visitor' && !msg.deletedAt && editingMessageId() !== msg.id) {
                <div class="self-start mt-1 shrink-0" (click)="$event.stopPropagation()">
                  <button (click)="toggleMessageMenu(msg, $event)"
                          class="text-gray-500 hover:text-white transition-colors cursor-pointer p-1 rounded-lg hover:bg-gray-700/40"
                          title="Mais ações">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 5h.01M12 12h.01M12 19h.01" />
                    </svg>
                  </button>
                </div>
              }
            </div>
          }
        </div>

        <!-- Input -->
        <div class="px-3 py-3 border-t border-gray-700/50 bg-gray-800/40 flex flex-col gap-2 shrink-0">
          <!-- Arquivo selecionado -->
          @if (pendingFile) {
            <div class="flex items-center gap-2 px-2 py-1 bg-gray-700/60 rounded-lg text-xs text-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 shrink-0 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              <span class="flex-1 truncate">{{ pendingFile.name }}</span>
              <button (click)="pendingFile = null" class="text-gray-500 hover:text-white cursor-pointer">✕</button>
            </div>
          }
          <div class="flex items-end gap-2">
            <!-- Input file oculto -->
            <input #fileInput type="file" accept=".pdf,.jpg,.jpeg,.png" class="hidden"
                   (change)="onFileSelected($event)" />
            <!-- Botão clipe -->
            <button (click)="fileInput.click()"
                    [disabled]="isSendingMsg()"
                    class="shrink-0 self-stretch min-w-8 px-2 rounded-xl border border-gray-700 bg-gray-800/50
                           text-gray-400 hover:text-violet-400 hover:border-violet-500/50 transition-colors
                           flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>
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
                    [disabled]="(!chatInput.trim() && !pendingFile) || isSendingMsg()"
                    class="chat-send-btn shrink-0 self-stretch min-w-9 px-3 rounded-xl bg-violet-600 hover:bg-violet-500
                           disabled:opacity-40 disabled:cursor-not-allowed transition-colors
                           flex items-center justify-center cursor-pointer">
              @if (isSendingMsg()) {
                <svg class="w-4 h-4 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
              } @else {
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              }
            </button>
          </div>
        </div>
      </div>
    }

    <!-- ── Dropdown flutuante do menu de mensagem ────────────────── -->
    @if (openMessageMenuId() && menuPos()) {
      <div class="fixed w-36 rounded-xl border border-gray-700 bg-gray-900 shadow-2xl z-9999"
           [style.top.px]="menuPos()!.top"
           [style.right.px]="menuPos()!.right"
           (click)="$event.stopPropagation()">
        @for (msg of chatMessages(); track msg.id) {
          @if (msg.id === openMessageMenuId()) {
            @if (canEditVisitorMessage(msg)) {
              <button (click)="startEditMessage(msg)"
                      class="w-full px-3 py-2 text-left text-sm text-gray-200 hover:bg-gray-800 transition-colors cursor-pointer">
                Editar
              </button>
            }
            <button (click)="askDeleteMessage(msg)"
                    class="w-full px-3 py-2 text-left text-sm text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer">
              Excluir
            </button>
          }
        }
      </div>
    }

    <!-- ── Dialog: confirmar exclusão de mensagem ─────────────────── -->
    @if (msgToDelete()) {
      <app-confirm-dialog
        title="Excluir mensagem"
        message="Esta mensagem será excluída para todos os participantes. Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        (confirmed)="confirmDeleteMessage()"
        (cancelled)="cancelDeleteMessage()" />
    }

    <!-- ── Toast de nova mensagem ─────────────────────────────────── -->
    @if (toastMsg()) {
      <div class="chat-toast fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-gray-900 border border-violet-500/50
                  rounded-2xl shadow-2xl px-4 py-3 max-w-xs animate-[slideUp_0.3s_ease-out]">
        <div class="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center shrink-0">
          <span class="text-sm">💬</span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-xs font-semibold text-violet-400">Elias Gomes</p>
          <p class="text-sm text-gray-200 truncate">{{ toastMsg() }}</p>
        </div>
        <button (click)="openChatFromToast()"
                class="shrink-0 text-xs bg-violet-600 hover:bg-violet-500 text-white px-2.5 py-1 rounded-lg transition-colors cursor-pointer">
          Abrir
        </button>
        <button (click)="dismissToast()"
                class="shrink-0 text-gray-500 hover:text-white transition-colors cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
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
  toastMsg = signal('');
  isEditingProfile = signal(false);
  isSavingProfile = signal(false);
  msgToDelete = signal<ChatMessage | null>(null);
  openMessageMenuId = signal<string | null>(null);
  menuPos = signal<{top: number; right: number} | null>(null);
  editingMessageId = signal<string | null>(null);
  editMessageText = signal('');
  isSavingEditedMsg = signal(false);

  chatUsername = '';
  chatCompany = '';
  chatInput = '';
  pendingFile: File | null = null;
  editName = '';
  editCompany = '';

  private readonly ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
  private readonly ALLOWED_EXT = ['.pdf', '.jpg', '.jpeg', '.png'];

  private readonly STORAGE_NAME = 'portfolio-chat-name';
  private readonly STORAGE_COMPANY = 'portfolio-chat-company';
  private readonly STORAGE_CONV = 'portfolio-chat-conv';
  private conversationId: string | null = null;
  private unsubMessages?: () => void;
  private unsubPresence?: () => void;
  private unsubBackground?: () => void;
  private toastTimer?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    this.unsubPresence = this.firebase.listenToOwnerPresence(online =>
      this.zone.run(() => this.isOwnerOnline.set(online))
    );
    this.startBackgroundListener();
    this._openChatHandler = () => this.zone.run(() => this.openEntryModal());
    window.addEventListener('open-chat', this._openChatHandler);
  }

  private _openChatHandler?: EventListener;

  private startBackgroundListener(): void {
    const convId = localStorage.getItem(this.STORAGE_CONV);
    if (!convId) return;
    this.conversationId = convId;
    this.unsubBackground = this.firebase.listenToChatMessages(convId, msgs =>
      this.zone.run(() => {
        if (this.chatState() === 'open') return;
        const ownerMsgs = msgs.filter(m => m.sender === 'owner');
        if (!ownerMsgs.length) return;
        const last = ownerMsgs[ownerMsgs.length - 1];
        const age = Date.now() - last.sentAt.getTime();
        if (age < 60_000) this.showToast(last.text);
      })
    );
  }

  private showToast(text: string): void {
    clearTimeout(this.toastTimer);
    this.toastMsg.set(text);
    this.toastTimer = setTimeout(() => this.toastMsg.set(''), 8000);
  }

  dismissToast(): void { clearTimeout(this.toastTimer); this.toastMsg.set(''); }

  openChatFromToast(): void {
    this.dismissToast();
    const savedName = localStorage.getItem(this.STORAGE_NAME) ?? '';
    if (savedName && this.conversationId) {
      this.chatUsername = savedName;
      this.chatCompany = localStorage.getItem(this.STORAGE_COMPANY) ?? '';
      this.unsubBackground?.();
      this.unsubBackground = undefined;
      this.unsubMessages = this.firebase.listenToChatMessages(
        this.conversationId,
        msgs => this.zone.run(() => { this.chatMessages.set(msgs); this.scrollToBottom(); }),
      );
      this.chatState.set('open');
      void this.firebase.setVisitorOnline(this.conversationId, true);
    } else {
      this.openEntryModal();
    }
  }

  openEntryModal(): void {
    this.chatError.set('');
    const savedName = localStorage.getItem(this.STORAGE_NAME) ?? '';
    const savedConvId = this.conversationId ?? localStorage.getItem(this.STORAGE_CONV);
    if (savedName && savedConvId) {
      // Retornante com conversa existente: reabre sem criar nova
      this.chatUsername = savedName;
      this.chatCompany = localStorage.getItem(this.STORAGE_COMPANY) ?? '';
      this.conversationId = savedConvId;
      this.unsubBackground?.();
      this.unsubBackground = undefined;
      this.unsubMessages = this.firebase.listenToChatMessages(
        savedConvId,
        msgs => this.zone.run(() => { this.chatMessages.set(msgs); this.scrollToBottom(); }),
      );
      this.chatState.set('open');
      void this.firebase.setVisitorOnline(savedConvId, true);
    } else {
      // Sem conversa existente: mostra modal com campos pré-preenchidos (se houver)
      this.chatUsername = savedName;
      this.chatCompany = localStorage.getItem(this.STORAGE_COMPANY) ?? '';
      this.chatState.set('entry');
    }
  }

  closeModal(): void { this.chatState.set('closed'); }

  closeChat(): void {
    if (this.conversationId) void this.firebase.setVisitorOnline(this.conversationId, false);
    this.unsubMessages?.();
    this.unsubMessages = undefined;
    this.chatMessages.set([]);
    this.closeMessageMenu();
    this.cancelEditMessage();
    this.chatInput = '';
    this.chatState.set('closed');
    // Retoma listener background para capturar novas mensagens
    const convId = this.conversationId;
    this.conversationId = null;
    if (convId) {
      this.conversationId = convId;
      this.startBackgroundListener();
    }
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
      localStorage.setItem(this.STORAGE_CONV, this.conversationId);
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
      void this.firebase.setVisitorOnline(this.conversationId, true);
      // Cancela listener background pois o chat está aberto
      this.unsubBackground?.();
      this.unsubBackground = undefined;
    } catch (err) {
      console.error('[Chat] startChat error:', err);
      const msg = err instanceof Error ? err.message : String(err);
      this.chatError.set(`Não foi possível iniciar o chat. Detalhe: ${msg}`);
    } finally {
      this.isStartingChat.set(false);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!this.ALLOWED_EXT.includes(ext) && !this.ALLOWED_TYPES.includes(file.type)) return;
    if (file.size > 10 * 1024 * 1024) { alert('Arquivo deve ter no máximo 10 MB.'); return; }
    this.pendingFile = file;
  }

  async sendMessage(): Promise<void> {
    const text = this.chatInput.trim();
    if ((!text && !this.pendingFile) || !this.conversationId || this.isSendingMsg()) return;
    this.chatInput = '';
    const fileToSend = this.pendingFile;
    this.pendingFile = null;
    this.isSendingMsg.set(true);
    try {
      let fileAttachment: { url: string; name: string } | undefined;
      if (fileToSend) {
        fileAttachment = await this.firebase.uploadChatFile(this.conversationId, fileToSend);
      }
      await this.firebase.sendChatMessage(this.conversationId, text, 'visitor', fileAttachment);
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

  openEditProfile(): void {
    this.editName = this.chatUsername;
    this.editCompany = this.chatCompany;
    this.isEditingProfile.set(true);
  }

  cancelEditProfile(): void {
    this.isEditingProfile.set(false);
  }

  async saveProfile(): Promise<void> {
    const name = this.editName.trim();
    if (!name || !this.conversationId || this.isSavingProfile()) return;
    this.isSavingProfile.set(true);
    try {
      const company = this.editCompany.trim() || undefined;
      await this.firebase.updateChatConversationProfile(this.conversationId, { username: name, company });
      this.chatUsername = name;
      this.chatCompany = this.editCompany.trim();
      localStorage.setItem(this.STORAGE_NAME, name);
      if (this.chatCompany) {
        localStorage.setItem(this.STORAGE_COMPANY, this.chatCompany);
      } else {
        localStorage.removeItem(this.STORAGE_COMPANY);
      }
      this.isEditingProfile.set(false);
    } catch (err) {
      console.error('[Chat] saveProfile error:', err);
    } finally {
      this.isSavingProfile.set(false);
    }
  }

  autoGrow(event: Event): void {
    const el = event.target as HTMLTextAreaElement;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 96) + 'px';
  }

  askDeleteMessage(msg: ChatMessage): void {
    this.closeMessageMenu();
    if (this.editingMessageId() === msg.id) this.cancelEditMessage();
    this.msgToDelete.set(msg);
  }

  cancelDeleteMessage(): void {
    this.msgToDelete.set(null);
  }

  async confirmDeleteMessage(): Promise<void> {
    const msg = this.msgToDelete();
    if (!msg?.id || !this.conversationId) { this.msgToDelete.set(null); return; }
    this.msgToDelete.set(null);
    await this.firebase.softDeleteChatMessage(this.conversationId, msg.id);
  }

  toggleMessageMenu(msg: ChatMessage, event: MouseEvent): void {
    event.stopPropagation();
    if (!msg.id) return;
    if (this.openMessageMenuId() === msg.id) {
      this.openMessageMenuId.set(null);
      this.menuPos.set(null);
    } else {
      const btn = event.currentTarget as HTMLElement;
      const rect = btn.getBoundingClientRect();
      this.menuPos.set({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
      this.openMessageMenuId.set(msg.id);
    }
  }

  closeMessageMenu(): void {
    this.openMessageMenuId.set(null);
    this.menuPos.set(null);
  }

  canEditVisitorMessage(msg: ChatMessage): boolean {
    return msg.sender === 'visitor' && !msg.deletedAt && !msg.fileUrl && isChatMessageWithinEditWindow(msg.sentAt);
  }

  startEditMessage(msg: ChatMessage): void {
    if (!msg.id || !this.canEditVisitorMessage(msg)) return;
    this.closeMessageMenu();
    this.editingMessageId.set(msg.id);
    this.editMessageText.set(msg.text);
  }

  cancelEditMessage(): void {
    this.editingMessageId.set(null);
    this.editMessageText.set('');
  }

  async saveEditedMessage(msg: ChatMessage): Promise<void> {
    const text = this.editMessageText().trim();
    if (!this.canEditVisitorMessage(msg)) {
      this.cancelEditMessage();
      return;
    }
    if (!msg.id || !this.conversationId || !text || this.isSavingEditedMsg()) return;
    this.isSavingEditedMsg.set(true);
    try {
      await this.firebase.updateChatMessage(this.conversationId, msg.id, text);
      this.cancelEditMessage();
    } finally {
      this.isSavingEditedMsg.set(false);
    }
  }

  onEditMessageKeydown(event: KeyboardEvent, msg: ChatMessage): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.cancelEditMessage();
      return;
    }
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void this.saveEditedMessage(msg);
    }
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
    this.unsubBackground?.();
    clearTimeout(this.toastTimer);
    if (this._openChatHandler) window.removeEventListener('open-chat', this._openChatHandler);
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
