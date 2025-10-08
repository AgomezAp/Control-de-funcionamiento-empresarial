import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$: Observable<boolean> = this.loadingSubject.asObservable();

  private loadingCount = 0;

  // Mostrar loading
  show(): void {
    this.loadingCount++;
    this.loadingSubject.next(true);
  }

  // Ocultar loading
  hide(): void {
    this.loadingCount--;
    if (this.loadingCount <= 0) {
      this.loadingCount = 0;
      this.loadingSubject.next(false);
    }
  }

  // Forzar ocultar
  forceHide(): void {
    this.loadingCount = 0;
    this.loadingSubject.next(false);
  }

  // Verificar si está cargando
  isLoading(): boolean {
    return this.loadingSubject.value;
  }
}
