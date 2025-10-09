import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { PasswordModule } from 'primeng/password';
import { UsuarioService } from '../../../../core/services/usuario.service';
import { NotificacionService } from '../../../../core/services/notificacion.service';
import { UsuarioCreate } from '../../../../core/models/usuario.model';
import { RoleEnum } from '../../../../core/models/role.model';
import { AreaEnum } from '../../../../core/models/area.model';
import { MENSAJES } from '../../../../core/constants/mensajes.constants';

@Component({
  selector: 'app-crear-usuario',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    ButtonModule,
    DropdownModule,
    PasswordModule
  ],
  template: `
    <div class="container mx-auto p-4">
      <p-card>
        <ng-template pTemplate="header">
          <div class="flex justify-between items-center p-4">
            <h2 class="text-2xl font-bold">Crear Nuevo Usuario</h2>
            <p-button
              icon="pi pi-arrow-left"
              label="Volver"
              [text]="true"
              (onClick)="volver()"
            />
          </div>
        </ng-template>

        <form [formGroup]="usuarioForm" (ngSubmit)="onSubmit()" class="flex flex-col gap-4">
          <!-- Nombre Completo -->
          <div class="field">
            <label for="nombre" class="block mb-2 font-semibold">
              Nombre Completo <span class="text-red-500">*</span>
            </label>
            <input
              pInputText
              id="nombre"
              formControlName="nombre_completo"
              class="w-full"
              placeholder="Ingrese el nombre completo"
            />
            <small
              *ngIf="usuarioForm.get('nombre_completo')?.invalid && usuarioForm.get('nombre_completo')?.touched"
              class="text-red-500"
            >
              El nombre es requerido (mínimo 3 caracteres)
            </small>
          </div>

          <!-- Correo Electrónico -->
          <div class="field">
            <label for="correo" class="block mb-2 font-semibold">
              Correo Electrónico <span class="text-red-500">*</span>
            </label>
            <input
              pInputText
              id="correo"
              type="email"
              formControlName="correo"
              class="w-full"
              placeholder="usuario@ejemplo.com"
            />
            <small
              *ngIf="usuarioForm.get('correo')?.invalid && usuarioForm.get('correo')?.touched"
              class="text-red-500"
            >
              {{ getEmailError() }}
            </small>
          </div>

          <!-- Contraseña -->
          <div class="field">
            <label for="contrasena" class="block mb-2 font-semibold">
              Contraseña <span class="text-red-500">*</span>
            </label>
            <p-password
              id="contrasena"
              formControlName="contrasena"
              [toggleMask]="true"
              [feedback]="true"
              placeholder="Ingrese una contraseña segura"
              [style]="{'width': '100%'}"
              [inputStyle]="{'width': '100%'}"
            />
            <small
              *ngIf="usuarioForm.get('contrasena')?.invalid && usuarioForm.get('contrasena')?.touched"
              class="text-red-500"
            >
              La contraseña debe tener al menos 6 caracteres
            </small>
          </div>

          <!-- Confirmar Contraseña -->
          <div class="field">
            <label for="confirmar" class="block mb-2 font-semibold">
              Confirmar Contraseña <span class="text-red-500">*</span>
            </label>
            <p-password
              id="confirmar"
              formControlName="confirmar_contrasena"
              [toggleMask]="true"
              [feedback]="false"
              placeholder="Confirme la contraseña"
              [style]="{'width': '100%'}"
              [inputStyle]="{'width': '100%'}"
            />
            <small
              *ngIf="usuarioForm.get('confirmar_contrasena')?.invalid && usuarioForm.get('confirmar_contrasena')?.touched"
              class="text-red-500"
            >
              Las contraseñas no coinciden
            </small>
          </div>

          <!-- Rol -->
          <div class="field">
            <label for="rol" class="block mb-2 font-semibold">
              Rol <span class="text-red-500">*</span>
            </label>
            <p-dropdown
              id="rol"
              formControlName="rol_id"
              [options]="roles"
              placeholder="Seleccione un rol"
              optionLabel="label"
              optionValue="value"
              class="w-full"
            />
            <small
              *ngIf="usuarioForm.get('rol_id')?.invalid && usuarioForm.get('rol_id')?.touched"
              class="text-red-500"
            >
              El rol es requerido
            </small>
          </div>

          <!-- Área -->
          <div class="field">
            <label for="area" class="block mb-2 font-semibold">
              Área <span class="text-red-500">*</span>
            </label>
            <p-dropdown
              id="area"
              formControlName="area_id"
              [options]="areas"
              placeholder="Seleccione un área"
              optionLabel="label"
              optionValue="value"
              class="w-full"
            />
            <small
              *ngIf="usuarioForm.get('area_id')?.invalid && usuarioForm.get('area_id')?.touched"
              class="text-red-500"
            >
              El área es requerida
            </small>
          </div>

          <!-- Botones -->
          <div class="flex justify-end gap-2 mt-4">
            <p-button
              label="Cancelar"
              severity="secondary"
              [outlined]="true"
              (onClick)="volver()"
              type="button"
            />
            <p-button
              label="Crear Usuario"
              icon="pi pi-save"
              [disabled]="usuarioForm.invalid || loading"
              [loading]="loading"
              type="submit"
            />
          </div>
        </form>
      </p-card>
    </div>
  `,
  styles: [`
    :host ::ng-deep {
      .p-dropdown,
      .p-password {
        width: 100%;
      }
      
      .p-password input {
        width: 100%;
      }
    }
  `]
})
export class CrearUsuarioComponent implements OnInit {
  private fb = inject(FormBuilder);
  private usuarioService = inject(UsuarioService);
  private notificacionService = inject(NotificacionService);
  private router = inject(Router);

