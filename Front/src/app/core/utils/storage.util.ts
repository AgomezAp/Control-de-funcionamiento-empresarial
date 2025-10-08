import { STORAGE_KEYS } from '../constants/storage.constants';

export class StorageUtil {
  // Guardar en localStorage
  static setItem(key: string, value: any): void {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  // Obtener de localStorage
  static getItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  }

  // Eliminar de localStorage
  static removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }

  // Limpiar todo el localStorage
  static clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }

  // Token
  static setToken(token: string): void {
    this.setItem(STORAGE_KEYS.TOKEN, token);
  }

  static getToken(): string | null {
    return this.getItem<string>(STORAGE_KEYS.TOKEN);
  }

  static removeToken(): void {
    this.removeItem(STORAGE_KEYS.TOKEN);
  }

  // Usuario
  static setUser(user: any): void {
    this.setItem(STORAGE_KEYS.USER, user);
  }

  static getUser<T>(): T | null {
    return this.getItem<T>(STORAGE_KEYS.USER);
  }

  static removeUser(): void {
    this.removeItem(STORAGE_KEYS.USER);
  }

  // Tema
  static setTheme(theme: string): void {
    this.setItem(STORAGE_KEYS.THEME, theme);
  }

  static getTheme(): string | null {
    return this.getItem<string>(STORAGE_KEYS.THEME);
  }
}