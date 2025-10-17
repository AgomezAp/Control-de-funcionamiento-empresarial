import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { BadgeComponent } from '../../../shared/components/badge/badge/badge.component';
import { CurrencycopPipe } from '../../../shared/pipes/currency-cop.pipe';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { PeticionService } from '../../../core/services/peticion.service';
import { EstadisticaService } from '../../../core/services/estadistica.service';

interface AreaOption {
  label: string;
  value: string | null;
}

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ChartModule,
    ButtonModule,
    TableModule,
    DropdownModule,
    FormsModule,
    CurrencycopPipe,
  ],
  templateUrl: './dashboard-admin.component.html',
  styleUrl: './dashboard-admin.component.css',
})
export class DashboardAdminComponent implements OnInit {
  // Filtro por área
  areaSeleccionada: string | null = null;
  areasDisponibles: AreaOption[] = [
    { label: 'Todas las áreas', value: null },
    { label: 'Pautas', value: 'Pautas' },
    { label: 'Diseño', value: 'Diseño' },
    { label: 'Gestión Administrativa', value: 'Gestión Administrativa' },
  ];

  // Estadísticas generales
  totalPeticiones: number = 0;
  peticionesPendientes: number = 0;
  peticionesEnProgreso: number = 0;
  peticionesPausadas: number = 0;  // ✅ NUEVO: Peticiones pausadas
  peticionesResueltas: number = 0;
  costoTotalMes: number = 0;

  // Gráficas
  chartPeticionesPorEstado: any;
  chartTendenciaMensual: any;
  chartPeticionesPorArea: any;

  // Top diseñadores
  topDisenadores: any[] = [];

  // Peticiones vencidas
  peticionesVencidas: any[] = [];

 // Opciones de gráficas
  chartOptions: any;

  constructor(
    private peticionService: PeticionService,
    private estadisticaService: EstadisticaService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
    this.setupChartOptions();
  }

  onAreaChange(): void {
    console.log('📊 Área seleccionada:', this.areaSeleccionada);
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    const fecha = new Date();
    const año = fecha.getFullYear();
    const mes = fecha.getMonth() + 1;

    // Si se seleccionó un área específica, cargar estadísticas de esa área
    if (this.areaSeleccionada) {
      this.loadEstadisticasPorArea(this.areaSeleccionada, año, mes);
    } else {
      // Cargar resumen global (activas + históricas)
      this.loadResumenGlobal();
    }
  }

