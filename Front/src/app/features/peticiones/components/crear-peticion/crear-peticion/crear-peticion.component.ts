import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

// Services
import { PeticionService } from '../../../../../core/services/peticion.service';
import { ClienteService } from '../../../../../core/services/cliente.service';
import { CategoriaService } from '../../../../../core/services/categoria.service';
import { AuthService } from '../../../../../core/services/auth.service';

// Models
import { Cliente } from '../../../../../core/models/cliente.model';
import { Categoria } from '../../../../../core/models/categoria.model';
import { PeticionCreate } from '../../../../../core/models/peticion.model';

// Pipes
import { CurrencycopPipe } from '../../../../../shared/pipes/currency-cop.pipe';

// Components
import { LoaderComponent } from '../../../../../shared/components/loader/loader/loader.component';

interface ToastMessage {
  severity: 'success' | 'error' | 'warn' | 'info';
  summary: string;
  detail: string;
}

@Component({
  selector: 'app-crear-peticion',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    CurrencycopPipe,
    LoaderComponent,
  ],
  templateUrl: './crear-peticion.component.html',
  styleUrl: './crear-peticion.component.css',
})
export class CrearPeticionComponent implements OnInit {
  // Stepper
  items: Array<{ label: string; icon: string }> = [];
  activeIndex = 0;

  // Forms
  formCliente!: FormGroup;
  formCategoria!: FormGroup;
  formDescripcion!: FormGroup;

  // Data
  clientes: Cliente[] = [];
  categorias: Categoria[] = [];
  categoriasFiltradas: Categoria[] = [];

  // Selected Data
  clienteSeleccionado: Cliente | null = null;
  categoriaSeleccionada: Categoria | null = null;

  // Loading
  loading = false;
  submitting = false;

  // Toast
  toastMessage: ToastMessage | null = null;
  private toastTimeout: any;

  constructor(
    private fb: FormBuilder,
    private peticionService: PeticionService,
    private clienteService: ClienteService,
    private categoriaService: CategoriaService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initStepper();
    this.initForms();
    this.loadClientes();
    this.loadCategorias();
  }

  initStepper(): void {
    this.items = [
      { label: 'Cliente', icon: 'pi pi-building' },
      { label: 'Categoría', icon: 'pi pi-tag' },
      { label: 'Descripción', icon: 'pi pi-align-left' },
      { label: 'Confirmar', icon: 'pi pi-check' },
    ];
  }

