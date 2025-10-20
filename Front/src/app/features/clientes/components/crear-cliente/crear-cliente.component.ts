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
import { ClienteCreate, TipoCliente, TipoPersona } from '../../../../core/models/cliente.model';
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

  tiposCliente = [
    { label: 'Meta Ads', value: TipoCliente.META_ADS },
    { label: 'Google Ads', value: TipoCliente.GOOGLE_ADS },
    { label: 'Externo', value: TipoCliente.EXTERNO },
    { label: 'Otro', value: TipoCliente.OTRO },
  ];

  tiposPersona = [
    { label: 'Natural', value: TipoPersona.NATURAL },
    { label: 'Jurídica', value: TipoPersona.JURIDICA },
  ];

  ngOnInit(): void {
    this.initForm();
    this.cargarUsuarios();
  }

  initForm(): void {
    this.clienteForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      cedula: ['', [Validators.minLength(5), Validators.maxLength(50), Validators.pattern(/^[a-zA-Z0-9\-]+$/)]],
      tipo_persona: [TipoPersona.NATURAL, Validators.required],
      telefono: ['', [Validators.maxLength(20)]],
      correo: ['', [Validators.email, Validators.maxLength(100)]],
      ciudad: ['', [Validators.maxLength(100)]],
      direccion: ['', [Validators.maxLength(500)]],
      pais: ['', Validators.required],
      tipo_cliente: ['', Validators.required],
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
          
          // Filtrar solo pautadores (área = "Pautas")
          this.pautadores = usuariosActivos.filter(
            (u) => u.area?.nombre === 'Pautas'
          );
          
          // Filtrar solo diseñadores (área = "Diseño")
          this.disenadores = usuariosActivos.filter(
            (u) => u.area?.nombre === 'Diseño'
          );
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
      const data: ClienteCreate = {
        ...this.clienteForm.value,
        // Si disenador_id está vacío, enviarlo como undefined para que no se incluya
        disenador_id: this.clienteForm.value.disenador_id || undefined,
      };

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
