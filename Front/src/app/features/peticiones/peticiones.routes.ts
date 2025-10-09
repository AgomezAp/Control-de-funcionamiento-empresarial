import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const PETICIONES_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'todas',
        pathMatch: 'full'
      },
      {
        path: 'todas',
        loadComponent: () =>
          import('./components/lista-peticiones/lista-peticiones/lista-peticiones.component').then(
            (m) => m.ListaPeticionesComponent
          ),
        data: { breadcrumb: 'Todas' }
      },
      {
        path: 'crear-nueva',
        loadComponent: () =>
          import('./components/crear-peticion/crear-peticion/crear-peticion.component').then(
            (m) => m.CrearPeticionComponent
          ),
        data: { breadcrumb: 'Crear Nueva' }
      },
      {
        path: 'pendientes',
        loadComponent: () =>
          import('./components/lista-peticiones/lista-peticiones/lista-peticiones.component').then(
            (m) => m.ListaPeticionesComponent
          ),
        data: { breadcrumb: 'Pendientes', estado: 'Pendiente' }
      },
      {
        path: 'en-progreso',
        loadComponent: () =>
          import('./components/lista-peticiones/lista-peticiones/lista-peticiones.component').then(
            (m) => m.ListaPeticionesComponent
          ),
        data: { breadcrumb: 'En Progreso', estado: 'En Progreso' }
      },
      {
        path: 'historico',
        loadComponent: () =>
          import('./components/historico-peticiones/historico-peticiones/historico-peticiones.component').then(
            (m) => m.HistoricoPeticionesComponent
          ),
        data: { breadcrumb: 'Histórico' }
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./components/detalle-peticion/detalle-peticion/detalle-peticion.component').then(
            (m) => m.DetallePeticionComponent
          ),
        data: { breadcrumb: 'Detalle' }
      },
      {
        path: ':id/aceptar',
        loadComponent: () =>
          import('./components/aceptar-peticion/aceptar-peticion/aceptar-peticion.component').then(
            (m) => m.AceptarPeticionComponent
          ),
        data: { breadcrumb: 'Aceptar Petición' }
      }
    ]
  }
];