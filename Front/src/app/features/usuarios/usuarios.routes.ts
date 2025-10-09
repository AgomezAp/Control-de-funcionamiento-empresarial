import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';
import { RoleEnum } from '../../core/models/role.model';

export const USUARIOS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [roleGuard],
    data: { 
      breadcrumb: 'Usuarios',
      roles: [RoleEnum.ADMIN, RoleEnum.DIRECTIVO, RoleEnum.LIDER]
    },
    loadComponent: () =>
      import('./components/lista-usuarios/lista-usuarios.component').then(
        (m) => m.ListaUsuariosComponent
      )
  },
  {
    path: 'crear',
    canActivate: [roleGuard],
    data: { 
      breadcrumb: 'Crear Usuario',
      roles: [RoleEnum.ADMIN]
    },
    loadComponent: () =>
      import('./components/crear-usuario/crear-usuario.component').then(
        (m) => m.CrearUsuarioComponent
      )
  },
  {
    path: ':id',
    canActivate: [roleGuard],
    data: { 
      breadcrumb: 'Perfil Usuario',
      roles: [RoleEnum.ADMIN, RoleEnum.DIRECTIVO, RoleEnum.LIDER]
    },
    loadComponent: () =>
      import('./components/perfil-usuario/perfil-usuario.component').then(
        (m) => m.PerfilUsuarioComponent
      )
  },
  {
    path: ':id/editar',
    canActivate: [roleGuard],
    data: { 
      breadcrumb: 'Editar Usuario',
      roles: [RoleEnum.ADMIN, RoleEnum.DIRECTIVO]
    },
    loadComponent: () =>
      import('./components/editar-usuario/editar-usuario.component').then(
        (m) => m.EditarUsuarioComponent
      )
  }
];