  usuarioForm!: FormGroup;
  loading = false;

  roles = [
    { label: RoleEnum.ADMIN, value: 1 },
    { label: RoleEnum.DIRECTIVO, value: 2 },
    { label: RoleEnum.LIDER, value: 3 },
    { label: RoleEnum.USUARIO, value: 4 }
  ];

  areas = [
    { label: AreaEnum.GESTION_ADMINISTRATIVA, value: 1 },
    { label: AreaEnum.PAUTAS, value: 2 },
    { label: AreaEnum.DISENO, value: 3 },
    { label: AreaEnum.CONTABILIDAD, value: 4 },
    { label: AreaEnum.PROGRAMACION, value: 5 }
  ];

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.usuarioForm = this.fb.group({
      nombre_completo: ['', [Validators.required, Validators.minLength(3)]],
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(6)]],
      confirmar_contrasena: ['', Validators.required],
      rol_id: ['', Validators.required],
      area_id: ['', Validators.required]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('contrasena');
    const confirmPassword = form.get('confirmar_contrasena');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  getEmailError(): string {
    const emailControl = this.usuarioForm.get('correo');
    if (emailControl?.hasError('required')) {
      return 'El correo es requerido';
    }
    if (emailControl?.hasError('email')) {
      return 'Ingrese un correo válido';
    }
    return '';
  }

  onSubmit(): void {
    if (this.usuarioForm.valid) {
      this.loading = true;
      const { confirmar_contrasena, ...data } = this.usuarioForm.value;
      const usuarioData: UsuarioCreate = data;

      this.usuarioService.create(usuarioData).subscribe({
        next: (response) => {
          if (response.success) {
            this.notificacionService.success(
              response.message || MENSAJES.SUCCESS.CREAR
            );
            this.router.navigate(['/usuarios']);
          }
        },
        error: (error) => {
          console.error('Error al crear usuario:', error);
          this.notificacionService.error(
            error.error?.message || MENSAJES.ERROR.GENERIC
          );
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
        }
      });
    } else {
      this.usuarioForm.markAllAsTouched();
      this.notificacionService.warning(MENSAJES.ERROR.CAMPOS_REQUERIDOS);
    }
  }

  volver(): void {
    this.router.navigate(['/usuarios']);
  }
}
