import { Routes } from '@angular/router';
import { RoleEnum } from '../../core/models/role.model';
import { DashboardContainerComponent } from '../../components/dashboard-container/dashboard-container/dashboard-container.component';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('../../components/dashboard-container/dashboard-container/dashboard-container.component')
      .then(m => m.DashboardContainerComponent),
    data: { breadcrumb: 'Dashboard' }
  },
 
];