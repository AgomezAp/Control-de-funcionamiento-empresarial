import { Routes } from '@angular/router';
import { noAuthGuard } from './core/guards/no-auth.guard';
import { authGuard } from './core/guards/auth.guard';
import { RoleEnum } from './core/models/role.model';
import { roleGuard } from './core/guards/role.guard';
import { MainLayoutComponent } from './layouts/main-layout/main-layout/main-layout.component';
export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },

  // Rutas públicas
  {
    path: 'auth',
    canActivate: [noAuthGuard],
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
    data: { breadcrumb: 'Autenticación' },
  },

  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layouts/main-layout/main-layout/main-layout.component').then(
        (m) => m.MainLayoutComponent
      ),
    children: [
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes').then(
            (m) => m.DASHBOARD_ROUTES
          ),
        data: { breadcrumb: 'Dashboard' },
      },
      {
        path: 'peticiones',
        loadChildren: () =>
          import('./features/peticiones/peticiones.routes').then(
            (m) => m.PETICIONES_ROUTES
          ),
        data: { breadcrumb: 'Peticiones' },
      },
    ],
  },

  // Ruta 404
  {
    path: '**',
    redirectTo: 'dashboard'
  },
];
