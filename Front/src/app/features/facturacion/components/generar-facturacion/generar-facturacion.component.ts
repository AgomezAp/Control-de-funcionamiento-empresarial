import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ToastModule } from 'primeng/toast';
import { DividerModule } from 'primeng/divider';
import { FacturacionService } from '../../../../core/services/facturacion.service';
import { ClienteService } from '../../../../core/services/cliente.service';
import { Cliente } from '../../../../core/models/cliente.model';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-generar-facturacion',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    DropdownModule,
    RadioButtonModule,
    ToastModule,
    DividerModule
  ],
  providers: [MessageService],
  templateUrl: './generar-facturacion.component.html',
  styleUrl: './generar-facturacion.component.css'
})
export class GenerarFacturacionComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  clientes: Cliente[] = [];
  
  tipoGeneracion: 'individual' | 'todos' = 'individual';

  anios: { label: string; value: number }[] = [];
  meses = [
    { label: 'Enero', value: 1 },
    { label: 'Febrero', value: 2 },
    { label: 'Marzo', value: 3 },
    { label: 'Abril', value: 4 },
    { label: 'Mayo', value: 5 },
    { label: 'Junio', value: 6 },
    { label: 'Julio', value: 7 },
    { label: 'Agosto', value: 8 },
    { label: 'Septiembre', value: 9 },
    { label: 'Octubre', value: 10 },
    { label: 'Noviembre', value: 11 },
    { label: 'Diciembre', value: 12 }
  ];

  constructor(
    private fb: FormBuilder,
    private facturacionService: FacturacionService,
    private clienteService: ClienteService,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.initAnios();
    this.loadClientes();
  }

  initForm(): void {
    const currentDate = new Date();
    const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1);

    this.form = this.fb.group({
      cliente_id: [null],
      año: [lastMonth.getFullYear(), Validators.required],
      mes: [lastMonth.getMonth() + 1, Validators.required]
    });
  }

  initAnios(): void {
    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i >= currentYear - 5; i--) {
      this.anios.push({ label: i.toString(), value: i });
    }
  }

  loadClientes(): void {
    this.clienteService.getAll().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.clientes = response.data;
        }
      },
      error: (error) => {
        console.error('Error cargando clientes:', error);
      }
    });
  }

  onTipoChange(): void {
    if (this.tipoGeneracion === 'todos') {
      this.form.get('cliente_id')?.clearValidators();
      this.form.get('cliente_id')?.setValue(null);
    } else {
      this.form.get('cliente_id')?.setValidators([Validators.required]);
    }
    this.form.get('cliente_id')?.updateValueAndValidity();
  }

  onSubmit(): void {
    if (this.tipoGeneracion === 'individual' && this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.tipoGeneracion === 'todos' && (!this.form.value.año || !this.form.value.mes)) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Debe seleccionar año y mes'
      });
      return;
    }

    this.loading = true;

    if (this.tipoGeneracion === 'individual') {
      this.generarIndividual();
    } else {
      this.generarTodos();
    }
  }

  generarIndividual(): void {
    this.facturacionService.generar(this.form.value).subscribe({
      next: (response) => {
        if (response.success) {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Facturación generada correctamente'
          });
          setTimeout(() => {
            this.router.navigate(['/facturacion/resumen']);
          }, 1500);
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error generando facturación:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'Error al generar la facturación'
        });
        this.loading = false;
      }
    });
  }

  generarTodos(): void {
    const { año, mes } = this.form.value;
    
    this.facturacionService.generarTodos(año, mes).subscribe({
      next: (response) => {
        if (response.success) {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Facturaciones generadas para todos los clientes'
          });
          setTimeout(() => {
            this.router.navigate(['/facturacion/resumen']);
          }, 1500);
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error generando facturaciones:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'Error al generar las facturaciones'
        });
        this.loading = false;
      }
    });
  }

  volver(): void {
    this.router.navigate(['/facturacion/resumen']);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (field?.hasError('required')) {
      return 'Este campo es requerido';
    }
    return '';
  }

  getSelectedCliente(): string {
    if (!this.form.value.cliente_id) return '';
    const cliente = this.clientes.find(c => c.id === this.form.value.cliente_id);
    return cliente?.nombre || '';
  }

  get anioSeleccionado(): number | null {
    return this.form.value.año || null;
  }
}

