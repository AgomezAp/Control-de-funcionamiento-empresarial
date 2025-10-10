import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
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
    LoaderComponent,
  ],
  providers: [MessageService],
  templateUrl: './aceptar-peticion.component.html',
  styleUrls: ['./aceptar-peticion.component.css'],
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
    this.route.params.subscribe((params) => {
      this.peticionId = +params['id'];
      if (this.peticionId) {
        this.loadPeticion();
      }
    });
  }

  initForm(): void {
    this.form = this.fb.group({
      tiempo_limite_horas: [
        48,
        [Validators.required, Validators.min(1), Validators.max(720)],
      ],
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
              detail: 'Esta petición ya no está pendiente',
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
          detail: 'No se pudo cargar la petición',
        });
        this.loading = false;
      },
    });
  }

  aceptar(): void {
    if (!this.form.valid || !this.peticion) return;

    this.submitting = true;
    const data = {
      tiempo_limite_horas: this.form.value.tiempo_limite_horas,
    };

    this.peticionService.accept(this.peticion.id, data).subscribe({
      next: (response) => {
        if (response.success) {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Petición aceptada correctamente',
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
          detail: 'No se pudo aceptar la petición',
        });
        this.submitting = false;
      },
    });
  }

  cancelar(): void {
    this.router.navigate(['/peticiones', this.peticionId]);
  }
}
