import { Routes } from '@angular/router';
import { ListaPeticionesComponent } from './components/lista-peticiones/lista-peticiones/lista-peticiones.component';

export const PETICIONES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/lista-peticiones/lista-peticiones/lista-peticiones.component')
      .then(m => m.ListaPeticionesComponent),
    data: { breadcrumb: 'Peticiones' }
  },

];