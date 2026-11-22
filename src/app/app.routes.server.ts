import { RenderMode, ServerRoute } from '@angular/ssr';

/** Página inicial sai pronta do build (HTML estático); o resto (admin) roda no navegador. */
export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  { path: '**', renderMode: RenderMode.Client },
];
