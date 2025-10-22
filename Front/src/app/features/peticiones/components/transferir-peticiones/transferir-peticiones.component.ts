import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// PrimeNG
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ChipModule } from 'primeng/chip';
import { ToolbarModule } from 'primeng/toolbar';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';
import { TagModule } from 'primeng/tag';
import { MultiSelectModule } from 'primeng/multiselect';
import { MessageService, ConfirmationService } from 'primeng/api';

// Services
import { UsuarioService } from '../../../../core/services/usuario.service';
import { PeticionService } from '../../../../core/services/peticion.service';

// Models
import { Usuario } from '../../../../core/models/usuario.model';
import { Peticion } from '../../../../core/models/peticion.model';

@Component({
  selector: 'app-transferir-peticiones',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DropdownModule,
    TableModule,
    ButtonModule,
    CardModule,
    ChipModule,
    ToolbarModule,
    ToastModule,
    ConfirmDialogModule,
    InputTextModule,
    TagModule,
    MultiSelectModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './transferir-peticiones.component.html',
  styleUrls: ['./transferir-peticiones.component.css'],
})
export class TransferirPeticionesComponent implements OnInit {
  // Datos
  usuarios: Usuario[] = [];
  peticiones: Peticion[] = [];

  // Selección
  usuarioOrigenSeleccionado: Usuario | null = null;
  peticionesSeleccionadas: Peticion[] = [];
  usuariosDestinoSeleccionados: Usuario[] = [];
  motivo: string = '';

  showMultiSelect = false;
  searchUsuarioDestino = '';
  usuariosDestinoFiltrados: Usuario[] = [];
  searchTerm = '';
  peticionesFiltradas: Peticion[] = [];
  currentPage = 1;
  rowsPerPage = 10;
  totalPages = 1;

  // Estados
  loading = false;
  loadingPeticiones = false;
  transferiendo = false;

  // Filtros para usuarios destino (excluir usuario origen)
  get usuariosDisponiblesDestino(): Usuario[] {
    return this.usuarios.filter(
      (u) => u.uid !== this.usuarioOrigenSeleccionado?.uid && u.status
    );
  }

  // Obtener peticiones de la página actual
  get peticionesPaginadas(): Peticion[] {
    const startIndex = (this.currentPage - 1) * this.rowsPerPage;
    const endIndex = startIndex + this.rowsPerPage;
    return this.peticionesFiltradas.slice(startIndex, endIndex);
  }

