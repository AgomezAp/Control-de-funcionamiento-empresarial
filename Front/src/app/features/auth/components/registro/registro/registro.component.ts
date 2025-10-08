import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MENSAJES } from '../../../../../core/constants/mensajes.constants';
import { AREAS } from '../../../../../core/constants/areas.constants';
import { ROLES } from '../../../../../core/constants/role.constants';
import { NotificacionService } from '../../../../../core/services/notificacion.service';
import { AuthService } from '../../../../../core/services/auth.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    CardModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    DropdownModule,
  ],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css',
})
export class RegistroComponent {
  registroForm!: FormGroup;
  loading: boolean = false;
  roles: any[] = [];
  areas: any[] = [];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notificacionService: NotificacionService,
    private router: Router
  ) {
    this.initForm();
    this.loadRolesAndAreas();
  }

  initForm(): void {
    this.registroForm = this.fb.group({
      nombre_completo: ['', [Validators.required, Validators.minLength(3)]],
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(6)]],
      confirmar_contrasena: ['', [Validators.required]],
      rol_id: [null, [Validators.required]],
      area_id: [null, [Validators.required]],
    });
  }

  loadRolesAndAreas(): void {
    this.roles = Object.values(ROLES).map((rol) => ({
      label: rol.nombre,
      value: rol.id,
    }));

    this.areas = Object.values(AREAS).map((area) => ({
      label: area.nombre,
      value: area.id,
    }));
  }

  onSubmit(): void {
    if (this.registroForm.invalid) {
      this.registroForm.markAllAsTouched();
      return;
    }

    if (
      this.registroForm.value.contrasena !==
      this.registroForm.value.confirmar_contrasena
    ) {
      this.notificacionService.error('Las contraseñas no coinciden');
      return;
    }

    this.loading = true;
    const { confirmar_contrasena, ...data } = this.registroForm.value;

    this.authService.register(data).subscribe({
      next: (response:any) => {
        this.loading = false;
        if (response.success) {
          this.notificacionService.success('Usuario registrado exitosamente');
          this.router.navigate(['/auth/login']);
        }
      },
      error: (error:any) => {
        this.loading = false;
        this.notificacionService.error(error.message || MENSAJES.ERROR.GENERIC);
      },
    });
  }

  hasError(field: string, error: string): boolean {
    const control = this.registroForm.get(field);
    return !!(
      control &&
      control.hasError(error) &&
      (control.dirty || control.touched)
    );
  }
}
