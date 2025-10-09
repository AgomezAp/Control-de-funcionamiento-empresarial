import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';
import { RoleEnum } from '../../core/models/role.model';

export const FACTURACION_ROUTES: Routes = [
  {
    path: 'resumen',
    canActivate: [roleGuard],
    data: { 
      breadcrumb: 'Resumen de Facturación',
      roles: [RoleEnum.ADMIN, RoleEnum.DIRECTIVO]
    },
    loadComponent: () =>
      import('./components/resumen-facturacion/resumen-facturacion.component').then(
        (m) => m.ResumenFacturacionComponent
      )
  },
  {
    path: 'generar',
    canActivate: [roleGuard],
    data: { 
      breadcrumb: 'Generar Facturación',
      roles: [RoleEnum.ADMIN, RoleEnum.DIRECTIVO]
    },
    loadComponent: () =>
      import('./components/generar-facturacion/generar-facturacion.component').then(
        (m) => m.GenerarFacturacionComponent
      )
  },
  {
    path: '',
    redirectTo: 'resumen',
    pathMatch: 'full'
  }
];