  loadResumenGlobal(): void {
    // Cargar resumen global (activas + históricas)
    this.peticionService.getResumenGlobal().subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          const resumen = response.data;
          
          // Usar el resumen que incluye AMBAS tablas
          this.totalPeticiones = resumen.total_peticiones;
          this.peticionesPendientes = resumen.por_estado.pendientes;
          this.peticionesEnProgreso = resumen.por_estado.en_progreso;
          this.peticionesPausadas = resumen.por_estado.pausadas || 0;  // ✅ NUEVO
          this.peticionesResueltas = resumen.por_estado.resueltas;

          // Setup chart con los datos correctos
          this.setupChartPeticionesPorEstadoFromResumen(resumen.por_estado);
        }
      }
    });

    // Cargar peticiones activas para detectar vencidas
    this.peticionService.getAll().subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.detectPeticionesVencidas(response.data);
        }
      }
    });

    // Cargar estadísticas globales del mes actual
    const fecha = new Date();
    this.estadisticaService.getGlobales(fecha.getFullYear(), fecha.getMonth() + 1).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.costoTotalMes = response.data.totales.total_costo_generado;
          this.setupChartPeticionesPorArea(response.data.por_area);
          this.setupTopDiseñadores(response.data.por_usuario);
        }
      }
    });
  }

  setupChartOptions(): void {
    this.chartOptions = {
      plugins: {
        legend: {
          labels: {
            color: 'var(--text-primary)'
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: 'var(--text-secondary)'
          },
          grid: {
            color: 'var(--border-color)'
          }
        },
        x: {
          ticks: {
            color: 'var(--text-secondary)'
          },
          grid: {
            color: 'var(--border-color)'
          }
        }
      }
    };
  }

  setupChartPeticionesPorEstado(peticiones: any[]): void {
    const pendientes = peticiones.filter(p => p.estado === 'Pendiente').length;
    const enProgreso = peticiones.filter(p => p.estado === 'En Progreso').length;
    const resueltas = peticiones.filter(p => p.estado === 'Resuelta').length;
    const canceladas = peticiones.filter(p => p.estado === 'Cancelada').length;

    this.chartPeticionesPorEstado = {
      labels: ['Pendiente', 'En Progreso', 'Resuelta', 'Cancelada'],
      datasets: [{
        data: [pendientes, enProgreso, resueltas, canceladas],
        backgroundColor: [
          'rgba(33, 150, 243, 0.8)',
          'rgba(76, 175, 80, 0.8)',
          'rgba(139, 195, 74, 0.8)',
          'rgba(244, 67, 54, 0.8)'
        ],
        borderColor: [
          'rgb(33, 150, 243)',
          'rgb(76, 175, 80)',
          'rgb(139, 195, 74)',
          'rgb(244, 67, 54)'
        ],
        borderWidth: 1
      }]
    };
  }

  setupChartPeticionesPorEstadoFromResumen(porEstado: any): void {
    this.chartPeticionesPorEstado = {
      labels: ['Pendiente', 'En Progreso', 'Resuelta', 'Cancelada'],
      datasets: [{
        data: [
          porEstado.pendientes,
          porEstado.en_progreso,
          porEstado.resueltas,
          porEstado.canceladas
        ],
        backgroundColor: [
          'rgba(33, 150, 243, 0.8)',
          'rgba(255, 193, 7, 0.8)',
          'rgba(76, 175, 80, 0.8)',
          'rgba(244, 67, 54, 0.8)'
        ],
        borderColor: [
          'rgb(33, 150, 243)',
          'rgb(255, 193, 7)',
          'rgb(76, 175, 80)',
          'rgb(244, 67, 54)'
        ],
        borderWidth: 1
      }]
    };
  }

  setupChartPeticionesPorArea(porArea: any[]): void {
    const areas = porArea.map(a => a.area);
    const peticionesCreadas = porArea.map(a => a.peticiones_creadas);
    const peticionesResueltas = porArea.map(a => a.peticiones_resueltas);

    this.chartPeticionesPorArea = {
      labels: areas,
      datasets: [
        {
          label: 'Creadas',
          data: peticionesCreadas,
          backgroundColor: 'rgba(255, 193, 7, 0.6)',
          borderColor: 'rgb(255, 193, 7)',
          borderWidth: 2
        },
        {
          label: 'Resueltas',
          data: peticionesResueltas,
          backgroundColor: 'rgba(76, 175, 80, 0.6)',
          borderColor: 'rgb(76, 175, 80)',
          borderWidth: 2
        }
      ]
    };
  }

  setupTopDiseñadores(porUsuario: any[]): void {
    this.topDisenadores = porUsuario
      .filter(u => u.peticiones_resueltas > 0)
      .sort((a, b) => b.peticiones_resueltas - a.peticiones_resueltas)
      .slice(0, 5)
      .map(u => ({
        nombre: u.usuario.nombre_completo,
        peticionesResueltas: u.peticiones_resueltas,
        costoGenerado: u.costo_total_generado,
        tiempoPromedio: u.tiempo_promedio_resolucion_horas
      }));
  }

  detectPeticionesVencidas(peticiones: any[]): void {
    const ahora = new Date();
    this.peticionesVencidas = peticiones.filter(p => {
      if (p.estado === 'En Progreso' && p.fecha_limite) {
        return new Date(p.fecha_limite) < ahora;
      }
      return false;
    });
  }

  loadEstadisticasPorArea(area: string, año: number, mes: number): void {
    console.log(`📊 Cargando estadísticas del área: ${area}`);
    
    // Cargar estadísticas del área seleccionada
    this.estadisticaService.getPorArea(area, año, mes).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const stats = response.data;

          // Calcular totales del área
          this.totalPeticiones = stats.reduce((sum, stat) => sum + stat.peticiones_creadas, 0);
          this.peticionesResueltas = stats.reduce((sum, stat) => sum + stat.peticiones_resueltas, 0);
          this.costoTotalMes = stats.reduce((sum, stat) => sum + Number(stat.costo_total_generado), 0);

          // Cargar estadísticas globales para obtener por_usuario
          this.estadisticaService.getGlobales(año, mes).subscribe({
            next: (globalResponse) => {
              if (globalResponse.success && globalResponse.data) {
                const porUsuario = globalResponse.data.por_usuario.filter(
                  (u: any) => u.area === area
                );
                
                // Top diseñadores del área
                this.setupTopDiseñadores(porUsuario);
              }
            }
          });

          console.log(`✅ Estadísticas del área ${area} cargadas:`, {
            totalPeticiones: this.totalPeticiones,
            peticionesResueltas: this.peticionesResueltas,
            costoTotalMes: this.costoTotalMes
          });
        }
      },
      error: (error) => {
        console.error('❌ Error al cargar estadísticas por área:', error);
      }
    });

    // Cargar peticiones activas del área
    this.peticionService.getAll({ area }).subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          const peticiones = response.data;
          this.peticionesPendientes = peticiones.filter((p: any) => p.estado === 'Pendiente').length;
          this.peticionesEnProgreso = peticiones.filter((p: any) => p.estado === 'En Progreso').length;
          this.peticionesPausadas = peticiones.filter((p: any) => p.estado === 'Pausada').length;  // ✅ NUEVO
          
          // Detectar peticiones vencidas
          this.detectPeticionesVencidas(peticiones);
        }
      }
    });
  }

  // Método helper para convertir valores a número y formatear con decimales
  formatNumber(value: any, decimals: number = 2): string {
    const num = parseFloat(value) || 0;
    return num.toFixed(decimals);
  }
}
