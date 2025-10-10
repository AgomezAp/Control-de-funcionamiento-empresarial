import { Component, OnInit } from '@angular/core';
import { NotificacionService } from '../../../../core/services/notificacion.service';
import { Router } from '@angular/router';
import { Notificacion } from '../../../../core/models/notificacion.model';
import { Observable } from 'rxjs';
import { TimeAgoPipe } from '../../../pipes/time-ago.pipe';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { TooltipModule } from 'primeng/tooltip';
import { EmptyStateComponent } from '../../../components/empty-state/empty-state/empty-state.component';

@Component({
  selector: 'app-notification-center',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    BadgeModule,
    ScrollPanelModule,
    TooltipModule,
    TimeAgoPipe,
    EmptyStateComponent
  ],
  templateUrl: './notification-center.component.html',
  styleUrl: './notification-center.component.css'
})
export class NotificationCenterComponent implements OnInit {
  notificaciones$: Observable<Notificacion[]>;
  unreadCount$: Observable<number>;

  constructor(
    private notificacionService: NotificacionService,
    private router: Router
  ) {
    this.notificaciones$ = this.notificacionService.notificaciones$;
    this.unreadCount$ = this.notificacionService.unreadCount$;
  }

  ngOnInit(): void {}

  markAsRead(notificacion: Notificacion): void {
    this.notificacionService.markAsRead(notificacion.id);
    
    if (notificacion.peticion_id) {
      this.router.navigate(['/peticiones', notificacion.peticion_id]);
    }
  }

  markAllAsRead(): void {
    this.notificacionService.markAllAsRead();
  }

  deleteNotification(notificacion: Notificacion, event: Event): void {
    event.stopPropagation();
    this.notificacionService.delete(notificacion.id);
  }

  clearAll(): void {
    this.notificacionService.clear();
  }

  getIcon(tipo: string): string {
    const icons: { [key: string]: string } = {
      'NUEVA_PETICION': 'pi pi-file-plus',
      'PETICION_ACEPTADA': 'pi pi-check',
      'PETICION_RESUELTA': 'pi pi-check-circle',
      'PETICION_VENCIDA': 'pi pi-exclamation-triangle',
      'NUEVO_COMENTARIO': 'pi pi-comment',
      'CAMBIO_ESTADO': 'pi pi-sync',
      'ASIGNACION': 'pi pi-user-plus'
    };
    return icons[tipo] || 'pi pi-bell';
  }
}
