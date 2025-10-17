import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { InputSwitchModule } from 'primeng/inputswitch';
import { SkeletonModule } from 'primeng/skeleton';
import { ClienteService } from '../../../../core/services/cliente.service';
import { UsuarioService } from '../../../../core/services/usuario.service';
import { NotificacionService } from '../../../../core/services/notificacion.service';
import { Cliente, ClienteUpdate, TipoCliente } from '../../../../core/models/cliente.model';
import { Usuario } from '../../../../core/models/usuario.model';
import { MENSAJES } from '../../../../core/constants/mensajes.constants';

@Component({
  selector: 'app-editar-cliente',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    ButtonModule,
    CalendarModule,
    DropdownModule,
    InputSwitchModule,
    SkeletonModule,
  ],
  templateUrl: './editar-cliente.component.html',
  styleUrls: ['./editar-cliente.component.css'],
})
export class EditarClienteComponent implements OnInit {
  private fb = inject(FormBuilder);
  private clienteService = inject(ClienteService);
  private usuarioService = inject(UsuarioService);
  private notificacionService = inject(NotificacionService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  clienteForm!: FormGroup;
  clienteId!: number;
  cliente?: Cliente;
  cargando = false;
  guardando = false;
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

  ngOnInit(): void {
    this.clienteId = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.clienteId) {
      this.notificacionService.error('ID de cliente inválido');
      this.volver();
      return;
    }

    this.initForm();
    this.cargarUsuarios();
    this.cargarCliente();
  }

  initForm(): void {
    this.clienteForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      cedula: ['', [Validators.minLength(5), Validators.maxLength(50), Validators.pattern(/^[a-zA-Z0-9\-]+$/)]],
      pais: ['', Validators.required],
      tipo_cliente: ['', Validators.required],
      pautador_id: ['', Validators.required],
      disenador_id: [''],
      fecha_inicio: ['', Validators.required],
      status: [true],
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
      },
    });
  }

  cargarCliente(): void {
    this.cargando = true;
    this.clienteService.getById(this.clienteId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.cliente = response.data;
          this.clienteForm.patchValue({
            nombre: this.cliente.nombre,
            pais: this.cliente.pais,
            tipo_cliente: this.cliente.tipo_cliente,
            pautador_id: this.cliente.pautador_id,
            disenador_id: this.cliente.disenador_id,
            fecha_inicio: new Date(this.cliente.fecha_inicio),
            status: this.cliente.status,
          });
        }
      },
      error: (error) => {
        console.error('Error al cargar cliente:', error);
        this.notificacionService.error('Error al cargar los datos del cliente');
        this.volver();
      },
      complete: () => {
        this.cargando = false;
      },
    });
  }

  onSubmit(): void {
    if (this.clienteForm.valid) {
      this.guardando = true;
      const data: ClienteUpdate = this.clienteForm.value;

      this.clienteService.update(this.clienteId, data).subscribe({
        next: (response) => {
          if (response.success) {
            this.notificacionService.success(
              response.message || MENSAJES.SUCCESS.ACTUALIZAR
            );
            this.router.navigate(['/clientes']);
          }
        },
        error: (error) => {
          console.error('Error al actualizar cliente:', error);
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
      this.clienteForm.markAllAsTouched();
      this.notificacionService.warning(MENSAJES.ERROR.CAMPOS_REQUERIDOS);
    }
  }

  volver(): void {
    this.router.navigate(['/clientes']);
  }
}
