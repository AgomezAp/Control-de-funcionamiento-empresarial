import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

// PrimeNG
import { StepsModule } from 'primeng/steps';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { FileUploadModule } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';
import { MessageService, MenuItem } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';

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

@Component({
  selector: 'app-crear-peticion',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    // PrimeNG
    StepsModule,
    CardModule,
    ButtonModule,
    DropdownModule,
    InputTextModule,
    InputTextarea,
    InputNumberModule,
    FileUploadModule,
    ToastModule,
    DialogModule,
    // Pipes
    CurrencycopPipe,
    // Components
    LoaderComponent
  ],
  providers: [MessageService],
  templateUrl: './crear-peticion.component.html',
  styleUrl: './crear-peticion.component.css'
})
export class CrearPeticionComponent implements OnInit {
  // Stepper
  items: MenuItem[] = [];
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

  // Files
  archivosSubidos: File[] = [];

  // Modal crear cliente
  mostrarDialogCliente = false;

  constructor(
    private fb: FormBuilder,
    private peticionService: PeticionService,
    private clienteService: ClienteService,
    private categoriaService: CategoriaService,
    private authService: AuthService,
    private messageService: MessageService,
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
      { label: 'Confirmar', icon: 'pi pi-check' }
    ];
  }

  initForms(): void {
    this.formCliente = this.fb.group({
      cliente_id: [null, Validators.required]
    });

    this.formCategoria = this.fb.group({
      categoria_id: [null, Validators.required],
      area: ['Diseño', Validators.required],
      costo_custom: [null]
    });

    this.formDescripcion = this.fb.group({
      descripcion: ['', [Validators.required, Validators.minLength(10)]],
      descripcion_extra: ['']
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
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los clientes'
        });
        this.loading = false;
      }
    });
  }

  loadCategorias(): void {
    this.categoriaService.getAll().subscribe({
      next: (categorias) => {
        const currentUser = this.authService.getCurrentUser();
        
        // Admin puede ver todas las categorías
        if (currentUser?.rol === 'Admin') {
          this.categorias = categorias;
          this.categoriasFiltradas = categorias;
        } else {
          // Otros usuarios solo ven categorías de su área
          const areaUsuario = currentUser?.area || '';
          
          // Filtrar por area_tipo (comparar como strings)
          this.categorias = categorias.filter(cat => {
            const catArea = String(cat.area_tipo);
            return catArea === areaUsuario;
          });
          this.categoriasFiltradas = this.categorias;
          
          console.log(`📋 Categorías filtradas para área ${areaUsuario}:`, this.categorias.length);
        }
      },
      error: (error) => {
        console.error('Error al cargar categorías:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las categorías'
        });
      }
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
          this.messageService.add({
            severity: 'warn',
            summary: 'Atención',
            detail: 'Por favor seleccione un cliente'
          });
          return false;
        }
        return true;

      case 1:
        if (!this.formCategoria.valid) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Atención',
            detail: 'Por favor seleccione una categoría'
          });
          return false;
        }
        return true;

      case 2:
        if (!this.formDescripcion.valid) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Atención',
            detail: 'Por favor complete la descripción (mínimo 10 caracteres)'
          });
          return false;
        }
        return true;

      default:
        return true;
    }
  }

  // Cambios en selectores
  onClienteChange(event: any): void {
    this.clienteSeleccionado = this.clientes.find(c => c.id === event.value) || null;
  }

  onCategoriaChange(event: any): void {
    this.categoriaSeleccionada = this.categorias.find(c => c.id === event.value) || null;
    
    // Si la categoría requiere descripción extra, hacer que sea requerido
    if (this.categoriaSeleccionada?.requiere_descripcion_extra) {
      this.formDescripcion.get('descripcion_extra')?.setValidators(Validators.required);
    } else {
      this.formDescripcion.get('descripcion_extra')?.clearValidators();
    }
    this.formDescripcion.get('descripcion_extra')?.updateValueAndValidity();

    // Si es variable, mostrar campo de costo
    if (this.categoriaSeleccionada?.es_variable) {
      this.formCategoria.get('costo_custom')?.setValidators([Validators.required, Validators.min(1)]);
    } else {
      this.formCategoria.get('costo_custom')?.clearValidators();
    }
    this.formCategoria.get('costo_custom')?.updateValueAndValidity();
  }

  // Filtrar categorías por área
  filtrarCategoriasPorArea(area: string): void {
    this.categoriasFiltradas = this.categorias.filter(c => c.area_tipo === area);
  }

  // Archivos
  onFileSelect(event: any): void {
    for (let file of event.files) {
      this.archivosSubidos.push(file);
    }
    this.messageService.add({
      severity: 'success',
      summary: 'Archivo agregado',
      detail: `${event.files.length} archivo(s) agregado(s)`
    });
  }

  removerArchivo(index: number): void {
    this.archivosSubidos.splice(index, 1);
  }

  // Crear petición
  crearPeticion(): void {
    if (!this.formCliente.valid || !this.formCategoria.valid || !this.formDescripcion.valid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Por favor complete todos los pasos correctamente'
      });
      return;
    }

    const data: PeticionCreate = {
      cliente_id: this.formCliente.value.cliente_id,
      categoria_id: this.formCategoria.value.categoria_id,
      area: this.formCategoria.value.area,
      descripcion: this.formDescripcion.value.descripcion,
      descripcion_extra: this.formDescripcion.value.descripcion_extra || undefined,
      costo: this.getCostoFinal()
    };

    this.submitting = true;
    this.peticionService.create(data).subscribe({
      next: (response) => {
        if (response.success) {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: data.area === 'Pautas' 
              ? 'Petición de Pautas creada y asignada automáticamente'
              : 'Petición creada correctamente'
          });
          setTimeout(() => {
            this.router.navigate(['/peticiones', response.data?.id]);
          }, 1000);
        }
        this.submitting = false;
      },
      error: (error) => {
        console.error('Error al crear petición:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo crear la petición'
        });
        this.submitting = false;
      }
    });
  }

  getCostoFinal(): number {
    if (this.categoriaSeleccionada?.es_variable) {
      return this.formCategoria.value.costo_custom || 0;
    }
    return this.categoriaSeleccionada?.costo || 0;
  }

  // Utilidades
  get resumen(): any {
    return {
      cliente: this.clienteSeleccionado,
      categoria: this.categoriaSeleccionada,
      descripcion: this.formDescripcion.value.descripcion,
      descripcionExtra: this.formDescripcion.value.descripcion_extra,
      costo: this.getCostoFinal(),
      archivos: this.archivosSubidos.length
    };
  }

  cancelar(): void {
    this.router.navigate(['/peticiones']);
  }
}
