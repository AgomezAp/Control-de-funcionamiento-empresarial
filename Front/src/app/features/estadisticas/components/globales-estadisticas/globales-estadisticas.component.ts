import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { FormsModule } from '@angular/forms';
import { EstadisticaService } from '../../../../core/services/estadistica.service';
import { EstadisticaGlobal, EstadisticaPorArea } from '../../../../core/models/estadistica.model';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-globales-estadisticas',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ChartModule,
    TableModule,
    TagModule,
    DropdownModule,
    ButtonModule,
    SkeletonModule,
    ToastModule,
    FormsModule
  ],
  providers: [MessageService],
  templateUrl: './globales-estadisticas.component.html',
  styleUrl: './globales-estadisticas.component.css'
})
export class GlobalesEstadisticasComponent implements OnInit {
  loading = false;
  estadisticasGlobales?: EstadisticaGlobal;

  // Filtros
  anios: { label: string; value: number }[] = [];
  meses = [
    { label: 'Enero', value: 1 },
    { label: 'Febrero', value: 2 },
    { label: 'Marzo', value: 3 },
    { label: 'Abril', value: 4 },
    { label: 'Mayo', value: 5 },
    { label: 'Junio', value: 6 },
    { label: 'Julio', value: 7 },
    { label: 'Agosto', value: 8 },
    { label: 'Septiembre', value: 9 },
    { label: 'Octubre', value: 10 },
    { label: 'Noviembre', value: 11 },
    { label: 'Diciembre', value: 12 }
  ];

  selectedAnio: number = new Date().getFullYear();
  selectedMes: number = new Date().getMonth() + 1;

  // Gráficos
  chartDataAreas: any;
  chartDataUsuarios: any;
  chartOptions: any;

  constructor(
    private estadisticaService: EstadisticaService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.initChartOptions();
    this.initAnios();
    this.loadEstadisticas();
  }

  initAnios(): void {
    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i >= currentYear - 5; i--) {
      this.anios.push({ label: i.toString(), value: i });
    }
  }

  initChartOptions(): void {
    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    };
  }

  loadEstadisticas(): void {
    this.loading = true;

    this.estadisticaService
      .getGlobales(this.selectedAnio, this.selectedMes)
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.estadisticasGlobales = response.data;
            this.updateCharts();
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error cargando estadísticas globales:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al cargar las estadísticas globales'
          });
          this.loading = false;
        }
      });
  }

  updateCharts(): void {
    if (!this.estadisticasGlobales) return;

    // Gráfico por áreas
    if (this.estadisticasGlobales.por_area && this.estadisticasGlobales.por_area.length > 0) {
      const areas = this.estadisticasGlobales.por_area;
      
      this.chartDataAreas = {
        labels: areas.map(a => a.area),
        datasets: [
          {
            label: 'Peticiones Creadas',
            data: areas.map(a => a.peticiones_creadas),
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          },
          {
            label: 'Peticiones Resueltas',
            data: areas.map(a => a.peticiones_resueltas),
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          }
        ]
      };
    }

    // Gráfico top usuarios
    if (this.estadisticasGlobales.por_usuario && this.estadisticasGlobales.por_usuario.length > 0) {
      const topUsuarios = this.estadisticasGlobales.por_usuario.slice(0, 10);
      
      this.chartDataUsuarios = {
        labels: topUsuarios.map(u => u.usuario?.nombre_completo || `Usuario ${u.usuario_id}`),
        datasets: [
          {
            label: 'Peticiones Resueltas',
            data: topUsuarios.map(u => u.peticiones_resueltas),
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          }
        ]
      };
    }
  }

  onFiltroChange(): void {
    this.loadEstadisticas();
  }

  calcularPorcentaje(valor: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((valor / total) * 100);
  }

  getSeverity(porcentaje: number): string {
    if (porcentaje >= 80) return 'success';
    if (porcentaje >= 60) return 'info';
    if (porcentaje >= 40) return 'warning';
    return 'danger';
  }

  getAreaSeverity(area: EstadisticaPorArea): string {
    const efectividad = parseFloat(area.efectividad?.toString() || '0');
    return this.getSeverity(efectividad);
  }
}

