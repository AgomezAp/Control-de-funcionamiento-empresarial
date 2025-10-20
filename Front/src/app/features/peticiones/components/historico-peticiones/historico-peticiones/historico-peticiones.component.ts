import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

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
    TimeAgoPipe,
    CurrencycopPipe,
    LoaderComponent,
  ],
  templateUrl: './historico-peticiones.component.html',
  styleUrls: ['./historico-peticiones.component.css'],
})
export class HistoricoPeticionesComponent implements OnInit {
  historico: PeticionHistorico[] = [];
  loading = false;

  // Paginación
  currentPage = 1;
  rowsPerPage = 15;
  totalPages = 1;
  paginatedData: PeticionHistorico[] = [];
  visiblePages: number[] = [];

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
          this.calculatePagination();
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar histórico:', error);
        this.loading = false;
      },
    });
  }

  // ============================================
  // PAGINACIÓN
  // ============================================
  calculatePagination(): void {
    this.totalPages = Math.ceil(this.historico.length / this.rowsPerPage);
    this.updatePaginatedData();
    this.updateVisiblePages();
  }

  updatePaginatedData(): void {
    const start = (this.currentPage - 1) * this.rowsPerPage;
    const end = start + this.rowsPerPage;
    this.paginatedData = this.historico.slice(start, end);
  }

  updateVisiblePages(): void {
    const pages: number[] = [];
    const maxVisible = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisible - 1);

    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    this.visiblePages = pages;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedData();
      this.updateVisiblePages();

      // Scroll al inicio de la tabla
      const tableWrapper = document.querySelector('.table-scroll');
      if (tableWrapper) {
        tableWrapper.scrollTop = 0;
      }
    }
  }

  // ============================================
  // NAVEGACIÓN
  // ============================================
  verDetalle(peticionId: number): void {
    this.router.navigate(['/peticiones', peticionId], {
      state: { fromHistorico: true },
    });
  }
}
