import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

// PrimeNG (solo para modales)
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';

// Services
import { ClienteService } from '../../../../core/services/cliente.service';
import { AuthService } from '../../../../core/services/auth.service';

// Models
import { Cliente } from '../../../../core/models/cliente.model';
import { RoleEnum } from '../../../../core/models/role.model';

// Directives
import { HasRoleDirective } from '../../../../shared/directives/has-role.directive';

// Components
import { LoaderComponent } from '../../../../shared/components/loader/loader/loader.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state/empty-state.component';

@Component({
  selector: 'app-lista-clientes',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ToastModule,
    ConfirmDialogModule,
    TooltipModule,
    HasRoleDirective,
    LoaderComponent,
    EmptyStateComponent,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './lista-clientes.component.html',
  styleUrls: ['./lista-clientes.component.css'],
})
export class ListaClientesComponent implements OnInit {
  clientes: Cliente[] = [];
  filteredClientes: Cliente[] = [];
  paginatedClientes: Cliente[] = [];

  loading = false;
  RoleEnum = RoleEnum;
  globalFilterValue = '';

  // Paginación
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

  // Ordenamiento
  sortField: string = '';
  sortOrder: number = 1; // 1 = ASC, -1 = DESC

  // Para usar Math en el template
  Math = Math;

  constructor(
    private clienteService: ClienteService,
    private authService: AuthService,
    private router: Router,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadClientes();
  }

  /**
   * Cargar todos los clientes
   */
  loadClientes(): void {
    this.loading = true;
    this.clienteService.getAll().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.clientes = response.data;
          this.filteredClientes = [...this.clientes];
          this.updatePagination();
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar clientes:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los clientes',
        });
        this.loading = false;
      },
    });
  }

  /**
   * Filtro global
   */
  onGlobalFilter(event: Event): void {
    const value = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredClientes = this.clientes.filter(
      (cliente) =>
        cliente.nombre.toLowerCase().includes(value) ||
        (cliente.cedula && cliente.cedula.toLowerCase().includes(value)) ||
        cliente.pais.toLowerCase().includes(value) ||
        cliente.tipo_cliente.toLowerCase().includes(value)
    );
    this.updatePagination();
  }

  /**
   * Limpiar filtro
   */
  clearFilter(): void {
    this.globalFilterValue = '';
    this.filteredClientes = [...this.clientes];
    this.updatePagination();
  }

  /**
   * Ordenar por campo
   */
  sortBy(field: string): void {
    if (this.sortField === field) {
      this.sortOrder = this.sortOrder === 1 ? -1 : 1;
    } else {
      this.sortField = field;
      this.sortOrder = 1;
    }

    this.filteredClientes.sort((a, b) => {
      const aValue = a[field as keyof Cliente];
      const bValue = b[field as keyof Cliente];

      // Manejo de valores null/undefined
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      if (aValue < bValue) return -1 * this.sortOrder;
      if (aValue > bValue) return 1 * this.sortOrder;
      return 0;
    });

    this.updatePagination();
  }

  /**
   * Actualizar paginación
   */
  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredClientes.length / this.pageSize);
    this.currentPage = Math.min(this.currentPage, this.totalPages || 1);
    this.paginate();
  }

  /**
   * Ir a página específica
   */
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.paginate();
    }
  }

  /**
   * Cambiar tamaño de página
   */
  onPageSizeChange(): void {
    this.updatePagination();
  }

  /**
   * Paginar resultados
   */
  paginate(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedClientes = this.filteredClientes.slice(start, end);
  }

  /**
   * Obtener páginas visibles
   */
  get visiblePages(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  /**
   * Navegar a crear cliente
   */
  crearCliente(): void {
    this.router.navigate(['/clientes/crear']);
  }

  /**
   * Ver detalle del cliente
   */
  verDetalle(id: number): void {
    this.router.navigate(['/clientes', id]);
  }

  /**
   * Editar cliente
   */
  editarCliente(id: number): void {
    this.router.navigate(['/clientes', id, 'editar']);
  }

  /**
   * Eliminar cliente
   */
  eliminarCliente(cliente: Cliente): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar el cliente "${cliente.nombre}"?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.clienteService.delete(cliente.id).subscribe({
          next: (response) => {
            if (response.success) {
              this.messageService.add({
                severity: 'success',
                summary: 'Cliente Eliminado',
                detail: 'El cliente ha sido eliminado correctamente',
              });
              this.loadClientes();
            }
          },
          error: (error) => {
            console.error('Error al eliminar cliente:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo eliminar el cliente',
            });
          },
        });
      },
    });
  }
}
