import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EstadisticaService } from '../../../../core/services/estadistica.service';
import { AuthService } from '../../../../core/services/auth.service';
import { EstadisticaUsuario } from '../../../../core/models/estadistica.model';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

// Registrar Chart.js
Chart.register(...registerables);

@Component({
  selector: 'app-area-estadisticas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './area-estadisticas.component.html',
  styleUrl: './area-estadisticas.component.css',
})
export class AreaEstadisticasComponent implements OnInit, AfterViewInit {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;

  // ============================================
  // TOAST PROPERTIES
  // ============================================
  showToast = false;
  toastType: 'success' | 'error' | 'info' = 'info';
  toastMessage = '';

  // ============================================
  // DATA PROPERTIES
  // ============================================
  loading = false;
  estadisticas: EstadisticaUsuario[] = [];
  areaUsuario: string = '';
  esAdmin: boolean = false;

  // ✅ Lista de áreas disponibles para el selector
  areasDisponibles = [
    { label: 'Gestión Administrativa', value: 'Gestión Administrativa' },
    { label: 'Pautas', value: 'Pautas' },
    { label: 'Diseño', value: 'Diseño' },
    { label: 'Contabilidad', value: 'Contabilidad' },
    { label: 'Programación', value: 'Programación' },
  ];

  // ✅ Área seleccionada en el dropdown (para Admin/Directivo)
  areaSeleccionada: string = '';

  // ============================================
  // FILTERS
  // ============================================
  anios: { label: string; value: number }[] = [];
  meses = [
    { label: 'Todos', value: 0 },
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
    { label: 'Diciembre', value: 12 },
  ];

  selectedAnio: number = new Date().getFullYear();
  selectedMes: number = new Date().getMonth() + 1;

  // ============================================
  // CHART PROPERTIES
  // ============================================
  chart: Chart | null = null;
  chartData: any;
  chartOptions: any;

  // ============================================
  // SUMMARY
  // ============================================
  resumenArea = {
    totalCreadas: 0,
    totalResueltas: 0,
    totalCanceladas: 0,
    costoTotal: 0,
    promedioTiempo: 0,
  };

  // ============================================
  // SORTING PROPERTIES
  // ============================================
  sortField = '';
  sortOrder: 'asc' | 'desc' = 'asc';

  // ============================================
  // PAGINATION PROPERTIES
  // ============================================
  currentPage = 1;
  rowsPerPage = 10;
  totalPages = 1;
  startIndex = 0;
  endIndex = 10;
  paginatedData: EstadisticaUsuario[] = [];

  constructor(
    private estadisticaService: EstadisticaService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.initChartOptions();
    this.initAnios();
    this.loadAreaUsuario();
  }

  ngAfterViewInit(): void {
    // El gráfico se inicializará después de cargar los datos
  }

