import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { ClienteService } from '../../../../core/services/cliente.service';
import { UsuarioService } from '../../../../core/services/usuario.service';
import { NotificacionService } from '../../../../core/services/notificacion.service';
import { ClienteCreate } from '../../../../core/models/cliente.model';
import { Usuario } from '../../../../core/models/usuario.model';
import { MENSAJES } from '../../../../core/constants/mensajes.constants';

@Component({
  selector: 'app-crear-cliente',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    ButtonModule,
    CalendarModule,
    DropdownModule,
  ],
  templateUrl: './crear-cliente.component.html',
  styleUrls: ['./crear-cliente.component.css'],
})
export class CrearClienteComponent implements OnInit {
  private fb = inject(FormBuilder);
  private clienteService = inject(ClienteService);
  private usuarioService = inject(UsuarioService);
  private notificacionService = inject(NotificacionService);
  private router = inject(Router);

  clienteForm!: FormGroup;
  loading = false;
  pautadores: Usuario[] = [];
  disenadores: Usuario[] = [];

  paises = [
    { nombre: 'Colombia', codigo: 'CO' },
    { nombre: 'México', codigo: 'MX' },
    { nombre: 'Argentina', codigo: 'AR' },
    { nombre: 'Chile', codigo: 'CL' },
    { nombre: 'Perú', codigo: 'PE' },
    { nombre: 'Ecuador', codigo: 'EC' },
    { nombre: 'España', codigo: 'ES' },
    { nombre: 'Estados Unidos', codigo: 'US' },
  ];

  ngOnInit(): void {
    this.initForm();
    this.cargarUsuarios();
  }

  initForm(): void {
    this.clienteForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      pais: ['', Validators.required],
      pautador_id: ['', Validators.required],
      disenador_id: [''],
      fecha_inicio: ['', Validators.required],
    });
  }

  cargarUsuarios(): void {
    this.usuarioService.getAll().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const usuariosActivos = response.data.filter((u) => u.status);
          this.pautadores = usuariosActivos;
          this.disenadores = usuariosActivos;
        }
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
        this.notificacionService.error('Error al cargar la lista de usuarios');
      },
    });
  }

  onSubmit(): void {
    if (this.clienteForm.valid) {
      this.loading = true;
      const data: ClienteCreate = this.clienteForm.value;

      this.clienteService.create(data).subscribe({
        next: (response) => {
          if (response.success) {
            this.notificacionService.success(
              response.message || MENSAJES.SUCCESS.CREAR
            );
            this.router.navigate(['/clientes']);
          }
        },
        error: (error) => {
          console.error('Error al crear cliente:', error);
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
      this.clienteForm.markAllAsTouched();
      this.notificacionService.warning(
        'Por favor, complete todos los campos requeridos'
      );
    }
  }

  volver(): void {
    this.router.navigate(['/clientes']);
  }
}
