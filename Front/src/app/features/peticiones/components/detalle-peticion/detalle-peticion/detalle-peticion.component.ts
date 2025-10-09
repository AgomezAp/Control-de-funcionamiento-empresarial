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

// Models
import { Peticion, EstadoPeticion } from '../../../../../core/models/peticion.model';

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
    TimerComponent
  ],
  providers: [MessageService],
  template: `
    <div class="container p-4">
      <app-loader *ngIf="loading"></app-loader>

      <div *ngIf="!loading && peticion" class="peticion-detalle">
        <!-- Header -->
        <div class="flex align-items-center justify-content-between mb-4">
          <div class="flex align-items-center gap-3">
            <button
              pButton
              icon="pi pi-arrow-left"
              class="p-button-text"
              label="Volver"
              (click)="volver()"
            ></button>
            <h1 class="m-0">Petición #{{ peticion.id }}</h1>
            <p-tag
              [value]="peticion.estado"
              [severity]="getSeverity(peticion.estado)"
            ></p-tag>
          </div>

          <div class="flex gap-2">
            <button
              *ngIf="peticion.estado === 'Pendiente'"
              pButton
              label="Aceptar"
              icon="pi pi-check"
              class="p-button-success"
              [routerLink]="['/peticiones', peticion.id, 'aceptar']"
            ></button>
            <button
              *ngIf="peticion.estado === 'En Progreso'"
              pButton
              label="Marcar Resuelta"
              icon="pi pi-check-circle"
              class="p-button-success"
              (click)="marcarResuelta()"
            ></button>
          </div>
        </div>

        <!-- Timer si está en progreso -->
        <app-timer
          *ngIf="peticion.estado === 'En Progreso' && peticion.fecha_limite"
          [fechaLimite]="peticion.fecha_limite"
          class="mb-4 block"
        ></app-timer>

        <div class="grid">
          <!-- Información Principal -->
          <div class="col-12 lg:col-8">
            <p-card styleClass="mb-4">
              <ng-template pTemplate="header">
                <div class="p-3">
                  <h3 class="m-0"><i class="pi pi-info-circle mr-2"></i>Información General</h3>
                </div>
              </ng-template>

              <div class="flex flex-column gap-3">
                <div class="grid">
                  <div class="col-6">
                    <label class="text-muted">Cliente</label>
                    <p class="font-semibold text-lg">{{ peticion.cliente?.nombre }}</p>
                  </div>
                  <div class="col-6">
                    <label class="text-muted">País</label>
                    <p class="font-semibold text-lg">{{ peticion.cliente?.pais }}</p>
                  </div>
                </div>

                <p-divider></p-divider>

                <div class="grid">
                  <div class="col-6">
                    <label class="text-muted">Categoría</label>
                    <p class="font-semibold">{{ peticion.categoria?.nombre }}</p>
                    <p-tag [value]="peticion.categoria?.area_tipo" severity="info"></p-tag>
                  </div>
                  <div class="col-6">
                    <label class="text-muted">Costo</label>
                    <p class="font-bold text-primary text-2xl">{{ peticion.costo | currencyCop }}</p>
                  </div>
                </div>

                <p-divider></p-divider>

                <div>
                  <label class="text-muted">Descripción</label>
                  <p class="white-space-pre-wrap">{{ peticion.descripcion }}</p>
                </div>

                <div *ngIf="peticion.descripcion_extra">
                  <label class="text-muted">Descripción Extra</label>
                  <p class="white-space-pre-wrap">{{ peticion.descripcion_extra }}</p>
                </div>
              </div>
            </p-card>
          </div>

          <!-- Panel Lateral -->
          <div class="col-12 lg:col-4">
            <!-- Información de Seguimiento -->
            <p-card styleClass="mb-4">
              <ng-template pTemplate="header">
                <div class="p-3">
                  <h3 class="m-0"><i class="pi pi-clock mr-2"></i>Seguimiento</h3>
                </div>
              </ng-template>

              <div class="flex flex-column gap-3">
                <div>
                  <label class="text-muted">Creado por</label>
                  <p class="font-semibold">{{ peticion.creador?.nombre_completo }}</p>
                  <small class="text-muted">{{ peticion.fecha_creacion | timeAgo }}</small>
                </div>

                <p-divider *ngIf="peticion.asignado_a"></p-divider>

                <div *ngIf="peticion.asignado_a">
                  <label class="text-muted">Asignado a</label>
                  <p class="font-semibold">{{ peticion.asignado?.nombre_completo }}</p>
                  <small class="text-muted">{{ peticion.fecha_aceptacion | timeAgo }}</small>
                </div>

                <p-divider *ngIf="peticion.fecha_limite"></p-divider>

                <div *ngIf="peticion.fecha_limite">
                  <label class="text-muted">Fecha Límite</label>
                  <p class="font-semibold">{{ peticion.fecha_limite | date:'dd/MM/yyyy HH:mm' }}</p>
                  <small class="text-muted">{{ peticion.tiempo_limite_horas }} horas</small>
                </div>

                <p-divider *ngIf="peticion.fecha_resolucion"></p-divider>

                <div *ngIf="peticion.fecha_resolucion">
                  <label class="text-muted">Fecha Resolución</label>
                  <p class="font-semibold">{{ peticion.fecha_resolucion | date:'dd/MM/yyyy HH:mm' }}</p>
                  <small class="text-muted">{{ peticion.fecha_resolucion | timeAgo }}</small>
                </div>
              </div>
            </p-card>
          </div>
        </div>
      </div>

      <div *ngIf="!loading && !peticion" class="text-center p-5">
        <i class="pi pi-exclamation-triangle text-6xl text-muted mb-3"></i>
        <h3>Petición no encontrada</h3>
        <button
          pButton
          label="Volver a Peticiones"
          icon="pi pi-arrow-left"
          class="p-button-outlined"
          [routerLink]="['/peticiones']"
        ></button>
      </div>

      <p-toast></p-toast>
    </div>
  `,
  styles: [`
    .container {
      max-width: 1400px;
      margin: 0 auto;
    }
    .text-muted {
      color: #6c757d;
      font-size: 0.875rem;
      font-weight: 500;
      display: block;
      margin-bottom: 0.25rem;
    }
  `]
})
export class DetallePeticionComponent implements OnInit, OnDestroy {
  peticion: Peticion | null = null;
  loading = false;
  peticionId: number = 0;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private peticionService: PeticionService,
    private websocketService: WebsocketService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
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
    