  loadAreaUsuario(): void {
    this.authService.currentUser$.subscribe((user) => {
      if (user) {
        // Verificar si es Admin o Directivo
        this.esAdmin = user.rol === 'Admin' || user.rol === 'Directivo';

        if (user.area) {
          this.areaUsuario = user.area;

          // ✅ Si es Admin/Directivo, puede seleccionar área, sino usar la suya
          if (this.esAdmin) {
            this.areaSeleccionada = this.areasDisponibles[0].value; // Primera área por defecto
          } else {
            this.areaSeleccionada = this.areaUsuario;
          }

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
          position: 'top',
          labels: {
            font: {
              size: 14,
              weight: 'bold',
            },
          },
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleFont: {
            size: 14,
            weight: 'bold',
          },
          bodyFont: {
            size: 13,
          },
          padding: 12,
          cornerRadius: 8,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
            font: {
              size: 12,
            },
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.1)',
          },
        },
        x: {
          ticks: {
            font: {
              size: 11,
            },
            maxRotation: 45,
            minRotation: 45,
          },
          grid: {
            display: false,
          },
        },
      },
    };
  }

  loadEstadisticas(): void {
    // ✅ Validar que haya un área seleccionada
    if (!this.areaSeleccionada) {
      console.warn('No hay área seleccionada');
      return;
    }

    this.loading = true;

    this.estadisticaService
      .getPorArea(this.areaSeleccionada, this.selectedAnio, this.selectedMes)
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.estadisticas = response.data;
            this.calcularResumen();
            this.updatePagination();
            this.updateChart();
            this.showToastMessage(
              'Estadísticas cargadas exitosamente',
              'success'
            );
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error cargando estadísticas:', error);
          this.showToastMessage(
            'Error al cargar las estadísticas del área',
            'error'
          );
          this.loading = false;
        },
      });
  }

  calcularResumen(): void {
    this.resumenArea = {
      totalCreadas: 0,
      totalResueltas: 0,
      totalCanceladas: 0,
      costoTotal: 0,
      promedioTiempo: 0,
    };

    let sumaPromedios = 0;
    let contadorPromedios = 0;

    this.estadisticas.forEach((est) => {
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
    if (!this.chartCanvas) {
      setTimeout(() => this.updateChart(), 100);
      return;
    }

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    // Destruir gráfico anterior si existe
    if (this.chart) {
      this.chart.destroy();
    }

    const labels = this.estadisticas.map(
      (e) => e.usuario?.nombre_completo || `Usuario ${e.usuario_id}`
    );
    const creadas = this.estadisticas.map((e) => e.peticiones_creadas);
    const resueltas = this.estadisticas.map((e) => e.peticiones_resueltas);
    const canceladas = this.estadisticas.map((e) => e.peticiones_canceladas);

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Creadas',
            data: creadas,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            borderColor: 'rgba(0, 0, 0, 1)',
            borderWidth: 2,
          },
          {
            label: 'Resueltas',
            data: resueltas,
            backgroundColor: 'rgba(46, 125, 50, 0.7)',
            borderColor: 'rgba(46, 125, 50, 1)',
            borderWidth: 2,
          },
          {
            label: 'Canceladas',
            data: canceladas,
            backgroundColor: 'rgba(198, 40, 40, 0.7)',
            borderColor: 'rgba(198, 40, 40, 1)',
            borderWidth: 2,
          },
        ],
      },
      options: this.chartOptions,
    };

    this.chart = new Chart(ctx, config);
  }

  // ============================================
  // SORTING METHODS
  // ============================================
  sortBy(field: string): void {
    if (this.sortField === field) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortOrder = 'asc';
    }

    this.estadisticas.sort((a: any, b: any) => {
      let valueA = this.getNestedProperty(a, field);
      let valueB = this.getNestedProperty(b, field);

      if (typeof valueA === 'string') valueA = valueA.toLowerCase();
      if (typeof valueB === 'string') valueB = valueB.toLowerCase();

      if (valueA < valueB) return this.sortOrder === 'asc' ? -1 : 1;
      if (valueA > valueB) return this.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    this.updatePagination();
  }

  getNestedProperty(obj: any, path: string): any {
    return path.split('.').reduce((prev, curr) => prev?.[curr], obj);
  }

  // ============================================
  // PAGINATION METHODS
  // ============================================
  updatePagination(): void {
    this.totalPages = Math.ceil(this.estadisticas.length / this.rowsPerPage);

    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    }

    if (this.currentPage < 1) {
      this.currentPage = 1;
    }

    this.startIndex = (this.currentPage - 1) * this.rowsPerPage;
    this.endIndex = Math.min(
      this.startIndex + this.rowsPerPage,
      this.estadisticas.length
    );

    this.paginatedData = this.estadisticas.slice(
      this.startIndex,
      this.endIndex
    );
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.updatePagination();
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(
      1,
      this.currentPage - Math.floor(maxPagesToShow / 2)
    );
    let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  onRowsPerPageChange(): void {
    this.currentPage = 1;
    this.updatePagination();
  }

  // ============================================
  // FILTER METHODS
  // ============================================
  onFiltroChange(): void {
    this.currentPage = 1;
    this.loadEstadisticas();
  }

  // ✅ Nuevo método para cuando cambia el área seleccionada
  onAreaChange(): void {
    this.currentPage = 1;
    this.loadEstadisticas();
  }

  // ============================================
  // UTILITY METHODS
  // ============================================
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

  getBadgeClass(porcentaje: number): string {
    if (porcentaje >= 75) return 'badge-high';
    if (porcentaje >= 50) return 'badge-medium';
    return 'badge-low';
  }

  // ============================================
  // TOAST METHODS
  // ============================================
  showToastMessage(
    message: string,
    type: 'success' | 'error' | 'info' = 'info'
  ): void {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;

    setTimeout(() => {
      this.showToast = false;
    }, 4000);
  }

  // ============================================
  // CLEANUP
  // ============================================
  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }
}
