import { DOCUMENT, Location } from '@angular/common';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

export type Lang = 'pt' | 'en';

const SITE = 'https://egdsdev.github.io/portfolio/';

const SEO: Record<Lang, { title: string; description: string; ogTitle: string; locale: string; htmlLang: string; image: string; imageAlt: string }> = {
  pt: {
    title: 'Elias Gomes da Silva · Desenvolvedor Full Stack Sênior | PHP, Laravel, Python',
    description: 'Desenvolvedor full stack sênior com 7+ anos em produção: PHP/Laravel, Python, arquitetura, infraestrutura e banco de dados. Supervisor de backend. Goiânia, GO.',
    ogTitle: 'Elias Gomes da Silva · Desenvolvedor Full Stack Sênior',
    locale: 'pt_BR',
    htmlLang: 'pt-BR',
    image: `${SITE}og-image.jpg`,
    imageAlt: 'Retrato em pontos de Elias Gomes da Silva, Desenvolvedor Full Stack Sênior',
  },
  en: {
    title: 'Elias Gomes da Silva · Senior Full Stack Developer | PHP, Laravel, Python',
    description: 'Senior full stack developer with 7+ years in production: PHP/Laravel, Python, architecture, infrastructure and databases. Backend supervisor. Goiânia, Brazil — open to remote work.',
    ogTitle: 'Elias Gomes da Silva · Senior Full Stack Developer',
    locale: 'en_US',
    htmlLang: 'en',
    image: `${SITE}og-image-en.jpg`,
    imageAlt: 'Dot portrait of Elias Gomes da Silva, Senior Full Stack Developer',
  },
};

/** Língua do site pela URL: /portfolio/ (pt) e /portfolio/en/ (en). */
@Injectable({ providedIn: 'root' })
export class LanguageService {
  private router = inject(Router);
  private title = inject(Title);
  private meta = inject(Meta);
  private doc = inject(DOCUMENT);

  /** lida da URL já na criação: servidor e navegador concordam no 1º quadro (hidratação) */
  readonly lang = signal<Lang>(langFromPath(inject(Location).path()));
  readonly isEn = computed(() => this.lang() === 'en');
  /** rota da página inicial em cada língua (seletor PT · EN) */
  readonly homePath = computed(() => (this.isEn() ? '/en' : '/'));
  readonly resume = computed(() => this.isEn()
    ? { href: 'resume-elias-gomes-en.pdf', file: 'Resume-Elias-Gomes-da-Silva.pdf' }
    : { href: 'curriculo-elias-gomes.pdf', file: 'Curriculo-Elias-Gomes-da-Silva.pdf' });

  constructor() {
    this.applySeo(this.lang());
    this.router.events.pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd)).subscribe((e) => {
      const lang = langFromPath(e.urlAfterRedirects);
      if (lang === this.lang()) return;
      this.lang.set(lang);
      this.applySeo(lang);
    });
  }

  /** escolhe o valor da língua ativa */
  pick<T>(values: Record<Lang, T>): T {
    return values[this.lang()];
  }

  private applySeo(lang: Lang): void {
    const s = SEO[lang];
    const url = lang === 'en' ? `${SITE}en/` : SITE;
    this.doc.documentElement.lang = s.htmlLang;
    this.title.setTitle(s.title);
    this.meta.updateTag({ name: 'description', content: s.description });
    this.meta.updateTag({ property: 'og:title', content: s.ogTitle });
    this.meta.updateTag({ property: 'og:description', content: s.description });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:locale', content: s.locale });
    this.meta.updateTag({ property: 'og:image', content: s.image });
    this.meta.updateTag({ property: 'og:image:alt', content: s.imageAlt });
    this.meta.updateTag({ name: 'twitter:title', content: s.ogTitle });
    this.meta.updateTag({ name: 'twitter:description', content: s.description });
    this.meta.updateTag({ name: 'twitter:image', content: s.image });
    this.meta.updateTag({ name: 'twitter:image:alt', content: s.imageAlt });
    this.doc.querySelector('link[rel="canonical"]')?.setAttribute('href', url);
  }
}

function langFromPath(path: string): Lang {
  return /^\/en(?:[/?#]|$)/.test(path) ? 'en' : 'pt';
}
