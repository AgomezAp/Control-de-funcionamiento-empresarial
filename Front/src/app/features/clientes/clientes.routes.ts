import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { roleGuard } from '../../core/guards/role.guard';
import { RoleEnum } from '../../core/models/role.model';

export const CLIENTES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/lista-clientes/lista-clientes.component').then(
        (m) => m.ListaClientesComponent
      ),
    data: { breadcrumb: 'Lista de Clientes' }
  },
  {
    path: 'crear',
    canActivate: [roleGuard],
    data: { 
      breadcrumb: 'Crear Cliente',
      roles: [RoleEnum.ADMIN, RoleEnum.DIRECTIVO, RoleEnum.LIDER]
    },
    loadComponent: () =>
      import('./components/crear-cliente/crear-cliente.component').then(
        (m) => m.CrearClienteComponent
      )
  },
  {
    path: ':id',
    data: { breadcrumb: 'Detalle Cliente' },
    loadComponent: () =>
      import('./components/detalle-cliente/detalle-cliente.component').then(
        (m) => m.DetalleClienteComponent
      )
  },
  {
    path: ':id/editar',
    canActivate: [roleGuard],
    data: { 
      breadcrumb: 'Editar Cliente',
      roles: [RoleEnum.ADMIN, RoleEnum.DIRECTIVO, RoleEnum.LIDER]
    },
    loadComponent: () =>
      import('./components/editar-cliente/editar-cliente.component').then(
        (m) => m.EditarClienteComponent
      )
  }
];
