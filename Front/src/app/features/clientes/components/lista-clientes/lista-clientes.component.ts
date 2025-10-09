import { Component, OnInit, ViewChild } from '@angular/core'; // ← AGREGAR ViewChild
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { TableModule, Table } from 'primeng/table'; // ← AGREGAR Table
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
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
    TableModule,
    ButtonModule,
    InputTextModule,
    ToastModule,
    ConfirmDialogModule,
    TagModule,
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
  @ViewChild('dt') dt!: Table; // ← AGREGAR ESTO

  clientes: Cliente[] = [];
  loading = false;
  RoleEnum = RoleEnum;
  globalFilterValue = '';

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

  loadClientes(): void {
    this.loading = true;
    this.clienteService.getAll().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.clientes = response.data;
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

  onGlobalFilter(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.globalFilterValue = input.value;
    this.dt.filterGlobal(input.value, 'contains');
  }

  clearFilter(): void {
    this.globalFilterValue = '';
    this.dt.clear();
  }

  crearCliente(): void {
    this.router.navigate(['/clientes/crear']);
  }

  verDetalle(id: number): void {
    this.router.navigate(['/clientes', id]);
  }

  editarCliente(id: number): void {
    this.router.navigate(['/clientes', id, 'editar']);
  }

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
