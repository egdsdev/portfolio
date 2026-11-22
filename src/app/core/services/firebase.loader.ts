import { EnvironmentInjector, inject } from '@angular/core';
import type { FirebaseService } from './firebase.service';

/**
 * Acesso preguiçoso ao FirebaseService: o SDK (~470 KB) sai do JavaScript inicial
 * e só é baixado/avaliado na primeira chamada. Chamar em contexto de injeção.
 */
export function lazyFirebase(): () => Promise<FirebaseService> {
  const injector = inject(EnvironmentInjector);
  let service: Promise<FirebaseService> | undefined;
  return () => (service ??= import('./firebase.service').then(m => injector.get(m.FirebaseService)));
}

/** Roda quando o navegador estiver ocioso (depois da primeira pintura), com prazo máximo. */
export function whenIdle(fn: () => void, timeout = 2500): void {
  if ('requestIdleCallback' in window) requestIdleCallback(() => fn(), { timeout });
  else setTimeout(fn, 300);
}
