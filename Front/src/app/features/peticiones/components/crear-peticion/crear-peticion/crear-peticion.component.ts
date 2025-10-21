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

  // Usuario actual
  currentUser: any = null;
  mostrarSelectArea: boolean = true;

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
    this.currentUser = this.authService.getCurrentUser();
    
    this.initStepper();
    this.initForms();
    this.configurarFormularioPorUsuario();
    this.loadClientes();
    this.loadCategorias();
  }

  configurarFormularioPorUsuario(): void {
    const currentUser = this.authService.getCurrentUser();
    console.log('👤 Usuario actual:', currentUser?.nombre_completo, '- Área:', currentUser?.area, '- Rol:', currentUser?.rol);
    
    if (currentUser?.rol === 'Admin') {
      // Admin puede seleccionar cualquier área (Diseño, Pautas, Gestión Administrativa)
      this.mostrarSelectArea = true;
      this.formCategoria.patchValue({ area: 'Diseño' });
      console.log('✅ Admin: Área configurada como "Diseño" por defecto (puede cambiar)');
    } else if (currentUser?.area === 'Diseño') {
      // Diseño puede crear peticiones para Diseño o Pautas (selector visible)
      this.mostrarSelectArea = true;
      this.formCategoria.patchValue({ area: 'Diseño' });
      console.log('✅ Diseño: Área configurada como "Diseño" por defecto (puede cambiar a Pautas)');
    } else if (currentUser?.area === 'Pautas') {
      // Pautas puede crear peticiones para Pautas o Diseño (selector visible)
      this.mostrarSelectArea = true;
      this.formCategoria.patchValue({ area: 'Pautas' });
      console.log('✅ Pautas: Área configurada como "Pautas" por defecto (puede cambiar a Diseño)');
    } else if (currentUser?.area === 'Gestión Administrativa') {
      // Gestión Administrativa SOLO puede crear peticiones de su área (fijo)
      this.mostrarSelectArea = false;
      this.formCategoria.patchValue({ area: 'Gestión Administrativa' });
      this.formCategoria.get('area')?.disable();
      console.log('✅ Gestión Administrativa: Área FIJA en "Gestión Administrativa"');
      console.log('📋 Valor después de patchValue:', this.formCategoria.getRawValue().area);
    }
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
        console.log('📦 Categorías cargadas desde backend:', categorias.length);
        
        // Cargar TODAS las categorías sin filtrar inicialmente
        this.categorias = categorias;
        
        // Obtener el área actual del formulario (puede estar deshabilitado, usar getRawValue)
        const areaActual = this.formCategoria.get('area')?.value || 
                          this.formCategoria.getRawValue().area || '';
        
        console.log('🔍 Área actual para filtrar:', areaActual);
        
        if (areaActual) {
          this.categoriasFiltradas = categorias.filter(
            (cat) => cat.area_tipo === areaActual
          );
          console.log(`✅ Categorías filtradas para "${areaActual}":`, this.categoriasFiltradas.length);
          console.log('📋 Categorías:', this.categoriasFiltradas.map(c => c.nombre));
        } else {
          this.categoriasFiltradas = categorias;
          console.log('📋 Mostrando todas las categorías (sin filtro)');
        }
      },
      error: (error) => {
        console.error('❌ Error al cargar categorías:', error);
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

  onAreaChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const areaSeleccionada = target.value;

    console.log('🔄 Área seleccionada:', areaSeleccionada);
    console.log('📦 Total categorías disponibles:', this.categorias.length);

    // Filtrar categorías según el área seleccionada
    if (areaSeleccionada) {
      this.categoriasFiltradas = this.categorias.filter(
        (cat) => cat.area_tipo === areaSeleccionada
      );
      console.log(`✅ Categorías filtradas para "${areaSeleccionada}":`, this.categoriasFiltradas.length);
      console.log('📋 Categorías:', this.categoriasFiltradas.map(c => c.nombre));
    } else {
      this.categoriasFiltradas = this.categorias;
      console.log('📋 Mostrando todas las categorías');
    }

    // Limpiar la categoría seleccionada al cambiar el área
    this.formCategoria.patchValue({ categoria_id: '' });
    this.categoriaSeleccionada = null;
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

    // Obtener el área correctamente (incluso si está deshabilitado)
    const areaValue = this.formCategoria.get('area')?.value || 
                      this.formCategoria.getRawValue().area;

    const data: PeticionCreate = {
      cliente_id: Number(this.formCliente.value.cliente_id),
      categoria_id: Number(this.formCategoria.value.categoria_id),
      area: areaValue,
      descripcion: this.formDescripcion.value.descripcion,
      descripcion_extra:
        this.formDescripcion.value.descripcion_extra || undefined,
      costo: this.getCostoFinal(),
    };

    console.log('📤 Datos a enviar:', data);

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