    // Salir de la sala de la petición
    if (this.peticionId) {
      this.websocketService.leaveRoom(`peticion_${this.peticionId}`);
    }
  }

  setupWebSocketListeners(): void {
    // Unirse a la sala de esta petición específica
    this.websocketService.joinRoom(`peticion_${this.peticionId}`);

    // Escuchar cambios de estado
    this.websocketService.onCambioEstado()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          if (data.peticionId === this.peticionId && this.peticion) {
            console.log('🔄 Estado actualizado en tiempo real:', data);
            
            this.peticion.estado = data.nuevoEstado;
            
            if (data.nuevoEstado === 'Resuelta' || data.nuevoEstado === 'Cancelada') {
              this.peticion.fecha_resolucion = data.fecha_resolucion || new Date();
            }
            
            this.messageService.add({
              severity: 'success',
              summary: 'Estado Actualizado',
              detail: `La petición cambió a ${data.nuevoEstado}`,
              life: 4000
            });
          }
        }
      });

    // Escuchar cuando la petición es aceptada
    this.websocketService.onPeticionAceptada()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          if (data.peticionId === this.peticionId && this.peticion) {
            console.log('✅ Petición aceptada en tiempo real:', data);
            
            this.peticion.estado = EstadoPeticion.EN_PROGRESO;
            this.peticion.asignado_a = data.usuarioId;
            this.peticion.asignado = data.usuario;
            this.peticion.fecha_aceptacion = data.fecha_aceptacion;
            this.peticion.fecha_limite = data.fecha_limite;
            this.peticion.tiempo_limite_horas = data.tiempo_limite_horas;
            
            this.messageService.add({
              severity: 'success',
              summary: 'Petición Aceptada',
              detail: `${data.usuario?.nombre_completo} aceptó esta petición`,
              life: 5000
            });
          }
        }
      });

    // Escuchar si la petición vence
    this.websocketService.onPeticionVencida()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          if (data.peticionId === this.peticionId) {
            console.log('⚠️ Petición vencida en tiempo real');
            
            this.messageService.add({
              severity: 'error',
              summary: 'Petición Vencida',
              detail: 'Esta petición ha excedido el tiempo límite',
              sticky: true
            });
          }
        }
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
      }
    });
  }

  getSeverity(estado: string): 'success' | 'secondary' | 'info' | 'warning' | 'danger' {
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
            life: 3000
          });
        }
      },
      error: (error) => {
        console.error('Error al marcar como resuelta:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo marcar la petición como resuelta',
          life: 3000
        });
      }
    });
  }

  volver(): void {
    this.router.navigate(['/peticiones']);
  }
}
