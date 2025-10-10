import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { BadgeComponent } from '../../../shared/components/badge/badge/badge.component';
import { TimerComponent } from '../../../shared/components/timer/timer/timer.component';
import { TimeAgoPipe } from '../../../shared/pipes/time-ago.pipe';
import { CurrencycopPipe } from '../../../shared/pipes/currency-cop.pipe';
import { TagModule } from 'primeng/tag';
import { PeticionService } from '../../../core/services/peticion.service';
import { EstadisticaService } from '../../../core/services/estadistica.service';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state/empty-state.component';
import { EstadoPeticion } from '../../../core/models/peticion.model';
@Component({
  selector: 'app-dashboard-usuario',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    TableModule,
    TagModule,
    BadgeComponent,
    TimerComponent,
    TimeAgoPipe,
    CurrencycopPipe,
    EmptyStateComponent,
  ],
  templateUrl: './dashboard-usuario.component.html',
  styleUrl: './dashboard-usuario.component.css',
})
export class DashboardUsuarioComponent implements OnInit {
  misEstadisticas: any = null;
  peticionesAsignadas: any[] = [];
  peticionesPendientes: any[] = [];

  constructor(
    private peticionService: PeticionService,
    private estadisticaService: EstadisticaService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    const fecha = new Date();

    // Cargar mis estadísticas
    this.estadisticaService
      .getMisEstadisticas(fecha.getFullYear(), fecha.getMonth() + 1)
      .subscribe({
        next: (response: any) => {
          if (response.success && response.data && response.data.length > 0) {
            this.misEstadisticas = response.data[0];
          }
        },
      });

    // Cargar peticiones asignadas (En Progreso)
    this.peticionService.getAll({ estado: EstadoPeticion.EN_PROGRESO }).subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.peticionesAsignadas = response.data;
        }
      },
    });

    // Cargar peticiones pendientes disponibles
    const currentUser = this.authService.getCurrentUser();
    if (currentUser && ['Pautas', 'Diseño'].includes(currentUser.area)) {
      this.peticionService.getPendientes(currentUser.area).subscribe({
        next: (response: any) => {
          if (response.success && response.data) {
            this.peticionesPendientes = response.data;
          }
        },
      });
    }
  }

  verPeticion(id: number): void {
    this.router.navigate(['/peticiones', id]);
  }

  aceptarPeticion(id: number): void {
    this.router.navigate(['/peticiones', id, 'aceptar']);
  }
}
