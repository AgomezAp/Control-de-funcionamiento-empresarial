import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ReporteClienteService } from '../../../../core/services/reporte-cliente.service';
import { ReporteCliente, FiltrosReporte, ESTADOS_REPORTE, PRIORIDADES, TIPOS_PROBLEMA } from '../../../../core/models/reporte-cliente.model';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-lista-reportes',
  standalone: false,
  templateUrl: './lista-reportes.component.html',
  styleUrls: ['./lista-reportes.component.css'],
  providers: [MessageService]
})
export class ListaReportesComponent implements OnInit {
  reportes: ReporteCliente[] = [];
  loading: boolean = false;
  
  // Filtros
  estadosReporte = ESTADOS_REPORTE;
  prioridades = PRIORIDADES;
  tiposProblema = TIPOS_PROBLEMA;
  
  filtros: FiltrosReporte = {};

  constructor(
    private reporteService: ReporteClienteService,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarReportes();
  }

  cargarReportes(): void {
    this.loading = true;
    this.reporteService.obtenerMisReportes().subscribe({
      next: (response) => {
        if (response.ok) {
          this.reportes = response.reportes;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar reportes:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los reportes'
        });
        this.loading = false;
      }
    });
  }

  aplicarFiltros(): void {
    this.loading = true;
    this.reporteService.obtenerReportes(this.filtros).subscribe({
      next: (response) => {
        if (response.ok) {
          this.reportes = response.reportes;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al filtrar reportes:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al aplicar filtros'
        });
        this.loading = false;
      }
    });
  }

  limpiarFiltros(): void {
    this.filtros = {};
    this.cargarReportes();
  }

  verDetalle(reporteId: number): void {
    this.router.navigate(['/reportes-clientes/detalle', reporteId]);
  }

  crearReporte(): void {
    this.router.navigate(['/reportes-clientes/crear']);
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

  formatearFecha(fecha: Date | string): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
