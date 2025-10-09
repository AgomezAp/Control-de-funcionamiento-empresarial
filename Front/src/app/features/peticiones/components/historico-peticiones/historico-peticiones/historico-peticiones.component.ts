import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';

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
    LoaderComponent
  ],
  template: `
    <div class="container p-4">
      <p-card>
        <ng-template pTemplate="header">
          <div class="flex align-items-center justify-content-between p-3">
            <h2 class="m-0"><i class="pi pi-history mr-2"></i>Histórico de Peticiones</h2>
          </div>
        </ng-template>

        <app-loader *ngIf="loading"></app-loader>

        <p-table
          *ngIf="!loading"
          [value]="historico"
          [paginator]="true"
          [rows]="15"
          [scrollable]="true"
          scrollHeight="600px"
          styleClass="p-datatable-sm"
        >
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="7">
                <app-empty-state
                  icon="pi-history"
                  title="Sin histórico"
                  message="No hay peticiones en el histórico"
                ></app-empty-state>
              </td>
            </tr>
          </ng-template>

          <ng-template pTemplate="header">
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th>Categoría</th>
              <th>Costo</th>
              <th>Estado Final</th>
              <th>Fecha Resolución</th>
              <th>Acciones</th>
            </tr>
          </ng-template>

          <ng-template pTemplate="body" let-peticion>
            <tr>
              <td><strong>#{{ peticion.id }}</strong></td>
              <td>{{ peticion.cliente?.nombre }}</td>
              <td>{{ peticion.categoria?.nombre }}</td>
              <td>{{ peticion.costo | currencyCop }}</td>
              <td>
                <p-tag
                  [value]="peticion.estado"
                  [severity]="peticion.estado === 'Resuelta' ? 'success' : 'danger'"
                ></p-tag>
              </td>
              <td>{{ peticion.fecha_resolucion | timeAgo }}</td>
              <td>
                <button
                  pButton
                  icon="pi pi-eye"
                  class="p-button-rounded p-button-text"
                  [routerLink]="['/peticiones', peticion.peticion_id_original || peticion.id]"
                ></button>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </p-card>
    </div>
  `,
  styles: [`
    .container {
      max-width: 1400px;
      margin: 0 auto;
    }
  `]
})
export class HistoricoPeticionesComponent implements OnInit {
  historico: PeticionHistorico[] = [];
  loading = false;

  constructor(private peticionService: PeticionService) {}

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
      }
    });
  }
}
