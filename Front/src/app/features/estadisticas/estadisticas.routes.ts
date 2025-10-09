import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';
import { RoleEnum } from '../../core/models/role.model';

export const ESTADISTICAS_ROUTES: Routes = [
  {
    path: 'mis-estadisticas',
    loadComponent: () =>
      import('./components/mis-estadisticas/mis-estadisticas.component').then(
        (m) => m.MisEstadisticasComponent
      ),
    data: { breadcrumb: 'Mis Estadísticas' }
  },
  {
    path: 'area',
    canActivate: [roleGuard],
    data: { 
      breadcrumb: 'Estadísticas por Área',
      roles: [RoleEnum.ADMIN, RoleEnum.DIRECTIVO, RoleEnum.LIDER]
    },
    loadComponent: () =>
      import('./components/area-estadisticas/area-estadisticas.component').then(
        (m) => m.AreaEstadisticasComponent
      )
  },
  {
    path: 'globales',
    canActivate: [roleGuard],
    data: { 
      breadcrumb: 'Estadísticas Globales',
      roles: [RoleEnum.ADMIN, RoleEnum.DIRECTIVO]
    },
    loadComponent: () =>
      import('./components/globales-estadisticas/globales-estadisticas.component').then(
        (m) => m.GlobalesEstadisticasComponent
      )
  },
  {
    path: '',
    redirectTo: 'mis-estadisticas',
    pathMatch: 'full'
  }
];
