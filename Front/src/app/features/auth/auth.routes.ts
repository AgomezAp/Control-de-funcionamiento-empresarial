import { Routes } from '@angular/router';


export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () => import('../../components/login/login/login.component').then(m => m.LoginComponent),
    data: { breadcrumb: 'Login' }
  },

  {
    path: 'registro',
    loadComponent: () => import('./components/registro/registro/registro.component').then(m => m.RegistroComponent),
    data: { breadcrumb: 'Registro' }
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];