import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  template: `
    <div class="fixed inset-0 z-200 flex items-center justify-center bg-black/60 backdrop-blur-sm"
         (click)="onCancel()">
      <div class="bg-gray-900 border border-gray-700/60 rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl"
           (click)="$event.stopPropagation()">

        <!-- Ícone -->
        <div class="flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10 mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-red-400" fill="none"
               viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round"
                  d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
          </svg>
        </div>

        <!-- Título -->
        <h3 class="text-base font-semibold text-white text-center mb-2">{{ title() }}</h3>

        <!-- Mensagem -->
        <p class="text-sm text-gray-400 text-center leading-relaxed mb-6">{{ message() }}</p>

        <!-- Botões -->
        <div class="flex gap-3">
          <button (click)="onCancel()"
                  class="flex-1 py-2.5 rounded-xl border border-gray-700 text-gray-400
                         hover:text-white hover:border-gray-600 transition-colors text-sm cursor-pointer">
            {{ cancelLabel() }}
          </button>
          <button (click)="onConfirm()"
                  class="flex-1 py-2.5 rounded-xl text-white font-medium text-sm transition-colors cursor-pointer"
                  [class]="confirmClass()">
            {{ confirmLabel() }}
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ConfirmDialogComponent {
  title    = input<string>('Confirmar ação');
  message  = input<string>('Tem certeza que deseja continuar?');
  confirmLabel = input<string>('Confirmar');
  cancelLabel  = input<string>('Cancelar');
  confirmClass = input<string>('bg-red-600 hover:bg-red-500');

  confirmed = output<void>();
  cancelled = output<void>();

  onConfirm(): void { this.confirmed.emit(); }
  onCancel():  void { this.cancelled.emit(); }
}
