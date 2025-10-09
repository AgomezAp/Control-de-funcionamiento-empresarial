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
import { MessageService } from 'primeng/api';

// Services
import { UsuarioService } from '../../../../core/services/usuario.service';

// Models
import { Usuario } from '../../../../core/models/usuario.model';
import { RoleEnum } from '../../../../core/models/role.model';

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

  constructor(
    private usuarioService: UsuarioService,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadUsuarios();
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

  crearUsuario(): void {
    this.router.navigate(['/usuarios/crear']);
  }

  verPerfil(uid: number): void {
    this.router.navigate(['/usuarios', uid]);
  }

  editarUsuario(uid: number): void {
    this.router.navigate(['/usuarios', uid, 'editar']);
  }
}
