import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardReportesComponent } from './pages/dashboard-reportes/dashboard-reportes.component';
import { CrearReporteComponent } from './pages/crear-reporte/crear-reporte.component';
import { ListaReportesComponent } from './pages/lista-reportes/lista-reportes.component';
import { DetalleReporteComponent } from './pages/detalle-reporte/detalle-reporte.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    component: DashboardReportesComponent,
    data: { title: 'Dashboard de Reportes' }
  },
  {
    path: 'crear',
    component: CrearReporteComponent,
    data: { title: 'Crear Reporte' }
  },
  {
    path: 'lista',
    component: ListaReportesComponent,
    data: { title: 'Lista de Reportes' }
  },
  {
    path: 'detalle/:id',
    component: DetalleReporteComponent,
    data: { title: 'Detalle del Reporte' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportesClientesRoutingModule { }
