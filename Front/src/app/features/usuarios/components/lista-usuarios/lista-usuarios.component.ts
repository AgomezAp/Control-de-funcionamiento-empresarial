import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

// PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { ToolbarModule } from 'primeng/toolbar';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';

// Services
import { UsuarioService } from '../../../../core/services/usuario.service';
import { WebsocketService } from '../../../../core/services/websocket.service';

// Models
import { Usuario } from '../../../../core/models/usuario.model';
import { RoleEnum } from '../../../../core/models/role.model';
import { EstadoPresencia, getEstadoPresenciaConfig } from '../../../../core/models/estado-presencia.model';

// Directives
import { HasRoleDirective } from '../../../../shared/directives/has-role.directive';

// Components
import { LoaderComponent } from '../../../../shared/components/loader/loader/loader.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state/empty-state.component';

@Component({
  selector: 'app-lista-usuarios',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    CardModule,
    ToolbarModule,
    ToastModule,
    TagModule,
    TooltipModule,
    HasRoleDirective,
    LoaderComponent,
    EmptyStateComponent,
  ],
  providers: [MessageService],
  templateUrl: './lista-usuarios.component.html',
  styleUrls: ['./lista-usuarios.component.css'],
})
export class ListaUsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  loading = false;
  RoleEnum = RoleEnum;
  usuariosConectados: Set<number> = new Set(); // Set de IDs de usuarios conectados
  estadosPresencia: Map<number, EstadoPresencia> = new Map(); // Map de uid -> estado_presencia

  constructor(
    private usuarioService: UsuarioService,
    private router: Router,
    private messageService: MessageService,
    private websocketService: WebsocketService
  ) {}

  ngOnInit(): void {
    this.loadUsuarios();
    this.subscribeToWebSocketEvents();
  }

  /**
   * Suscribirse a eventos de WebSocket para usuarios conectados
   */
  subscribeToWebSocketEvents(): void {
    // Escuchar lista completa de usuarios conectados
    this.websocketService.onUsuariosConectados().subscribe({
      next: (usuariosIds: number[]) => {
        this.usuariosConectados = new Set(usuariosIds);
        console.log('👥 Usuarios conectados actualizados:', usuariosIds);
      },
      error: (error: any) => {
        console.error('Error al recibir usuarios conectados:', error);
      }
    });

    // Escuchar cuando un usuario se conecta
    this.websocketService.onUsuarioOnline().subscribe({
      next: (data: { userId: number }) => {
        this.usuariosConectados.add(data.userId);
        console.log('✅ Usuario conectado:', data.userId);
      }
    });

    // Escuchar cuando un usuario se desconecta
    this.websocketService.onUsuarioOffline().subscribe({
      next: (data: { userId: number }) => {
        this.usuariosConectados.delete(data.userId);
        console.log('❌ Usuario desconectado:', data.userId);
      }
    });

    // Escuchar cambios de estado de presencia
    this.websocketService.onCambioEstadoPresencia().subscribe({
      next: (data: { userId: number; estadoPresencia: string }) => {
        console.log('🔄 Cambio estado presencia recibido:', data);
        const usuario = this.usuarios.find((u) => u.uid === data.userId);
        if (usuario) {
          usuario.estado_presencia = data.estadoPresencia as EstadoPresencia;
          this.estadosPresencia.set(data.userId, data.estadoPresencia as EstadoPresencia);
        }
      },
      error: (error: any) => {
        console.error('❌ Error al recibir cambio estado presencia:', error);
      },
    });
  }

  loadUsuarios(): void {
    this.loading = true;
    this.usuarioService.getAll().subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.usuarios = response.data;
        }
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error al cargar usuarios:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los usuarios',
        });
        this.loading = false;
      },
    });
  }

  getRoleSeverity(rol: string): 'success' | 'info' | 'warning' | 'danger' {
    switch (rol) {
      case 'Admin':
        return 'danger';
      case 'Directivo':
        return 'warning';
      case 'Líder':
        return 'info';
      default:
        return 'success';
    }
  }

  /**
   * Obtener la configuración del estado de presencia de un usuario
   */
  getEstadoPresenciaConfig(usuario: Usuario) {
    return getEstadoPresenciaConfig(usuario.estado_presencia || EstadoPresencia.ACTIVO);
  }

  /**
   * Obtener el color del estado de presencia considerando status del sistema y conexión
   */
  getColorEstadoPresencia(usuario: Usuario): string {
    // Si el usuario está deshabilitado en el sistema (status = false)
    if (!usuario.status) {
      return '#6B7280'; // Gris - Inactivo del sistema
    }

    // Si el usuario no está conectado
    if (!this.isUsuarioConectado(usuario.uid)) {
      return '#6B7280'; // Gris - Desconectado
    }

    // Obtener color según estado de presencia
    const config = this.getEstadoPresenciaConfig(usuario);
    return config.colorHex;
  }

  /**
   * Obtener el label del estado considerando status y conexión
   */
  getLabelEstadoPresencia(usuario: Usuario): string {
    if (!usuario.status) {
      return 'Inactivo (Sistema)';
    }

    if (!this.isUsuarioConectado(usuario.uid)) {
      return 'Desconectado';
    }

    const config = this.getEstadoPresenciaConfig(usuario);
    return config.label;
  }

  /**
   * Obtener el tooltip del estado de presencia
   */
  getTooltipEstadoPresencia(usuario: Usuario): string {
    if (!usuario.status) {
      return 'Usuario deshabilitado por el administrador';
    }

    if (!this.isUsuarioConectado(usuario.uid)) {
      return 'Usuario desconectado de la aplicación';
    }

    const config = this.getEstadoPresenciaConfig(usuario);
    return config.descripcion || config.label;
  }

  crearUsuario(): void {
    this.router.navigate(['/usuarios/crear']);
  }

  verPerfil(uid: number): void {
    this.router.navigate(['/usuarios', uid]);
  }

  editarUsuario(uid: number): void {
    this.router.navigate(['/usuarios', uid, 'editar']);
  }

  /**
   * Verificar si un usuario está conectado en línea
   */
  isUsuarioConectado(uid: number): boolean {
    return this.usuariosConectados.has(uid);
  }
}
