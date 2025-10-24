import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ReporteClienteService } from '../../../../core/services/reporte-cliente.service';
import { EstadisticasReporte, ReporteCliente } from '../../../../core/models/reporte-cliente.model';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-dashboard-reportes',
  standalone: false,
  templateUrl: './dashboard-reportes.component.html',
  styleUrls: ['./dashboard-reportes.component.css'],
  providers: [MessageService]
})
export class DashboardReportesComponent implements OnInit {
  estadisticas: EstadisticasReporte | null = null;
  reportesRecientes: ReporteCliente[] = [];
  loading: boolean = false;
  chartData: any;
  chartOptions: any;

  constructor(
    private reporteService: ReporteClienteService,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarEstadisticas();
    this.cargarReportesRecientes();
    this.configurarGrafica();
  }

  cargarEstadisticas(): void {
    this.loading = true;
    this.reporteService.obtenerEstadisticas().subscribe({
      next: (response) => {
        if (response.ok) {
          this.estadisticas = response.estadisticas;
          this.actualizarGrafica();
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar estadísticas:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las estadísticas'
        });
        this.loading = false;
      }
    });
  }

  cargarReportesRecientes(): void {
    this.reporteService.obtenerMisReportes().subscribe({
      next: (response) => {
        if (response.ok) {
          // Tomar solo los 5 más recientes
          this.reportesRecientes = response.reportes.slice(0, 5);
        }
      },
      error: (error) => {
        console.error('Error al cargar reportes recientes:', error);
      }
    });
  }

  configurarGrafica(): void {
    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'bottom'
        }
      }
    };
  }

  actualizarGrafica(): void {
    if (!this.estadisticas) return;

    const labels = this.estadisticas.porPrioridad.map(p => p.prioridad);
    const data = this.estadisticas.porPrioridad.map(p => p.cantidad);

    this.chartData = {
      labels: labels,
      datasets: [
        {
          label: 'Reportes por Prioridad',
          data: data,
          backgroundColor: [
            '#22C55E', // Baja - Verde
            '#3B82F6', // Media - Azul
            '#F59E0B', // Alta - Amarillo
            '#EF4444'  // Urgente - Rojo
          ]
        }
      ]
    };
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

  verReporte(reporteId: number): void {
    this.router.navigate(['/reportes-clientes/detalle', reporteId]);
  }

  crearReporte(): void {
    this.router.navigate(['/reportes-clientes/crear']);
  }

  verTodosReportes(): void {
    this.router.navigate(['/reportes-clientes/lista']);
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
