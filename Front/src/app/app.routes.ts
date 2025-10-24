import { Routes } from '@angular/router';
import { noAuthGuard } from './core/guards/no-auth.guard';
import { authGuard } from './core/guards/auth.guard';
import { RoleEnum } from './core/models/role.model';
import { roleGuard } from './core/guards/role.guard';
import { MainLayoutComponent } from './layouts/main-layout/main-layout/main-layout.component';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './core/services/auth.service';

export const routes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    canActivateChild: [
      () => {
        const authService = inject(AuthService);
        const router = inject(Router);
        const currentUser = authService.getCurrentUser();
        
        // Si es Gestión Administrativa, redirigir a peticiones
        if (currentUser?.area === 'Gestión Administrativa') {
          return router.createUrlTree(['/peticiones']);
        }
        
        // Para otros usuarios, redirigir a dashboard
        return router.createUrlTree(['/dashboard']);
      }
    ],
    children: [],
  },

  // Rutas públicas (Login, Registro)
  {
    path: 'auth',
    canActivate: [noAuthGuard],
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
    data: { breadcrumb: 'Autenticación' },
  },

  // Rutas protegidas con MainLayout
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layouts/main-layout/main-layout/main-layout.component').then(
        (m) => m.MainLayoutComponent
      ),
    children: [
      // Dashboard
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes').then(
            (m) => m.DASHBOARD_ROUTES
          ),
        data: { breadcrumb: 'Dashboard' },
      },

      // Peticiones
      {
        path: 'peticiones',
        loadChildren: () =>
          import('./features/peticiones/peticiones.routes').then(
            (m) => m.PETICIONES_ROUTES
          ),
        data: { breadcrumb: 'Peticiones' },
      },

      // Clientes
      {
        path: 'clientes',
        loadChildren: () =>
          import('./features/clientes/clientes.routes').then(
            (m) => m.CLIENTES_ROUTES
          ),
        data: { breadcrumb: 'Clientes' },
      },

      // Usuarios (Admin, Directivo, Líder)
      {
        path: 'usuarios',
        canActivate: [roleGuard],
        data: { 
          roles: [RoleEnum.ADMIN, RoleEnum.DIRECTIVO, RoleEnum.LIDER]
        },
        loadChildren: () =>
          import('./features/usuarios/usuarios.routes').then(
            (m) => m.USUARIOS_ROUTES
          ),
      },

      // Estadísticas
      {
        path: 'estadisticas',
        loadChildren: () =>
          import('./features/estadisticas/estadisticas.routes').then(
            (m) => m.ESTADISTICAS_ROUTES
          ),
        data: { breadcrumb: 'Estadísticas' }
      },

      // Facturación (Admin, Directivo)
      {
        path: 'facturacion',
        canActivate: [roleGuard],
        data: { 
          breadcrumb: 'Facturación',
          roles: [RoleEnum.ADMIN, RoleEnum.DIRECTIVO]
        },
        loadChildren: () =>
          import('./features/facturacion/facturacion.routes').then(
            (m) => m.FACTURACION_ROUTES
          )
      },

      // Notificaciones
      {
        path: 'notificaciones',
        loadComponent: () =>
          import('./shared/components/notification-center/notification-center/notification-center.component').then(
            (m) => m.NotificationCenterComponent
          ),
        data: { breadcrumb: 'Notificaciones' }
      },

      // Perfil de usuario
      {
        path: 'perfil',
        loadComponent: () =>
          import('./features/usuarios/components/perfil-usuario/perfil-usuario.component').then(
            (m) => m.PerfilUsuarioComponent
          ),
        data: { breadcrumb: 'Mi Perfil' }
      },

      // Configuración (Solo Admin)
      {
        path: 'configuracion',
        canActivate: [roleGuard],
        data: { 
          breadcrumb: 'Configuración',
          roles: [RoleEnum.ADMIN]
        },
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes').then(
            (m) => m.DASHBOARD_ROUTES
          ),
      },
    ],
  },

  // Ruta 404
  {
    path: '**',
    redirectTo: 'dashboard'
  },
];