  constructor(
    private usuarioService: UsuarioService,
    private peticionService: PeticionService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  /**
   * Cargar lista de usuarios
   */
  cargarUsuarios(): void {
    this.loading = true;
    this.usuarioService.getAll().subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.usuarios = response.data.filter((u: Usuario) => u.status); // Solo usuarios activos
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los usuarios',
        });
        this.loading = false;
      },
    });
  }

  /**
   * Evento cuando se selecciona un usuario origen
   */
  onUsuarioOrigenSeleccionado(): void {
    if (this.usuarioOrigenSeleccionado) {
      this.cargarPeticionesUsuario(this.usuarioOrigenSeleccionado.uid);
      this.peticionesSeleccionadas = [];
      this.usuariosDestinoSeleccionados = [];
    } else {
      this.peticiones = [];
      this.peticionesSeleccionadas = [];
    }
  }

  /**
   * Cargar peticiones asignadas a un usuario
   */
  cargarPeticionesUsuario(usuarioId: number): void {
    this.loadingPeticiones = true;
    this.peticionService.getAll().subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          // Filtrar solo peticiones del usuario origen y en estados transferibles
          this.peticiones = response.data.filter(
            (p: Peticion) =>
              p.asignado_a === usuarioId &&
              ['Pendiente', 'En Progreso', 'Pausada'].includes(p.estado)
          );
          
          // Inicializar peticiones filtradas y paginación
          this.peticionesFiltradas = [...this.peticiones];
          this.searchTerm = '';
          this.currentPage = 1;
          this.calculatePagination();
          
          console.log('Peticiones cargadas:', this.peticiones.length);
          console.log('Peticiones filtradas:', this.peticionesFiltradas.length);
        }
        this.loadingPeticiones = false;
      },
      error: (error: any) => {
        console.error('Error al cargar peticiones:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las peticiones',
        });
        this.loadingPeticiones = false;
      },
    });
  }

  /**
   * Validar si se puede transferir
   */
  puedeTransferir(): boolean {
    const resultado = (
      !!this.usuarioOrigenSeleccionado &&
      this.peticionesSeleccionadas.length > 0 &&
      this.usuariosDestinoSeleccionados.length > 0 &&
      this.motivo.trim().length > 0
    );
    
    console.log('puedeTransferir:', {
      usuarioOrigen: !!this.usuarioOrigenSeleccionado,
      peticionesCount: this.peticionesSeleccionadas.length,
      usuariosDestinoCount: this.usuariosDestinoSeleccionados.length,
      motivoLength: this.motivo.trim().length,
      resultado
    });
    
    return resultado;
  }

  /**
   * Transferir peticiones
   */
  transferirPeticiones(): void {
    console.log('transferirPeticiones() llamado');
    
    if (!this.puedeTransferir()) {
      console.log('No se puede transferir - validación fallida');
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Completa todos los campos requeridos',
      });
      return;
    }

    console.log('Mostrando confirmación...');
    this.confirmationService.confirm({
      message: `¿Estás seguro de transferir ${this.peticionesSeleccionadas.length} peticiones de ${this.usuarioOrigenSeleccionado?.nombre_completo} a ${this.usuariosDestinoSeleccionados.length} usuario(s)?`,
      header: 'Confirmar Transferencia',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, transferir',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.ejecutarTransferencia();
      },
    });
  }

  /**
   * Ejecutar transferencia
   */
  private ejecutarTransferencia(): void {
    this.transferiendo = true;

    const payload = {
      usuario_origen_id: this.usuarioOrigenSeleccionado!.uid,
      peticiones_ids: this.peticionesSeleccionadas.map((p) => p.id),
      usuarios_destino_ids: this.usuariosDestinoSeleccionados.map((u) => u.uid),
      motivo: this.motivo.trim(),
    };

    this.peticionService.transferirPeticiones(payload).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: `${response.data.total_transferidas} peticiones transferidas correctamente`,
            life: 5000,
          });

          // Mostrar distribución
          const distribucion = response.data.distribucion
            .map((d: any) => `${d.usuario_nombre}: ${d.peticiones_asignadas}`)
            .join(', ');

          this.messageService.add({
            severity: 'info',
            summary: 'Distribución',
            detail: distribucion,
            life: 7000,
          });

          // Limpiar formulario
          this.limpiarFormulario();

          // Recargar peticiones
          if (this.usuarioOrigenSeleccionado) {
            this.cargarPeticionesUsuario(this.usuarioOrigenSeleccionado.uid);
          }
        }
        this.transferiendo = false;
      },
      error: (error) => {
        console.error('Error al transferir peticiones:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail:
            error.error?.message || 'No se pudieron transferir las peticiones',
        });
        this.transferiendo = false;
      },
    });
  }

  toggleMultiSelect(): void {
    this.showMultiSelect = !this.showMultiSelect;
    if (this.showMultiSelect) {
      this.usuariosDestinoFiltrados = [...this.usuariosDisponiblesDestino];
    }
  }

  filterUsuariosDestino(): void {
    const term = this.searchUsuarioDestino.toLowerCase();
    this.usuariosDestinoFiltrados = this.usuariosDisponiblesDestino.filter(
      (u) => u.nombre_completo.toLowerCase().includes(term)
    );
  }

  isUsuarioDestinoSeleccionado(usuario: Usuario): boolean {
    return this.usuariosDestinoSeleccionados.some((u) => u.uid === usuario.uid);
  }

  toggleUsuarioDestino(usuario: Usuario): void {
    const index = this.usuariosDestinoSeleccionados.findIndex(
      (u) => u.uid === usuario.uid
    );
    if (index > -1) {
      this.usuariosDestinoSeleccionados.splice(index, 1);
    } else {
      this.usuariosDestinoSeleccionados.push(usuario);
    }
  }

  removeUsuarioDestino(usuario: Usuario): void {
    this.usuariosDestinoSeleccionados =
      this.usuariosDestinoSeleccionados.filter((u) => u.uid !== usuario.uid);
  }

  filterPeticiones(): void {
    const term = this.searchTerm.toLowerCase();
    this.peticionesFiltradas = this.peticiones.filter(
      (p) =>
        p.id.toString().includes(term) ||
        p.descripcion.toLowerCase().includes(term) ||
        p.cliente?.nombre.toLowerCase().includes(term) ||
        p.categoria?.nombre.toLowerCase().includes(term)
    );
    this.calculatePagination();
  }

  isPeticionSeleccionada(peticion: Peticion): boolean {
    return this.peticionesSeleccionadas.some((p) => p.id === peticion.id);
  }

  togglePeticion(peticion: Peticion): void {
    console.log('Toggle petición:', peticion.id);
    const index = this.peticionesSeleccionadas.findIndex(
      (p) => p.id === peticion.id
    );
    if (index > -1) {
      this.peticionesSeleccionadas.splice(index, 1);
      console.log('Petición deseleccionada. Total:', this.peticionesSeleccionadas.length);
    } else {
      this.peticionesSeleccionadas.push(peticion);
      console.log('Petición seleccionada. Total:', this.peticionesSeleccionadas.length);
    }
  }

  todasSeleccionadas(): boolean {
    return (
      this.peticiones.length > 0 &&
      this.peticionesSeleccionadas.length === this.peticiones.length
    );
  }

  toggleTodasPeticiones(): void {
    if (this.todasSeleccionadas()) {
      this.peticionesSeleccionadas = [];
    } else {
      this.peticionesSeleccionadas = [...this.peticiones];
    }
  }

  getEstadoClass(estado: string): string {
    const estadoMap: { [key: string]: string } = {
      Pendiente: 'warning',
      'En Proceso': 'info',
      Finalizada: 'success',
      Cancelada: 'danger',
    };
    return estadoMap[estado] || 'primary';
  }

  calculatePagination(): void {
    this.totalPages = Math.ceil(
      this.peticionesFiltradas.length / this.rowsPerPage
    );
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  onRowsPerPageChange(): void {
    this.currentPage = 1;
    this.calculatePagination();
  }
  /**
   * Limpiar formulario
   */
  limpiarFormulario(): void {
    this.usuarioOrigenSeleccionado = null;
    this.peticiones = [];
    this.peticionesSeleccionadas = [];
    this.usuariosDestinoSeleccionados = [];
    this.motivo = '';
  }

  /**
   * Obtener severity para tag de estado
   */
  getEstadoSeverity(estado: string): 'success' | 'info' | 'warning' | 'danger' {
    switch (estado) {
      case 'Resuelta':
        return 'success';
      case 'En Progreso':
        return 'info';
      case 'Pausada':
        return 'warning';
      case 'Pendiente':
        return 'warning';
      case 'Cancelada':
        return 'danger';
      default:
        return 'info';
    }
  }

  /**
   * Volver a peticiones
   */
  volver(): void {
    this.router.navigate(['/peticiones']);
  }
}
