import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

// PrimeNG imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { CalendarModule } from 'primeng/calendar';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { BadgeModule } from 'primeng/badge';
import { CardModule } from 'primeng/card';
import { ToolbarModule } from 'primeng/toolbar';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';

// Services
import { PeticionService } from '../../../../../core/services/peticion.service';
import { AuthService } from '../../../../../core/services/auth.service';
import { ClienteService } from '../../../../../core/services/cliente.service';
import { WebsocketService } from '../../../../../core/services/websocket.service';

// Models
import {
  Peticion,
  EstadoPeticion,
} from '../../../../../core/models/peticion.model';
import { Cliente } from '../../../../../core/models/cliente.model';
import { UsuarioAuth } from '../../../../../core/models/auth.model';
import { RoleEnum } from '../../../../../core/models/role.model';

// Pipes - USANDO TODOS LOS PIPES CREADOS
import { TimeAgoPipe } from '../../../../../shared/pipes/time-ago.pipe';
import { CurrencycopPipe } from '../../../../../shared/pipes/currency-cop.pipe';
import { TruncatePipe } from '../../../../../shared/pipes/truncate.pipe';
import { HighlightPipe } from '../../../../../shared/pipes/highlight.pipe';
import { InitialsPipe } from '../../../../../shared/pipes/initials.pipe';

// Directives - USANDO TODAS LAS DIRECTIVAS CREADAS
import { TooltipDirective } from '../../../../../shared/directives/tooltip.directive';
import { HasRoleDirective } from '../../../../../shared/directives/has-role.directive';

// Shared Components
import { EmptyStateComponent } from '../../../../../shared/components/empty-state/empty-state/empty-state.component';
import { LoaderComponent } from '../../../../../shared/components/loader/loader/loader.component';
import { TimerComponent } from '../../../../../shared/components/timer/timer/timer.component';
import { ExportService, PeticionParaPDF } from '../../../../../core/services/export.service';

@Component({
  selector: 'app-lista-peticiones',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    // PrimeNG
    TableModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    MultiSelectModule,
    CalendarModule,
    TagModule,
    TooltipModule,
    BadgeModule,
    CardModule,
    ToolbarModule,
    DialogModule,
    ConfirmDialogModule,
    ToastModule,
    // Pipes
    TimeAgoPipe,
    CurrencycopPipe,
    TruncatePipe,
    HighlightPipe, // Usado en: cliente, categoría, descripción (tabla y cards)
    InitialsPipe,
    // Directives
    TooltipDirective, // Usado con [appTooltip] en: ID, avatar, área (tabla y cards)
    HasRoleDirective,
    // Components
    EmptyStateComponent,
    LoaderComponent,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './lista-peticiones.component.html',
  styleUrl: './lista-peticiones.component.css',
})
export class ListaPeticionesComponent implements OnInit, OnDestroy {
  // Data
  peticiones: Peticion[] = [];
  clientes: Cliente[] = [];
  currentUser: UsuarioAuth | null = null;

  // Loading states
  loading = false;
  loadingAccion = false;

  // Filtros
  searchTerm = '';
  filtroEstado: string[] = [];
  filtroCliente: number | null = null;
  filtroFechaInicio: Date | null = null;
  filtroFechaFin: Date | null = null;
  filtroRangoCosto: [number, number] = [0, 1000000];

  // Opciones para dropdowns
  estadosOptions = [
    { label: 'Pendiente', value: 'Pendiente' },
    { label: 'En Progreso', value: 'En Progreso' },
    { label: 'Pausada', value: 'Pausada' },
    { label: 'Resuelta', value: 'Resuelta' },
    { label: 'Cancelada', value: 'Cancelada' },
  ];

  // UI State
  mostrarFiltros = false;
  vistaActual: 'tabla' | 'cards' = 'tabla';
  selectedPeticiones: Peticion[] = [];

  // Roles
  RoleEnum = RoleEnum;

  // Subscriptions
  private destroy$ = new Subject<void>();
  private tiempoInterval: any;

