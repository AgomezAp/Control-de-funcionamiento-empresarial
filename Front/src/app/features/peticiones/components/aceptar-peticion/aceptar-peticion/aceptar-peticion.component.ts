import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

// PrimeNG
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

// Services
import { PeticionService } from '../../../../../core/services/peticion.service';

// Models
import { Peticion } from '../../../../../core/models/peticion.model';

// Pipes
import { CurrencycopPipe } from '../../../../../shared/pipes/currency-cop.pipe';

// Components
import { LoaderComponent } from '../../../../../shared/components/loader/loader/loader.component';

@Component({
  selector: 'app-aceptar-peticion',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    CardModule,
    ButtonModule,
    InputNumberModule,
    TagModule,
    ToastModule,
    CurrencycopPipe,
    LoaderComponent
  ],
  providers: [MessageService],
  template: `
    <div class="container p-4">
      <app-loader *ngIf="loading"></app-loader>

      <div *ngIf="!loading && peticion">
        <p-card>
          <ng-template pTemplate="header">
            <div class="p-4">
              <h2 class="m-0"><i class="pi pi-check-circle mr-2"></i>Aceptar Petición</h2>
            </div>
          </ng-template>

          <!-- Resumen de la Petición -->
          <div class="peticion-summary mb-4 p-4 border-round bg-primary-50">
            <div class="grid">
              <div class="col-12 md:col-6">
                <label class="text-muted">ID</label>
                <p class="font-bold text-xl">#{{ peticion.id }}</p>
              </div>
              <div class="col-12 md:col-6">
                <label class="text-muted">Estado</label>
                <p-tag [value]="peticion.estado" severity="info"></p-tag>
              </div>
              <div class="col-12 md:col-6">
                <label class="text-muted">Cliente</label>
                <p class="font-semibold">{{ peticion.cliente?.nombre }}</p>
              </div>
              <div class="col-12 md:col-6">
                <label class="text-muted">Categoría</label>
                <p class="font-semibold">{{ peticion.categoria?.nombre }}</p>
              </div>
              <div class="col-12">
                <label class="text-muted">Descripción</label>
                <p>{{ peticion.descripcion }}</p>
              </div>
              <div class="col-12">
                <label class="text-muted">Costo</label>
                <p class="font-bold text-primary text-2xl">{{ peticion.costo | currencyCop }}</p>
              </div>
            </div>
          </div>

          <!-- Formulario -->
          <form [formGroup]="form" (ngSubmit)="aceptar()">
            <div class="field">
              <label for="tiempo_limite_horas" class="block mb-2">
                Tiempo Límite (horas) <span class="text-red-500">*</span>
              </label>
              <p-inputNumber
                id="tiempo_limite_horas"
                formControlName="tiempo_limite_horas"
                [min]="1"
                [max]="720"
                [showButtons]="true"
                placeholder="Ingrese el tiempo en horas"
                styleClass="w-full"
              ></p-inputNumber>
              <small class="text-muted">
                Tiempo estimado para completar esta petición (mínimo 1 hora, máximo 30 días)
              </small>
            </div>

            <ng-template pTemplate="footer">
              <div class="flex gap-2 justify-content-end mt-4">
                <button
                  pButton
                  label="Cancelar"
                  icon="pi pi-times"
                  class="p-button-outlined p-button-secondary"
                  type="button"
                  (click)="cancelar()"
                ></button>
                <button
                  pButton
                  label="Aceptar Petición"
                  icon="pi pi-check"
                  class="p-button-success"
                  type="submit"
                  [disabled]="!form.valid || submitting"
                  [loading]="submitting"
                ></button>
              </div>
            </ng-template>
          </form>
        </p-card>
      </div>
    </div>
    <p-toast></p-toast>
  `,
  styles: [`
    .container {
      max-width: 900px;
      margin: 0 auto;
    }
    .text-muted {
      color: #6c757d;
      font-size: 0.875rem;
      font-weight: 500;
      display: block;
      margin-bottom: 0.25rem;
    }
  `]
})
export class AceptarPeticionComponent implements OnInit {
  peticion: Peticion | null = null;
  form!: FormGroup;
  loading = false;
  submitting = false;
  peticionId: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private peticionService: PeticionService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.route.params.subscribe(params => {
      this.peticionId = +params['id'];
      if (this.peticionId) {
        this.loadPeticion();
      }
    });
  }

  initForm(): void {
    this.form = this.fb.group({
      tiempo_limite_horas: [48, [Validators.required, Validators.min(1), Validators.max(720)]]
    });
  }

  loadPeticion(): void {
    this.loading = true;
    this.peticionService.getById(this.peticionId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.peticion = response.data;
          
          if (this.peticion.estado !== 'Pendiente') {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Esta petición ya no está pendiente'
            });
            setTimeout(() => {
              this.router.navigate(['/peticiones', this.peticionId]);
            }, 2000);
          }
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar petición:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar la petición'
        });
        this.loading = false;
      }
    });
  }

  aceptar(): void {
    if (!this.form.valid || !this.peticion) return;

    this.submitting = true;
    const data = {
      tiempo_limite_horas: this.form.value.tiempo_limite_horas
    };

    this.peticionService.accept(this.peticion.id, data).subscribe({
      next: (response) => {
        if (response.success) {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Petición aceptada correctamente'
          });
          setTimeout(() => {
            this.router.navigate(['/peticiones', this.peticionId]);
          }, 1000);
        }
        this.submitting = false;
      },
      error: (error) => {
        console.error('Error al aceptar petición:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo aceptar la petición'
        });
        this.submitting = false;
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/peticiones', this.peticionId]);
  }
}
