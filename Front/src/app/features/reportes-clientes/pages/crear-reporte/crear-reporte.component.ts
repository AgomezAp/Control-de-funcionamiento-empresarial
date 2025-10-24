import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ReporteClienteService } from '../../../../core/services/reporte-cliente.service';
import { ClienteService } from '../../../../core/services/cliente.service';
import { TIPOS_PROBLEMA, PRIORIDADES } from '../../../../core/models/reporte-cliente.model';

@Component({
  selector: 'app-crear-reporte',
  standalone: false,
  templateUrl: './crear-reporte.component.html',
  styleUrls: ['./crear-reporte.component.css'],
  providers: [MessageService]
})
export class CrearReporteComponent implements OnInit {
  reporteForm: FormGroup;
  clientes: any[] = [];
  tiposProblema = TIPOS_PROBLEMA;
  prioridades = PRIORIDADES;
  loading: boolean = false;
  submitting: boolean = false;

  constructor(
    private fb: FormBuilder,
    private reporteService: ReporteClienteService,
    private clienteService: ClienteService,
    private messageService: MessageService,
    private router: Router
  ) {
    this.reporteForm = this.fb.group({
      cliente_id: [null, Validators.required],
      tipo_problema: [null, Validators.required],
      prioridad: [null, Validators.required],
      descripcion_problema: ['', [Validators.required, Validators.minLength(10)]],
      notas_internas: ['']
    });
  }

  ngOnInit(): void {
    this.cargarClientes();
  }

  cargarClientes(): void {
    this.loading = true;
    this.clienteService.getAll().subscribe({
      next: (response: any) => {
        this.clientes = response.clientes || [];
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

  onSubmit(): void {
    if (this.reporteForm.invalid) {
      Object.keys(this.reporteForm.controls).forEach(key => {
        this.reporteForm.get(key)?.markAsTouched();
      });
      this.messageService.add({
        severity: 'warn',
        summary: 'Formulario Incompleto',
        detail: 'Por favor complete todos los campos requeridos'
      });
      return;
    }

    this.submitting = true;
    this.reporteService.crearReporte(this.reporteForm.value).subscribe({
      next: (response) => {
        if (response.ok) {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Reporte creado correctamente'
          });
          setTimeout(() => {
            this.router.navigate(['/reportes-clientes/dashboard']);
          }, 1500);
        }
      },
      error: (error) => {
        console.error('Error al crear reporte:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.msg || 'No se pudo crear el reporte'
        });
        this.submitting = false;
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/reportes-clientes/dashboard']);
  }

  isFieldInvalid(field: string): boolean {
    const control = this.reporteForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}
