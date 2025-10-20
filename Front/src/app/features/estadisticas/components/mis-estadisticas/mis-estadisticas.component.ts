import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageModule } from 'primeng/message';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { EstadisticaService } from '../../../../core/services/estadistica.service';
import { EstadisticaUsuario } from '../../../../core/models/estadistica.model';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-mis-estadisticas',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ChartModule,
    SkeletonModule,
    MessageModule,
    DropdownModule,
    ButtonModule,
    FormsModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './mis-estadisticas.component.html',
  styleUrl: './mis-estadisticas.component.css'
})
export class MisEstadisticasComponent implements OnInit {
  loading = false;
  estadisticas: EstadisticaUsuario[] = [];
  estadisticaActual?: EstadisticaUsuario;

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
  chartDataPeticiones: any;
  chartDataEstados: any;
  chartOptions: any;

  constructor(
    private estadisticaService: EstadisticaService,
    private messageService: MessageService,
    private authService: AuthService
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
      }
    };
  }

  loadEstadisticas(): void {
    this.loading = true;

    this.estadisticaService
      .getMisEstadisticas(this.selectedAnio, this.selectedMes)
      .subscribe({
        next: (response) => {
          console.log('📊 Respuesta de estadísticas:', response);
          if (response.success && response.data) {
            this.estadisticas = response.data;
            console.log('📈 Estadísticas recibidas:', this.estadisticas);
            this.estadisticaActual = this.estadisticas.find(
              (e) => e.año === this.selectedAnio && e.mes === this.selectedMes
            );
            console.log('📌 Estadística actual:', this.estadisticaActual);
            this.updateCharts();
          } else {
            console.warn('⚠️ No hay datos en la respuesta');
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('❌ Error cargando estadísticas:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al cargar las estadísticas'
          });
          this.loading = false;
        }
      });
  }

  updateCharts(): void {
    if (!this.estadisticaActual) return;

    const total = this.estadisticaActual.peticiones_creadas;
    const resueltas = this.estadisticaActual.peticiones_resueltas;
    const canceladas = this.estadisticaActual.peticiones_canceladas;
    
    // ✅ Usar los campos actuales del backend en lugar de calcular incorrectamente
    const pendientes = this.estadisticaActual.peticiones_pendientes_actual || 0;
    const enProgreso = this.estadisticaActual.peticiones_en_progreso_actual || 0;
    const pausadas = this.estadisticaActual.peticiones_pausadas_actual || 0;

    // Gráfico de peticiones por tipo
    this.chartDataPeticiones = {
      labels: ['Total Creadas', 'Resueltas', 'En Progreso', 'Pendientes', 'Pausadas', 'Canceladas'],
      datasets: [
        {
          label: 'Peticiones',
          data: [total, resueltas, enProgreso, pendientes, pausadas, canceladas],
          backgroundColor: [
            'rgba(54, 162, 235, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(33, 150, 243, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(255, 152, 0, 0.6)',
            'rgba(255, 99, 132, 0.6)'
          ],
          borderColor: [
            'rgba(54, 162, 235, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(33, 150, 243, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(255, 152, 0, 1)',
            'rgba(255, 99, 132, 1)'
          ],
          borderWidth: 1
        }
      ]
    };

    // Gráfico de estados
    this.chartDataEstados = {
      labels: ['Resueltas', 'Pendientes/Canceladas'],
      datasets: [
        {
          data: [resueltas, pendientes + canceladas],
          backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 159, 64, 0.6)'],
          hoverBackgroundColor: ['rgba(75, 192, 192, 0.8)', 'rgba(255, 159, 64, 0.8)']
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

  getSeverityClass(tipo: string): string {
    switch (tipo) {
      case 'total':
        return 'bg-blue-100 text-blue-900';
      case 'resueltas':
        return 'bg-green-100 text-green-900';
      case 'pendientes':
        return 'bg-yellow-100 text-yellow-900';
      case 'vencidas':
        return 'bg-red-100 text-red-900';
      default:
        return 'bg-gray-100 text-gray-900';
    }
  }

  // Método para verificar si el usuario puede ver costos
  puedeVerCostos(): boolean {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return false;
    
    const rolesConAcceso = ['Admin', 'Directivo'];
    return rolesConAcceso.includes(currentUser.rol);
  }
}
