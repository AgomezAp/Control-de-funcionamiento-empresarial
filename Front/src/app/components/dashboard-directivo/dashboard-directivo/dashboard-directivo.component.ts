import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { CurrencycopPipe } from '../../../shared/pipes/currency-cop.pipe';
import { BadgeComponent } from '../../../shared/components/badge/badge/badge.component';
import { PeticionService } from '../../../core/services/peticion.service';
import { EstadisticaService } from '../../../core/services/estadistica.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-dashboard-directivo',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ChartModule,
    TableModule,
    CurrencycopPipe,
    BadgeComponent,
  ],
  templateUrl: './dashboard-directivo.component.html',
  styleUrl: './dashboard-directivo.component.css',
})
export class DashboardDirectivoComponent implements OnInit {
  areaUsuario: string = '';
  totalPeticionesArea: number = 0;
  peticionesPendientes: number = 0;
  peticionesEnProgreso: number = 0;
  costoTotalArea: number = 0;
  equipoStats: any[] = [];
  chartPeticiones: any;
  chartOptions: any;

  constructor(
    private peticionService: PeticionService,
    private estadisticaService: EstadisticaService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.areaUsuario = currentUser.area;
      this.loadDashboardData();
    }
  }

  loadDashboardData(): void {
    const fecha = new Date();

    // Cargar estadísticas del área (esto YA incluye peticiones resueltas correctamente)
    this.estadisticaService
      .getPorArea(this.areaUsuario, fecha.getFullYear(), fecha.getMonth() + 1)
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.equipoStats = response.data.map((stat) => ({
              usuario: stat.usuario?.nombre_completo,
              peticionesCreadas: stat.peticiones_creadas,
              peticionesResueltas: stat.peticiones_resueltas,
              tiempoPromedio: stat.tiempo_promedio_resolucion_horas,
              costoGenerado: stat.costo_total_generado,
            }));

            // Calcular totales
            this.costoTotalArea = response.data.reduce(
              (sum, stat) => sum + Number(stat.costo_total_generado),
              0
            );

            // Calcular total de peticiones creadas (suma de todos los usuarios)
            this.totalPeticionesArea = response.data.reduce(
              (sum, stat) => sum + stat.peticiones_creadas,
              0
            );

            this.setupChart(response.data);
          }
        },
      });

    // Cargar peticiones ACTIVAS del área para contar pendientes y en progreso
    this.peticionService.getAll({ area: this.areaUsuario }).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const peticiones = response.data;
          this.peticionesPendientes = peticiones.filter(
            (p) => p.estado === 'Pendiente'
          ).length;
          this.peticionesEnProgreso = peticiones.filter(
            (p) => p.estado === 'En Progreso'
          ).length;
        }
      },
    });
  }

  setupChart(data: any[]): void {
    const labels = data.map(
      (d) => d.usuario?.nombre_completo?.split(' ')[0] || 'Usuario'
    );
    const peticionesResueltas = data.map((d) => d.peticiones_resueltas);

    this.chartPeticiones = {
      labels: labels,
      datasets: [
        {
          label: 'Peticiones Resueltas',
          data: peticionesResueltas,
          backgroundColor: 'rgba(255, 193, 7, 0.6)',
          borderColor: 'rgb(255, 193, 7)',
          borderWidth: 2,
        },
      ],
    };

    this.chartOptions = {
      indexAxis: 'y',
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: {
            color: 'var(--text-secondary)',
          },
        },
        y: {
          ticks: {
            color: 'var(--text-secondary)',
          },
        },
      },
    };
  }

  // Método helper para convertir valores a número y formatear con decimales
  formatNumber(value: any, decimals: number = 2): string {
    const num = parseFloat(value) || 0;
    return num.toFixed(decimals);
  }
}
