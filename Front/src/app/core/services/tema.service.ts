import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { StorageUtil } from '../utils/storage.util';
import { THEME_OPTIONS } from '../constants/storage.constants';

@Injectable({
  providedIn: 'root'
})
export class TemaService {
  private isDarkModeSubject: BehaviorSubject<boolean>;
  public isDarkMode$: Observable<boolean>;

  constructor() {
    const savedTheme = StorageUtil.getTheme();
    const isDark = savedTheme === THEME_OPTIONS.DARK || 
                   (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    this.isDarkModeSubject = new BehaviorSubject<boolean>(isDark);
    this.isDarkMode$ = this.isDarkModeSubject.asObservable();
    
    this.applyTheme(isDark);
  }

  // Alternar tema
  toggleTheme(): void {
    const newTheme = !this.isDarkModeSubject.value;
    this.setTheme(newTheme);
  }

  // Establecer tema
  setTheme(isDark: boolean): void {
    this.isDarkModeSubject.next(isDark);
    this.applyTheme(isDark);
    StorageUtil.setTheme(isDark ? THEME_OPTIONS.DARK : THEME_OPTIONS.LIGHT);
  }

  // Aplicar tema al documento
  private applyTheme(isDark: boolean): void {
    const body = document.body;
    
    if (isDark) {
      body.classList.add('dark-mode');
      this.loadPrimeNGTheme('lara-dark-amber');
    } else {
      body.classList.remove('dark-mode');
      this.loadPrimeNGTheme('lara-light-amber');
    }
  }

  // Cargar tema de PrimeNG dinámicamente
  private loadPrimeNGTheme(theme: string): void {
    const themeLink = document.getElementById('app-theme') as HTMLLinkElement;
    
    if (themeLink) {
      themeLink.href = `node_modules/primeng/resources/themes/${theme}/theme.css`;
    } else {
      const head = document.getElementsByTagName('head')[0];
      const link = document.createElement('link');
      link.id = 'app-theme';
      link.rel = 'stylesheet';
      link.href = `node_modules/primeng/resources/themes/${theme}/theme.css`;
      head.appendChild(link);
    }
  }

  // Obtener estado actual
  isDarkMode(): boolean {
    return this.isDarkModeSubject.value;
  }
}