  constructor(
    private peticionService: PeticionService,
    private authService: AuthService,
    private clienteService: ClienteService,
    private websocketService: WebsocketService,
    private exportService: ExportService,
    private route: ActivatedRoute,
    private router: Router,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();

    // Obtener estado desde la ruta (si viene de navegación)
    const estadoRuta = this.route.snapshot.data['estado'];
    if (estadoRuta) {
      this.filtroEstado = [estadoRuta];
    }

    this.loadClientes();
    this.loadPeticiones();
    this.setupWebSocketListeners();
    this.iniciarActualizacionTiempo();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    // Limpiar interval del tiempo
    if (this.tiempoInterval) {
      clearInterval(this.tiempoInterval);
    }

    // Desconectar WebSocket al destruir el componente
    // this.websocketService.disconnect();
  }

  /**
   * Actualiza el tiempo empleado cada segundo para peticiones con temporizador activo
   */
  iniciarActualizacionTiempo(): void {
    this.tiempoInterval = setInterval(() => {
      this.peticiones = this.peticiones.map(peticion => {
        if (peticion.temporizador_activo && peticion.fecha_inicio_temporizador) {
          const ahora = new Date();
          const inicio = new Date(peticion.fecha_inicio_temporizador);
          const tiempoTranscurrido = Math.floor((ahora.getTime() - inicio.getTime()) / 1000);
          
          return {
            ...peticion,
            tiempo_empleado_actual: peticion.tiempo_empleado_segundos + tiempoTranscurrido
          };
        }
        return peticion;
      });
    }, 1000); // Actualizar cada segundo
  }

