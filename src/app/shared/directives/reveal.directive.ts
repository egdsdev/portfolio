import { Directive, ElementRef, Input, OnInit, OnDestroy, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

type RevealDirection = 'up' | 'down' | 'left' | 'right' | 'fade';

@Directive({
  selector: '[appReveal]',
  standalone: true,
})
export class RevealDirective implements OnInit, OnDestroy {
  @Input('appReveal') direction: RevealDirection = 'up';
  @Input() revealDelay = 0;
  @Input() revealThreshold = 0.15;

  private observer?: IntersectionObserver;
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  constructor(private el: ElementRef<HTMLElement>) {}

  ngOnInit() {
    // no HTML pré-renderizado o conteúdo fica visível; a animação é só no navegador
    if (!this.isBrowser) return;
    const el = this.el.nativeElement;

    // Estado inicial (escondido)
    el.style.opacity = '0';
    el.style.transition = `opacity 0.7s ease ${this.revealDelay}ms, transform 0.7s ease ${this.revealDelay}ms`;
    el.style.transform = this.initialTransform();
    el.style.willChange = 'opacity, transform';

    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          el.style.opacity = '1';
          el.style.transform = 'translate(0, 0)';
          // Limpa o will-change e o transform após a animação:
          // transform: translate(0,0) cria um containing block que quebra position:fixed
          setTimeout(() => {
            el.style.willChange = 'auto';
            el.style.transition = '';
            el.style.transform = '';
          }, 700 + this.revealDelay);
          this.observer?.disconnect();
        }
      },
      { threshold: this.revealThreshold }
    );

    this.observer.observe(el);
  }

  private initialTransform(): string {
    const dist = '32px';
    switch (this.direction) {
      case 'up':    return `translateY(${dist})`;
      case 'down':  return `translateY(-${dist})`;
      case 'left':  return `translateX(${dist})`;
      case 'right': return `translateX(-${dist})`;
      case 'fade':  return 'translateY(0)';
    }
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }
}
