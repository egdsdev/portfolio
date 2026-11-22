import { RenderMode, ServerRoute } from '@angular/ssr';

/** Páginas iniciais (pt e en) saem prontas do build; o resto (admin) roda no navegador. */
export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'en', renderMode: RenderMode.Prerender },
  { path: '**', renderMode: RenderMode.Client },
];