  loadClientes(): void {
    this.clienteService
      .getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.clientes = response.data;
          }
        },
        error: (error) => {
          console.error('Error al cargar clientes:', error);
        },
      });
  }

  loadPeticiones(): void {
    this.loading = true;
    const filtros: any = {};

    if (this.filtroEstado.length > 0) {
      filtros.estado = this.filtroEstado[0]; // El backend solo acepta un estado
    }
    if (this.filtroCliente) {
      filtros.cliente_id = this.filtroCliente;
    }

    // FILTRO POR ÁREA: Los diseñadores solo ven peticiones de Diseño, 
    // los de Pautas solo ven de Pautas
    if (this.currentUser && (this.currentUser.area === 'Diseño' || this.currentUser.area === 'Pautas')) {
      filtros.area = this.currentUser.area;
    }

    this.peticionService
      .getAll(filtros)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.peticiones = response.data;
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al cargar peticiones:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar las peticiones',
          });
          this.loading = false;
        },
      });
  }

  setupWebSocketListeners(): void {
    // Conectar WebSocket
    this.websocketService.connect();

    // Escuchar nuevas peticiones
    this.websocketService
      .onNuevaPeticion()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (peticion: Peticion) => {
          console.log('📥 Nueva petición recibida:', peticion);

          // Agregar al inicio de la lista
          this.peticiones = [peticion, ...this.peticiones];

          // Mostrar notificación
          this.messageService.add({
            severity: 'info',
            summary: 'Nueva petición',
            detail: `Petición #${peticion.id} creada por ${peticion.creador?.nombre_completo}`,
            life: 5000,
          });
        },
      });

    // Escuchar cambios de estado
    this.websocketService
      .onCambioEstado()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          console.log('🔄 Cambio de estado:', data);

          const index = this.peticiones.findIndex(
            (p) => p.id === data.peticionId
          );
          if (index !== -1) {
            // Actualizar estado
            this.peticiones[index].estado = data.nuevoEstado;

            // Actualizar fecha de resolución si está resuelta o cancelada
            if (
              data.nuevoEstado === 'Resuelta' ||
              data.nuevoEstado === 'Cancelada'
            ) {
              this.peticiones[index].fecha_resolucion =
                data.fecha_resolucion || new Date();

              // Remover de la lista si estamos filtrando por otro estado
              if (
                this.filtroEstado.length > 0 &&
                !this.filtroEstado.includes(data.nuevoEstado)
              ) {
                this.peticiones.splice(index, 1);
              }
            }

            // Trigger change detection
            this.peticiones = [...this.peticiones];

            // Mostrar notificación
            this.messageService.add({
              severity: 'success',
              summary: 'Estado actualizado',
              detail: `Petición #${data.peticionId} cambió a ${data.nuevoEstado}`,
              life: 4000,
            });
          }
        },
      });

    // Escuchar cuando una petición es aceptada
    this.websocketService
      .onPeticionAceptada()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          console.log('✅ Petición aceptada:', data);

          const index = this.peticiones.findIndex(
            (p) => p.id === data.peticionId
          );
          if (index !== -1) {
            // Actualizar datos de aceptación
            this.peticiones[index].estado = EstadoPeticion.EN_PROGRESO;
            this.peticiones[index].asignado_a = data.usuarioId;
            this.peticiones[index].asignado = data.usuario;
            this.peticiones[index].fecha_aceptacion = data.fecha_aceptacion;
            this.peticiones[index].tiempo_empleado_segundos = data.tiempo_empleado_segundos || 0;
            this.peticiones[index].temporizador_activo = data.temporizador_activo || false;

            // Trigger change detection
            this.peticiones = [...this.peticiones];

            // Mostrar notificación
            this.messageService.add({
              severity: 'success',
              summary: 'Petición aceptada',
              detail: `${data.usuario?.nombre_completo} aceptó la petición #${data.peticionId}`,
              life: 5000,
            });
          }
        },
      });

    // Escuchar peticiones vencidas
    this.websocketService
      .onPeticionVencida()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          console.log('⚠️ Petición vencida:', data);

          const index = this.peticiones.findIndex(
            (p) => p.id === data.peticionId
          );
          if (index !== -1) {
            // Trigger change detection para actualizar el timer
            this.peticiones = [...this.peticiones];

            // Mostrar notificación de alerta
            this.messageService.add({
              severity: 'error',
              summary: 'Petición Vencida',
              detail: `La petición #${data.peticionId} ha excedido el tiempo límite`,
              sticky: true, // Mantener hasta que el usuario la cierre
            });
          }
        },
      });

    // Escuchar usuarios online/offline (opcional, para futuro)
    this.websocketService
      .onUsuarioOnline()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          console.log('👤 Usuario conectado:', data.usuario?.nombre_completo);
        },
      });

    this.websocketService
      .onUsuarioOffline()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          console.log(
            '👤 Usuario desconectado:',
            data.usuario?.nombre_completo
          );
        },
      });
  }
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
  // Navegación
  verDetalle(id: number): void {
    this.router.navigate(['/peticiones', id]);
  }

  crearNueva(): void {
    this.router.navigate(['/peticiones/crear-nueva']);
  }

  // Acciones
  aceptarPeticion(peticion: Peticion): void {
    this.router.navigate(['/peticiones', peticion.id, 'aceptar']);
  }

  cancelarPeticion(peticion: Peticion): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de cancelar la petición #${peticion.id}?`,
      header: 'Confirmar Cancelación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.loadingAccion = true;
        this.peticionService
          .changeStatus(peticion.id, { estado: 'Cancelada' as any })
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (response: any) => {
              if (response.success) {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Éxito',
                  detail: 'Petición cancelada correctamente',
                });
                this.loadPeticiones();
              }
              this.loadingAccion = false;
            },
            error: (error: any) => {
              console.error('Error al cancelar petición:', error);
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo cancelar la petición',
              });
              this.loadingAccion = false;
            },
          });
      },
    });
  }

  /**
   * Pausar temporizador de una petición
   */
  pausarTemporizador(peticion: Peticion): void {
    this.loadingAccion = true;
    this.peticionService
      .pausarTemporizador(peticion.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response.success) {
            this.messageService.add({
              severity: 'success',
              summary: 'Temporizador pausado',
              detail: 'El temporizador se ha pausado correctamente',
            });
            this.loadPeticiones();
          }
          this.loadingAccion = false;
        },
        error: (error: any) => {
          console.error('Error al pausar temporizador:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.message || 'No se pudo pausar el temporizador',
          });
          this.loadingAccion = false;
        },
      });
  }

  /**
   * Reanudar temporizador de una petición
   */
  reanudarTemporizador(peticion: Peticion): void {
    this.loadingAccion = true;
    this.peticionService
      .reanudarTemporizador(peticion.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response.success) {
            this.messageService.add({
              severity: 'success',
              summary: 'Temporizador reanudado',
              detail: 'El temporizador se ha reanudado correctamente',
            });
            this.loadPeticiones();
          }
          this.loadingAccion = false;
        },
        error: (error: any) => {
          console.error('Error al reanudar temporizador:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.message || 'No se pudo reanudar el temporizador',
          });
          this.loadingAccion = false;
        },
      });
  }

  /**
   * Verifica si el usuario puede pausar/reanudar una petición
   * Solo el asignado, Admin, Directivo o Líder pueden hacerlo
   */
  canPauseOrResume(peticion: Peticion): boolean {
    if (!this.currentUser) return false;
    
    const esAsignado = peticion.asignado_a === this.currentUser.uid;
    const tienePemisoEspecial = ['Admin', 'Directivo', 'Líder'].includes(this.currentUser.rol);
    
    return esAsignado || tienePemisoEspecial;
  }

  // Filtros
  aplicarFiltros(): void {
    this.loadPeticiones();
    this.mostrarFiltros = false;
  }

  limpiarFiltros(): void {
    this.searchTerm = '';
    this.filtroEstado = [];
    this.filtroCliente = null;
    this.filtroFechaInicio = null;
    this.filtroFechaFin = null;
    this.filtroRangoCosto = [0, 1000000];
    this.loadPeticiones();
  }

  // Utilidades
  get peticionesFiltradas(): Peticion[] {
    if (!this.searchTerm) {
      return this.peticiones;
    }

    const term = this.searchTerm.toLowerCase();
    return this.peticiones.filter(
      (p) =>
        p.id.toString().includes(term) ||
        p.descripcion?.toLowerCase().includes(term) ||
        p.cliente?.nombre?.toLowerCase().includes(term) ||
        p.categoria?.nombre?.toLowerCase().includes(term)
    );
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

  canAcceptPeticion(peticion: Peticion): boolean {
    if (!this.currentUser) return false;

    // La petición debe estar pendiente y no asignada
    if (peticion.estado !== 'Pendiente' || peticion.asignado_a) {
      return false;
    }

    // REGLA DE NEGOCIO: Las peticiones de Diseño solo las pueden aceptar Diseñadores
    if (peticion.area === 'Diseño') {
      return this.currentUser.area === 'Diseño';
    }

    // Las peticiones de Pautas solo las pueden aceptar usuarios del área de Pautas
    if (peticion.area === 'Pautas') {
      return this.currentUser.area === 'Pautas';
    }

    return false;
  }

  canCancelPeticion(peticion: Peticion): boolean {
    if (!this.currentUser) return false;

    // Admin, Directivo y Líder pueden cancelar
    // El creador puede cancelar su propia petición si está pendiente
    const rolesPermitidos = [
      RoleEnum.ADMIN,
      RoleEnum.DIRECTIVO,
      RoleEnum.LIDER,
    ];
    return (
      rolesPermitidos.includes(this.currentUser.rol) ||
      (peticion.creador_id === this.currentUser.uid &&
        peticion.estado === 'Pendiente')
    );
  }

  cambiarVista(vista: 'tabla' | 'cards'): void {
    this.vistaActual = vista;
  }

  // ============================================
  // EXPORTACIÓN E IMPRESIÓN
  // ============================================

  /**
   * Exporta la lista completa de peticiones filtradas a PDF
   */
  exportarPDF(): void {
    const peticionesFiltradas = this.peticionesFiltradas;
    
    if (peticionesFiltradas.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Sin datos',
        detail: 'No hay peticiones para exportar',
      });
      return;
    }

    try {
      const peticionesParaPDF: PeticionParaPDF[] = peticionesFiltradas.map(p => ({
        id: p.id,
        cliente: p.cliente?.nombre || 'Sin cliente',
        categoria: p.categoria?.nombre || 'Sin categoría',
        descripcion: p.descripcion,
        descripcion_extra: p.descripcion_extra || undefined,
        costo: p.costo,
        estado: p.estado,
        fecha_creacion: new Date(p.fecha_creacion).toLocaleString('es-CO'),
        creador: p.creador?.nombre_completo || 'Desconocido',
        asignado: p.asignado?.nombre_completo,
        tiempo_empleado: this.formatearTiempo(p.tiempo_empleado_segundos || 0),
      }));

      this.exportService.exportarListaPeticionesAPDF(peticionesParaPDF, 'Lista de Peticiones');
      
      this.messageService.add({
        severity: 'success',
        summary: 'PDF Generado',
        detail: `Se exportaron ${peticionesFiltradas.length} peticiones`,
      });
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo generar el PDF',
      });
    }
  }

  /**
   * Exporta una petición individual a PDF
   */
  exportarPeticionPDF(peticion: Peticion): void {
    try {
      const peticionParaPDF: PeticionParaPDF = {
        id: peticion.id,
        cliente: peticion.cliente?.nombre || 'Sin cliente',
        categoria: peticion.categoria?.nombre || 'Sin categoría',
        descripcion: peticion.descripcion,
        descripcion_extra: peticion.descripcion_extra || undefined,
        costo: peticion.costo,
        estado: peticion.estado,
        fecha_creacion: new Date(peticion.fecha_creacion).toLocaleString('es-CO'),
        creador: peticion.creador?.nombre_completo || 'Desconocido',
        asignado: peticion.asignado?.nombre_completo,
        tiempo_empleado: this.formatearTiempo(peticion.tiempo_empleado_segundos || 0),
      };

      this.exportService.exportarPeticionAPDF(peticionParaPDF);
      
      this.messageService.add({
        severity: 'success',
        summary: 'PDF Generado',
        detail: `Petición #${peticion.id} exportada correctamente`,
      });
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo generar el PDF',
      });
    }
  }

  /**
   * Imprime la lista completa de peticiones filtradas
   */
  imprimirLista(): void {
    const peticionesFiltradas = this.peticionesFiltradas;
    
    if (peticionesFiltradas.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Sin datos',
        detail: 'No hay peticiones para imprimir',
      });
      return;
    }

    try {
      const peticionesParaImprimir: PeticionParaPDF[] = peticionesFiltradas.map(p => ({
        id: p.id,
        cliente: p.cliente?.nombre || 'Sin cliente',
        categoria: p.categoria?.nombre || 'Sin categoría',
        descripcion: p.descripcion,
        descripcion_extra: p.descripcion_extra || undefined,
        costo: p.costo,
        estado: p.estado,
        fecha_creacion: new Date(p.fecha_creacion).toLocaleString('es-CO'),
        creador: p.creador?.nombre_completo || 'Desconocido',
        asignado: p.asignado?.nombre_completo,
        tiempo_empleado: this.formatearTiempo(p.tiempo_empleado_segundos || 0),
      }));

      this.exportService.imprimirListaPeticiones(peticionesParaImprimir, 'Lista de Peticiones');
    } catch (error) {
      console.error('Error al imprimir:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo imprimir la lista',
      });
    }
  }

  /**
   * Imprime una petición individual
   */
  imprimirPeticion(peticion: Peticion): void {
    try {
      const peticionParaImprimir: PeticionParaPDF = {
        id: peticion.id,
        cliente: peticion.cliente?.nombre || 'Sin cliente',
        categoria: peticion.categoria?.nombre || 'Sin categoría',
        descripcion: peticion.descripcion,
        descripcion_extra: peticion.descripcion_extra || undefined,
        costo: peticion.costo,
        estado: peticion.estado,
        fecha_creacion: new Date(peticion.fecha_creacion).toLocaleString('es-CO'),
        creador: peticion.creador?.nombre_completo || 'Desconocido',
        asignado: peticion.asignado?.nombre_completo,
        tiempo_empleado: this.formatearTiempo(peticion.tiempo_empleado_segundos || 0),
      };

      this.exportService.imprimirPeticion(peticionParaImprimir);
    } catch (error) {
      console.error('Error al imprimir:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo imprimir la petición',
      });
    }
  }

  formatearTiempo(segundos: number): string {
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    const segs = segundos % 60;
    return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
  }

  exportarExcel(): void {
    // TODO: Implementar exportación a Excel
    this.messageService.add({
      severity: 'info',
      summary: 'Exportar',
      detail: 'Funcionalidad en desarrollo',
    });
  }
}
