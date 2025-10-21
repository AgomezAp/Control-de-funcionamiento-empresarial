import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

// PrimeNG
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputSwitchModule } from 'primeng/inputswitch';
import { SkeletonModule } from 'primeng/skeleton';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';

// Services
import { UsuarioService } from '../../../../core/services/usuario.service';
import { NotificacionService } from '../../../../core/services/notificacion.service';

// Models
import { Usuario, UsuarioUpdate } from '../../../../core/models/usuario.model';
import { RoleEnum } from '../../../../core/models/role.model';
import { AreaEnum } from '../../../../core/models/area.model';

// Constants
import { MENSAJES } from '../../../../core/constants/mensajes.constants';
import { LoaderComponent } from '../../../../shared/components/loader/loader/loader.component';

@Component({
  selector: 'app-editar-usuario',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    ButtonModule,
    DropdownModule,
    InputSwitchModule,
    SkeletonModule,
    PasswordModule,
    CheckboxModule,
    LoaderComponent
  ],
  templateUrl: './editar-usuario.component.html',
  styleUrls: ['./editar-usuario.component.css'],
})
export class EditarUsuarioComponent implements OnInit {
  private fb = inject(FormBuilder);
  private usuarioService = inject(UsuarioService);
  private notificacionService = inject(NotificacionService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  showNewPassword = false;
  showConfirmPassword = false;

  usuarioForm!: FormGroup;
  usuarioId!: number;
  usuario?: Usuario;
  cargando = false;
  guardando = false;

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
    this.usuarioId = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.usuarioId) {
      this.notificacionService.error('ID de usuario inválido');
      this.volver();
      return;
    }

    this.initForm();
    this.cargarUsuario();
    this.setupPasswordValidation();
  }

  initForm(): void {
    this.usuarioForm = this.fb.group({
      nombre_completo: ['', [Validators.required, Validators.minLength(3)]],
      correo: ['', [Validators.required, Validators.email]],
      cambiar_contrasena: [false],
      nueva_contrasena: [''],
      confirmar_nueva_contrasena: [''],
      rol_id: ['', Validators.required],
      area_id: ['', Validators.required],
      status: [true],
    });
  }

  setupPasswordValidation(): void {
    this.usuarioForm
      .get('cambiar_contrasena')
      ?.valueChanges.subscribe((cambiar) => {
        const nuevaPass = this.usuarioForm.get('nueva_contrasena');
        const confirmarPass = this.usuarioForm.get(
          'confirmar_nueva_contrasena'
        );

        if (cambiar) {
          nuevaPass?.setValidators([
            Validators.required,
            Validators.minLength(6),
          ]);
          confirmarPass?.setValidators([Validators.required]);
        } else {
          nuevaPass?.clearValidators();
          confirmarPass?.clearValidators();
          nuevaPass?.reset();
          confirmarPass?.reset();
        }

        nuevaPass?.updateValueAndValidity();
        confirmarPass?.updateValueAndValidity();
      });

    // Validar que las contraseñas coincidan
    this.usuarioForm
      .get('confirmar_nueva_contrasena')
      ?.valueChanges.subscribe(() => {
        const nueva = this.usuarioForm.get('nueva_contrasena')?.value;
        const confirmar = this.usuarioForm.get(
          'confirmar_nueva_contrasena'
        )?.value;

        if (nueva !== confirmar) {
          this.usuarioForm
            .get('confirmar_nueva_contrasena')
            ?.setErrors({ passwordMismatch: true });
        }
      });
  }

  cargarUsuario(): void {
    this.cargando = true;
    this.usuarioService.getById(this.usuarioId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.usuario = response.data;
          this.usuarioForm.patchValue({
            nombre_completo: this.usuario.nombre_completo,
            correo: this.usuario.correo,
            rol_id: this.usuario.rol_id,
            area_id: this.usuario.area_id,
            status: this.usuario.status,
          });
        }
      },
      error: (error) => {
        console.error('Error al cargar usuario:', error);
        this.notificacionService.error('Error al cargar los datos del usuario');
        this.volver();
      },
      complete: () => {
        this.cargando = false;
      },
    });
  }

  onSubmit(): void {
    if (this.usuarioForm.valid) {
      this.guardando = true;
      const {
        cambiar_contrasena,
        confirmar_nueva_contrasena,
        nueva_contrasena,
        ...data
      } = this.usuarioForm.value;

      const usuarioUpdate: UsuarioUpdate = {
        ...data,
        ...(cambiar_contrasena && nueva_contrasena
          ? { contrasena: nueva_contrasena }
          : {}),
      };

      this.usuarioService.update(this.usuarioId, usuarioUpdate).subscribe({
        next: (response) => {
          if (response.success) {
            this.notificacionService.success(
              response.message || MENSAJES.SUCCESS.ACTUALIZAR
            );
            this.router.navigate(['/usuarios']);
          }
        },
        error: (error) => {
          console.error('Error al actualizar usuario:', error);
          this.notificacionService.error(
            error.error?.message || MENSAJES.ERROR.GENERIC
          );
          this.guardando = false;
        },
        complete: () => {
          this.guardando = false;
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
