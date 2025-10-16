import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { UsuarioService } from '../../../../core/services/usuario.service';
import { NotificacionService } from '../../../../core/services/notificacion.service';
import { UsuarioCreate } from '../../../../core/models/usuario.model';
import { RoleEnum } from '../../../../core/models/role.model';
import { AreaEnum } from '../../../../core/models/area.model';
import { MENSAJES } from '../../../../core/constants/mensajes.constants';

@Component({
  selector: 'app-crear-usuario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './crear-usuario.component.html',
  styleUrls: ['./crear-usuario.component.css'],
})
export class CrearUsuarioComponent implements OnInit {
  private fb = inject(FormBuilder);
  private usuarioService = inject(UsuarioService);
  private notificacionService = inject(NotificacionService);
  private router = inject(Router);

  usuarioForm!: FormGroup;
  loading = false;

  // ⭐ AGREGAR ESTAS PROPIEDADES PARA PASSWORD TOGGLE
  showPassword = false;
  showConfirmPassword = false;

  roles = [
    { label: RoleEnum.ADMIN, value: 1 },
    { label: RoleEnum.DIRECTIVO, value: 2 },
    { label: RoleEnum.LIDER, value: 3 },
    { label: RoleEnum.USUARIO, value: 4 },
  ];

  areas = [
    { label: AreaEnum.GESTION_ADMINISTRATIVA, value: 1 },
    { label: AreaEnum.PAUTAS, value: 2 },
    { label: AreaEnum.DISENO, value: 3 },
    { label: AreaEnum.CONTABILIDAD, value: 4 },
    { label: AreaEnum.PROGRAMACION, value: 5 },
  ];

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.usuarioForm = this.fb.group(
      {
        nombre_completo: ['', [Validators.required, Validators.minLength(3)]],
        correo: ['', [Validators.required, Validators.email]],
        contrasena: ['', [Validators.required, Validators.minLength(6)]],
        confirmar_contrasena: ['', Validators.required],
        rol_id: ['', Validators.required],
        area_id: ['', Validators.required],
      },
      {
        validators: this.passwordMatchValidator,
      }
    );
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('contrasena');
    const confirmPassword = form.get('confirmar_contrasena');

    if (
      password &&
      confirmPassword &&
      password.value !== confirmPassword.value
    ) {
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

  // ⭐ AGREGAR ESTOS MÉTODOS PARA TOGGLE PASSWORD
  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
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
        },
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