  initForms(): void {
    this.formCliente = this.fb.group({
      cliente_id: ['', Validators.required],
    });

    this.formCategoria = this.fb.group({
      categoria_id: ['', Validators.required],
      area: ['Diseño', Validators.required],
      costo_custom: [null],
    });

    this.formDescripcion = this.fb.group({
      descripcion: ['', [Validators.required, Validators.minLength(10)]],
      descripcion_extra: [''],
    });
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
        this.showToast('error', 'Error', 'No se pudieron cargar los clientes');
        this.loading = false;
      },
    });
  }

  loadCategorias(): void {
    this.categoriaService.getAll().subscribe({
      next: (categorias) => {
        const currentUser = this.authService.getCurrentUser();

        if (currentUser?.rol === 'Admin') {
          this.categorias = categorias;
          this.categoriasFiltradas = categorias;
        } else {
          const areaUsuario = currentUser?.area || '';
          this.categorias = categorias.filter((cat) => {
            const catArea = String(cat.area_tipo);
            return catArea === areaUsuario;
          });
          this.categoriasFiltradas = this.categorias;
        }
      },
      error: (error) => {
        console.error('Error al cargar categorías:', error);
        this.showToast(
          'error',
          'Error',
          'No se pudieron cargar las categorías'
        );
      },
    });
  }

  // Navegación del wizard
  nextStep(): void {
    if (this.validarPasoActual()) {
      if (this.activeIndex < this.items.length - 1) {
        this.activeIndex++;
      }
    }
  }

  prevStep(): void {
    if (this.activeIndex > 0) {
      this.activeIndex--;
    }
  }

  validarPasoActual(): boolean {
    switch (this.activeIndex) {
      case 0:
        if (!this.formCliente.valid) {
          this.showToast('warn', 'Atención', 'Por favor seleccione un cliente');
          return false;
        }
        return true;

      case 1:
        if (!this.formCategoria.valid) {
          this.showToast(
            'warn',
            'Atención',
            'Por favor seleccione una categoría'
          );
          return false;
        }
        return true;

      case 2:
        if (!this.formDescripcion.valid) {
          this.showToast(
            'warn',
            'Atención',
            'Por favor complete la descripción (mínimo 10 caracteres)'
          );
          return false;
        }
        return true;

      default:
        return true;
    }
  }

  // Cambios en selectores
  onClienteChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const clienteId = Number(target.value);
    this.clienteSeleccionado =
      this.clientes.find((c) => c.id === clienteId) || null;
  }

  onCategoriaChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const categoriaId = Number(target.value);
    this.categoriaSeleccionada =
      this.categorias.find((c) => c.id === categoriaId) || null;

    if (this.categoriaSeleccionada?.requiere_descripcion_extra) {
      this.formDescripcion
        .get('descripcion_extra')
        ?.setValidators(Validators.required);
    } else {
      this.formDescripcion.get('descripcion_extra')?.clearValidators();
    }
    this.formDescripcion.get('descripcion_extra')?.updateValueAndValidity();

    if (this.categoriaSeleccionada?.es_variable) {
      this.formCategoria
        .get('costo_custom')
        ?.setValidators([Validators.required, Validators.min(1)]);
    } else {
      this.formCategoria.get('costo_custom')?.clearValidators();
    }
    this.formCategoria.get('costo_custom')?.updateValueAndValidity();
  }

  // Crear petición
  crearPeticion(): void {
    if (
      !this.formCliente.valid ||
      !this.formCategoria.valid ||
      !this.formDescripcion.valid
    ) {
      this.showToast(
        'error',
        'Error',
        'Por favor complete todos los pasos correctamente'
      );
      return;
    }

    const data: PeticionCreate = {
      cliente_id: Number(this.formCliente.value.cliente_id),
      categoria_id: Number(this.formCategoria.value.categoria_id),
      area: this.formCategoria.value.area,
      descripcion: this.formDescripcion.value.descripcion,
      descripcion_extra:
        this.formDescripcion.value.descripcion_extra || undefined,
      costo: this.getCostoFinal(),
    };

    this.submitting = true;
    this.peticionService.create(data).subscribe({
      next: (response) => {
        if (response.success) {
          this.showToast(
            'success',
            'Éxito',
            data.area === 'Pautas'
              ? 'Petición de Pautas creada y asignada automáticamente'
              : 'Petición creada correctamente'
          );
          setTimeout(() => {
            this.router.navigate(['/peticiones', response.data?.id]);
          }, 1500);
        }
        this.submitting = false;
      },
      error: (error) => {
        console.error('Error al crear petición:', error);
        this.showToast('error', 'Error', 'No se pudo crear la petición');
        this.submitting = false;
      },
    });
  }

  getCostoFinal(): number {
    if (this.categoriaSeleccionada?.es_variable) {
      return this.formCategoria.value.costo_custom || 0;
    }
    return this.categoriaSeleccionada?.costo || 0;
  }

  get resumen(): any {
    return {
      cliente: this.clienteSeleccionado,
      categoria: this.categoriaSeleccionada,
      descripcion: this.formDescripcion.value.descripcion,
      descripcionExtra: this.formDescripcion.value.descripcion_extra,
      costo: this.getCostoFinal(),
    };
  }

  cancelar(): void {
    this.router.navigate(['/peticiones']);
  }

  // Toast methods
  showToast(
    severity: ToastMessage['severity'],
    summary: string,
    detail: string
  ): void {
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }

    this.toastMessage = { severity, summary, detail };

    this.toastTimeout = setTimeout(() => {
      this.closeToast();
    }, 5000);
  }

  closeToast(): void {
    this.toastMessage = null;
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
  }

  getToastIcon(): string {
    if (!this.toastMessage) return '';

    const icons = {
      success: 'pi pi-check-circle',
      error: 'pi pi-times-circle',
      warn: 'pi pi-exclamation-triangle',
      info: 'pi pi-info-circle',
    };

    return icons[this.toastMessage.severity];
  }
}
