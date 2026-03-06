import { Component, signal, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { NgxThemeToggleComponent } from '@omnedia/ngx-theme-toggle';
import { FirebaseService } from '../../core/services/firebase.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [NgxThemeToggleComponent, RouterLink],
  template: `
    <!-- Header Desktop: oculto no mobile -->
    <nav class="fixed top-0 left-0 right-0 bg-gray-900/90 backdrop-blur-md z-50 border-b border-gray-800/50 hidden md:block">
      <div class="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        <a href="#detalhes" class="text-cyan-400 font-bold text-base tracking-widest font-mono hover:text-cyan-300 transition-colors">&lt;EG /&gt;</a>
        <ul class="flex items-center space-x-6">
          <li><a href="#escolaridade" class="nav-link text-gray-400 hover:text-cyan-400 transition-colors text-sm tracking-wide">Formação</a></li>
          <li><a href="#experiencia" class="nav-link text-gray-400 hover:text-cyan-400 transition-colors text-sm tracking-wide">Experiência</a></li>
          <li><a href="#habilidades" class="nav-link text-gray-400 hover:text-cyan-400 transition-colors text-sm tracking-wide">Skills</a></li>
          <li><a href="#dev-match" class="nav-link text-gray-400 hover:text-cyan-400 transition-colors text-sm tracking-wide">Match</a></li>
          <li><a href="#certificacoes" class="nav-link text-gray-400 hover:text-cyan-400 transition-colors text-sm tracking-wide">Certificações</a></li>
          <li><a href="#contato" class="px-4 py-1.5 rounded-full border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 transition-all text-sm tracking-wide">Contato</a></li>
          @if (loggedIn()) {
            <li class="flex items-center gap-4">
              <span class="text-gray-700 select-none">|</span>
              <a routerLink="/admin" class="admin-dashboard-link nav-link text-cyan-400 hover:text-cyan-300 transition-colors text-sm tracking-wide">Dashboard</a>
              <button (click)="logout()" class="text-gray-400 hover:text-red-400 transition-colors text-sm tracking-wide cursor-pointer">Sair</button>
            </li>
          } @else {
            <li><a routerLink="/admin/login" class="text-gray-600 hover:text-gray-400 transition-colors" title="Admin"><svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg></a></li>
          }
          <li class="flex items-center">
            <om-theme-toggle
              animationStyle="circle"
              darkThemeClass="dark"
              lightThemeClass="light"
              themeTarget="html"
              [duration]="500">
              <ng-template omDarkIcon><svg xmlns="http://www.w3.org/2000/svg" class="header-theme-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg></ng-template>
              <ng-template omLightIcon><svg xmlns="http://www.w3.org/2000/svg" class="header-theme-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg></ng-template>
            </om-theme-toggle>
          </li>
        </ul>
      </div>
    </nav>

    <!-- Botão Hambúrguer: visível somente no mobile -->
    <button
      class="fixed top-4 right-4 z-70 md:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-gray-900/90 backdrop-blur-md border border-gray-800/50 text-cyan-400 transition-colors hover:text-cyan-300"
      (click)="toggleMenu()"
      aria-label="Abrir menu">
      @if (isOpen()) {
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      } @else {
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
      }
    </button>

    <!-- Overlay escuro -->
    <div
      class="fixed inset-0 bg-black/60 z-55 md:hidden transition-opacity duration-300"
      [class.opacity-0]="!isOpen()"
      [class.pointer-events-none]="!isOpen()"
      [class.opacity-100]="isOpen()"
      (click)="closeMenu()">
    </div>

    <!-- Drawer lateral esquerdo -->
    <aside
      class="fixed top-0 left-0 h-full w-64 bg-gray-900 border-r border-gray-800/50 z-60 transform transition-transform duration-300 ease-in-out md:hidden flex flex-col"
      [class.-translate-x-full]="!isOpen()"
      [class.translate-x-0]="isOpen()">

      <div class="p-5 border-b border-gray-800/50 flex items-center justify-between">
        <a href="#detalhes" class="text-cyan-400 font-bold text-lg tracking-widest font-mono" (click)="closeMenu()">&lt;EG /&gt;</a>
        <om-theme-toggle
          animationStyle="circle"
          darkThemeClass="dark"
          lightThemeClass="light"
          themeTarget="html"
          [duration]="500">
          <ng-template omDarkIcon><svg xmlns="http://www.w3.org/2000/svg" class="header-theme-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg></ng-template>
          <ng-template omLightIcon><svg xmlns="http://www.w3.org/2000/svg" class="header-theme-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg></ng-template>
        </om-theme-toggle>
      </div>

      <nav class="flex flex-col p-6 gap-5">
        <a href="#escolaridade" class="text-gray-300 hover:text-cyan-400 transition-colors text-sm tracking-wide py-1 border-b border-gray-800/30" (click)="closeMenu()">Formação</a>
        <a href="#experiencia" class="text-gray-300 hover:text-cyan-400 transition-colors text-sm tracking-wide py-1 border-b border-gray-800/30" (click)="closeMenu()">Experiência</a>
        <a href="#habilidades" class="text-gray-300 hover:text-cyan-400 transition-colors text-sm tracking-wide py-1 border-b border-gray-800/30" (click)="closeMenu()">Skills</a>
        <a href="#dev-match" class="text-gray-300 hover:text-cyan-400 transition-colors text-sm tracking-wide py-1 border-b border-gray-800/30" (click)="closeMenu()">Match</a>
        <a href="#certificacoes" class="text-gray-300 hover:text-cyan-400 transition-colors text-sm tracking-wide py-1 border-b border-gray-800/30" (click)="closeMenu()">Certificações</a>
        <a href="#contato" class="mt-2 px-4 py-2 rounded-full border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 transition-all text-sm tracking-wide text-center" (click)="closeMenu()">Contato</a>
        @if (loggedIn()) {
          <a routerLink="/admin" class="admin-dashboard-link text-cyan-400 hover:text-cyan-300 transition-colors text-sm flex items-center gap-1.5 mt-4 pt-4 border-t border-gray-800/30" (click)="closeMenu()">📊 Dashboard</a>
          <button (click)="logout(); closeMenu()" class="text-gray-400 hover:text-red-400 transition-colors text-sm text-left py-1 border-t border-gray-800/30">↩ Sair</button>
        } @else {
          <a routerLink="/admin/login" class="text-gray-600 hover:text-gray-400 transition-colors text-xs flex items-center gap-1.5 mt-4 pt-4 border-t border-gray-800/30" (click)="closeMenu()"><svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg> Admin</a>
        }
      </nav>
    </aside>
  `,
  styles: [`
    :host om-theme-toggle {
      cursor: pointer;
    }
  `]
})
export class HeaderComponent implements OnInit {
  private firebase = inject(FirebaseService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  isOpen = signal(false);
  loggedIn = signal(false);

  ngOnInit() {
    this.checkAuth();
  }

  private async checkAuth() {
    const logged = await this.firebase.isLoggedIn();
    this.loggedIn.set(logged);
    this.cdr.detectChanges();
  }

  async logout() {
    await this.firebase.logout();
    this.loggedIn.set(false);
    this.cdr.detectChanges();
    this.router.navigate(['/']);
  }

  toggleMenu() {
    this.isOpen.update(v => !v);
  }

  closeMenu() {
    this.isOpen.set(false);
  }
}
