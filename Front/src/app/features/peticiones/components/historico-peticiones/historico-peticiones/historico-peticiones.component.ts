import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

// PrimeNG
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';

// Services
import { PeticionService } from '../../../../../core/services/peticion.service';

// Models
import { PeticionHistorico } from '../../../../../core/models/peticion-historico';

// Pipes
import { TimeAgoPipe } from '../../../../../shared/pipes/time-ago.pipe';
import { CurrencycopPipe } from '../../../../../shared/pipes/currency-cop.pipe';

// Components
import { EmptyStateComponent } from '../../../../../shared/components/empty-state/empty-state/empty-state.component';
import { LoaderComponent } from '../../../../../shared/components/loader/loader/loader.component';

@Component({
  selector: 'app-historico-peticiones',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TableModule,
    CardModule,
    ButtonModule,
    TagModule,
    TimeAgoPipe,
    CurrencycopPipe,
    EmptyStateComponent,
    LoaderComponent,
  ],
  templateUrl: './historico-peticiones.component.html',
  styleUrls: ['./historico-peticiones.component.css'],
})
export class HistoricoPeticionesComponent implements OnInit {
  historico: PeticionHistorico[] = [];
  loading = false;

  constructor(
    private peticionService: PeticionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadHistorico();
  }

  loadHistorico(): void {
    this.loading = true;
    this.peticionService.getHistorico().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.historico = response.data;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar histórico:', error);
        this.loading = false;
      },
    });
  }

  // ✅ Método para navegar al detalle con estado
  verDetalle(peticionId: number): void {
    this.router.navigate(['/peticiones', peticionId], {
      state: { fromHistorico: true }
    });
  }
}
