import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

// PrimeNG
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { TimelineModule } from 'primeng/timeline';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

// Services
import { PeticionService } from '../../../../../core/services/peticion.service';
import { WebsocketService } from '../../../../../core/services/websocket.service';
import { AuthService } from '../../../../../core/services/auth.service';

// Models
import {
  Peticion,
  EstadoPeticion,
} from '../../../../../core/models/peticion.model';

// Pipes
import { TimeAgoPipe } from '../../../../../shared/pipes/time-ago.pipe';
import { CurrencycopPipe } from '../../../../../shared/pipes/currency-cop.pipe';

// Components
import { LoaderComponent } from '../../../../../shared/components/loader/loader/loader.component';
import { TimerComponent } from '../../../../../shared/components/timer/timer/timer.component';

@Component({
  selector: 'app-detalle-peticion',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    ButtonModule,
    TagModule,
    DividerModule,
    TimelineModule,
    ToastModule,
    TimeAgoPipe,
    CurrencycopPipe,
    LoaderComponent,
  ],
  providers: [MessageService],
  templateUrl: './detalle-peticion.component.html',
  styleUrls: ['./detalle-peticion.component.css'],
})
export class DetallePeticionComponent implements OnInit, OnDestroy {
  peticion: Peticion | null = null;
  loading = false;
  peticionId: number = 0;
  currentUser: any = null;
  private destroy$ = new Subject<void>();
  // ✅ Variable para saber si vino del histórico
  private fromHistorico = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private peticionService: PeticionService,
    private websocketService: WebsocketService,
    private messageService: MessageService,
    private authService: AuthService
  ) {
    this.currentUser = this.authService.getCurrentUser();
    
    // ✅ Detectar si vino del histórico mediante el estado de navegación
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      this.fromHistorico = navigation.extras.state['fromHistorico'] === true;
    }
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.peticionId = +params['id'];
      if (this.peticionId) {
        this.loadPeticion();
        this.setupWebSocketListeners();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    if (this.peticionId) {
      this.websocketService.leaveRoom(`peticion_${this.peticionId}`);
    }
  }

  setupWebSocketListeners(): void {
    this.websocketService.joinRoom(`peticion_${this.peticionId}`);

    this.websocketService
      .onCambioEstado()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          if (data.peticionId === this.peticionId && this.peticion) {
            console.log('🔄 Estado actualizado en tiempo real:', data);

            this.peticion.estado = data.nuevoEstado;

            if (
              data.nuevoEstado === 'Resuelta' ||
              data.nuevoEstado === 'Cancelada'
            ) {
              this.peticion.fecha_resolucion =
                data.fecha_resolucion || new Date();
            }

            this.messageService.add({
              severity: 'success',
              summary: 'Estado Actualizado',
              detail: `La petición cambió a ${data.nuevoEstado}`,
              life: 4000,
            });
          }
        },
      });

    this.websocketService
      .onPeticionAceptada()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          if (data.peticionId === this.peticionId && this.peticion) {
            console.log('✅ Petición aceptada en tiempo real:', data);

            this.peticion.estado = EstadoPeticion.EN_PROGRESO;
            this.peticion.asignado_a = data.usuarioId;
            this.peticion.asignado = data.usuario;
            this.peticion.fecha_aceptacion = data.fecha_aceptacion;
            this.peticion.tiempo_empleado_segundos = data.tiempo_empleado_segundos || 0;
            this.peticion.temporizador_activo = data.temporizador_activo || false;
            this.peticion.fecha_inicio_temporizador = data.fecha_inicio_temporizador;

            this.messageService.add({
              severity: 'success',
              summary: 'Petición Aceptada',
              detail: `${data.usuario?.nombre_completo} aceptó esta petición`,
              life: 5000,
            });
          }
        },
      });

    this.websocketService
      .onPeticionVencida()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          if (data.peticionId === this.peticionId) {
            console.log('⚠️ Petición vencida en tiempo real');

            this.messageService.add({
              severity: 'error',
              summary: 'Petición Vencida',
              detail: 'Esta petición ha excedido el tiempo límite',
              sticky: true,
            });
          }
        },
      });
  }

  loadPeticion(): void {
    this.loading = true;
    this.peticionService.getById(this.peticionId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.peticion = response.data;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar petición:', error);
        this.loading = false;
      },
    });
  }

  getSeverity(
    estado: string
  ): 'success' | 'secondary' | 'info' | 'warning' | 'danger' {
    switch (estado) {
      case 'Pendiente':
        return 'info';
      case 'En Progreso':
        return 'warning';
      case 'Resuelta':
        return 'success';
      case 'Cancelada':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  // ⭐ AGREGAR ESTE MÉTODO AQUÍ ⭐
  getStatusIcon(estado: string): string {
    switch (estado) {
      case 'Pendiente':
        return 'pi-clock';
      case 'En Progreso':
        return 'pi-spin pi-spinner';
      case 'Resuelta':
        return 'pi-check-circle';
      case 'Cancelada':
        return 'pi-times-circle';
      default:
        return 'pi-circle';
    }
  }

  marcarResuelta(): void {
    if (!this.peticion) return;

    this.peticionService.markAsResolved(this.peticion.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadPeticion();
          this.messageService.add({
            severity: 'success',
            summary: 'Petición Resuelta',
            detail: 'La petición ha sido marcada como resuelta',
            life: 3000,
          });
        }
      },
      error: (error) => {
        console.error('Error al marcar como resuelta:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo marcar la petición como resuelta',
          life: 3000,
        });
      },
    });
  }

  pausarTemporizador(): void {
    if (!this.peticion) return;

    this.peticionService.pausarTemporizador(this.peticion.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadPeticion();
          this.messageService.add({
            severity: 'info',
            summary: 'Temporizador Pausado',
            detail: 'El temporizador de la petición ha sido pausado',
            life: 3000,
          });
        }
      },
      error: (error) => {
        console.error('Error al pausar temporizador:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo pausar el temporizador',
          life: 3000,
        });
      },
    });
  }

  reanudarTemporizador(): void {
    if (!this.peticion) return;

    this.peticionService.reanudarTemporizador(this.peticion.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadPeticion();
          this.messageService.add({
            severity: 'success',
            summary: 'Temporizador Reanudado',
            detail: 'El temporizador de la petición ha sido reanudado',
            life: 3000,
          });
        }
      },
      error: (error) => {
        console.error('Error al reanudar temporizador:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo reanudar el temporizador',
          life: 3000,
        });
      },
    });
  }

  /**
   * Verifica si el usuario puede pausar/reanudar la petición
   */
  canPauseOrResume(): boolean {
    if (!this.peticion || !this.currentUser) {
      console.log('⚠️ canPauseOrResume - Sin petición o usuario:', {
        peticion: !!this.peticion,
        currentUser: !!this.currentUser
      });
      return false;
    }
    
    const esAsignado = this.peticion.asignado_a === this.currentUser.uid;
    const tienePemisoEspecial = ['Admin', 'Directivo', 'Líder'].includes(this.currentUser.rol);
    
    console.log('🔍 canPauseOrResume - Verificación:', {
      peticionId: this.peticion.id,
      asignado_a: this.peticion.asignado_a,
      currentUserUid: this.currentUser.uid,
      currentUserRol: this.currentUser.rol,
      esAsignado,
      tienePemisoEspecial,
      resultado: esAsignado || tienePemisoEspecial
    });
    
    return esAsignado || tienePemisoEspecial;
  }

  formatearTiempo(segundos: number): string {
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    const segs = segundos % 60;
    return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
  }

  volver(): void {
    // ✅ Volver al histórico si vino de ahí, sino a peticiones activas
    if (this.fromHistorico) {
      this.router.navigate(['/peticiones/historico']);
    } else {
      this.router.navigate(['/peticiones']);
    }
  }
}
