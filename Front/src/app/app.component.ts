import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { WebsocketService } from './core/services/websocket.service';
import { AuthService } from './core/services/auth.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    ToastModule, 
    ConfirmDialogModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Front';
  private destroy$ = new Subject<void>();

  constructor(
    private websocketService: WebsocketService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Conectar WebSocket cuando el usuario esté autenticado
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        if (user) {
          console.log('👤 Usuario autenticado, conectando WebSocket...');
          this.websocketService.connect();
        } else {
          console.log('👤 Usuario no autenticado, desconectando WebSocket...');
          this.websocketService.disconnect();
        }
      });

    // Escuchar estado de conexión
    this.websocketService.onConnected()
      .pipe(takeUntil(this.destroy$))
      .subscribe(connected => {
        if (connected) {
          console.log('✅ WebSocket conectado correctamente');
        } else {
          console.log('❌ WebSocket desconectado');
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.websocketService.disconnect();
  }
}
