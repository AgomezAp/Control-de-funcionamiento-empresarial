import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReporteClienteService } from '../../../../core/services/reporte-cliente.service';
import { ReporteCliente, EstadoReporte, ESTADOS_REPORTE } from '../../../../core/models/reporte-cliente.model';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-detalle-reporte',
  standalone: false,
  templateUrl: './detalle-reporte.component.html',
  styleUrls: ['./detalle-reporte.component.css'],
  providers: [MessageService, ConfirmationService]
})
export class DetalleReporteComponent implements OnInit {
  reporte: ReporteCliente | null = null;
  loading: boolean = false;
  reporteId: number = 0;
  
  estadosDisponibles = ESTADOS_REPORTE;
  nuevoEstado: EstadoReporte | null = null;
  notasEstado: string = '';
  mostrarDialogoEstado: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private reporteService: ReporteClienteService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.reporteId = +params['id'];
      if (this.reporteId) {
        this.cargarReporte();
      }
    });
  }

  cargarReporte(): void {
    this.loading = true;
    this.reporteService.obtenerReportePorId(this.reporteId).subscribe({
      next: (response) => {
        if (response.ok) {
          this.reporte = response.reporte;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar reporte:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar el reporte'
        });
        this.loading = false;
      }
    });
  }

  asignarmeReporte(): void {
    this.confirmationService.confirm({
      message: '¿Deseas asignarte este reporte?',
      header: 'Confirmar Asignación',
      icon: 'pi pi-question-circle',
      accept: () => {
        this.reporteService.asignarTecnico(this.reporteId).subscribe({
          next: (response) => {
            if (response.ok) {
              this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Reporte asignado correctamente'
              });
              this.cargarReporte();
            }
          },
          error: (error) => {
            console.error('Error al asignar reporte:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.error?.msg || 'No se pudo asignar el reporte'
            });
          }
        });
      }
    });
  }

  abrirDialogoEstado(): void {
    this.nuevoEstado = null;
    this.notasEstado = '';
    this.mostrarDialogoEstado = true;
  }

  actualizarEstado(): void {
    if (!this.nuevoEstado) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Selecciona un estado'
      });
      return;
    }

    this.reporteService.actualizarEstado(this.reporteId, {
      estado: this.nuevoEstado,
      notas: this.notasEstado
    }).subscribe({
      next: (response) => {
        if (response.ok) {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Estado actualizado correctamente'
          });
          this.mostrarDialogoEstado = false;
          this.cargarReporte();
        }
      },
      error: (error) => {
        console.error('Error al actualizar estado:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.msg || 'No se pudo actualizar el estado'
        });
      }
    });
  }

  volver(): void {
    this.router.navigate(['/reportes-clientes/lista']);
  }

  getPrioridadColor(prioridad: string): string {
    return this.reporteService.getPrioridadColor(prioridad);
  }

  getEstadoColor(estado: string): string {
    return this.reporteService.getEstadoColor(estado);
  }

  getTipoProblemaIcon(tipo: string): string {
    return this.reporteService.getTipoProblemaIcon(tipo);
  }

  formatearFecha(fecha: Date | string | undefined): string {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  calcularTiempoRespuesta(): string {
    if (!this.reporte || !this.reporte.fecha_atencion) return 'N/A';
    
    const creacion = new Date(this.reporte.fecha_creacion);
    const atencion = new Date(this.reporte.fecha_atencion);
    const diferencia = atencion.getTime() - creacion.getTime();
    const horas = Math.floor(diferencia / (1000 * 60 * 60));
    const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${horas}h ${minutos}m`;
  }

  calcularTiempoResolucion(): string {
    if (!this.reporte || !this.reporte.fecha_resolucion) return 'N/A';
    
    const creacion = new Date(this.reporte.fecha_creacion);
    const resolucion = new Date(this.reporte.fecha_resolucion);
    const diferencia = resolucion.getTime() - creacion.getTime();
    const horas = Math.floor(diferencia / (1000 * 60 * 60));
    const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${horas}h ${minutos}m`;
  }
}
