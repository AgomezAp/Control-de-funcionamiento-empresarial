import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ChartModule } from 'primeng/chart';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { FormsModule } from '@angular/forms';
import { EstadisticaService } from '../../../../core/services/estadistica.service';
import { AuthService } from '../../../../core/services/auth.service';
import { EstadisticaUsuario } from '../../../../core/models/estadistica.model';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-area-estadisticas',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    TableModule,
    ChartModule,
    DropdownModule,
    ButtonModule,
    TagModule,
    SkeletonModule,
    ToastModule,
    FormsModule
  ],
  providers: [MessageService],
  templateUrl: './area-estadisticas.component.html',
  styleUrl: './area-estadisticas.component.css'
})
export class AreaEstadisticasComponent implements OnInit {
  loading = false;
  estadisticas: EstadisticaUsuario[] = [];
  areaUsuario: string = '';
  esAdmin: boolean = false;

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
  chartData: any;
  chartOptions: any;

  // Resumen
  resumenArea = {
    totalCreadas: 0,
    totalResueltas: 0,
    totalCanceladas: 0,
    costoTotal: 0,
    promedioTiempo: 0
  };

  constructor(
    private estadisticaService: EstadisticaService,
    private authService: AuthService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.initChartOptions();
    this.initAnios();
    this.loadAreaUsuario();
  }

  loadAreaUsuario(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        // Verificar si es Admin
        this.esAdmin = user.rol === 'Admin';
        
        if (user.area) {
          this.areaUsuario = user.area;
          this.loadEstadisticas();
        }
      }
    });
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
    if (!this.areaUsuario && !this.esAdmin) return;

    this.loading = true;

    // Si es Admin, pasar null para obtener todas las áreas
    const area = this.esAdmin ? null : this.areaUsuario;

    this.estadisticaService
      .getPorArea(area as any, this.selectedAnio, this.selectedMes)
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.estadisticas = response.data;
            this.calcularResumen();
            this.updateChart();
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error cargando estadísticas:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al cargar las estadísticas del área'
          });
          this.loading = false;
        }
      });
  }

  calcularResumen(): void {
    this.resumenArea = {
      totalCreadas: 0,
      totalResueltas: 0,
      totalCanceladas: 0,
      costoTotal: 0,
      promedioTiempo: 0
    };

    let sumaPromedios = 0;
    let contadorPromedios = 0;

    this.estadisticas.forEach(est => {
      this.resumenArea.totalCreadas += est.peticiones_creadas;
      this.resumenArea.totalResueltas += est.peticiones_resueltas;
      this.resumenArea.totalCanceladas += est.peticiones_canceladas;
      this.resumenArea.costoTotal += est.costo_total_generado;

      if (est.tiempo_promedio_resolucion_horas) {
        sumaPromedios += est.tiempo_promedio_resolucion_horas;
        contadorPromedios++;
      }
    });

    if (contadorPromedios > 0) {
      this.resumenArea.promedioTiempo = sumaPromedios / contadorPromedios;
    }
  }

  updateChart(): void {
    const labels = this.estadisticas.map(e => e.usuario?.nombre_completo || `Usuario ${e.usuario_id}`);
    const creadas = this.estadisticas.map(e => e.peticiones_creadas);
    const resueltas = this.estadisticas.map(e => e.peticiones_resueltas);
    const canceladas = this.estadisticas.map(e => e.peticiones_canceladas);

    this.chartData = {
      labels,
      datasets: [
        {
          label: 'Creadas',
          data: creadas,
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        },
        {
          label: 'Resueltas',
          data: resueltas,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        },
        {
          label: 'Canceladas',
          data: canceladas,
          backgroundColor: 'rgba(255, 99, 132, 0.6)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1
        }
      ]
    };
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
}

