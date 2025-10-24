import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// PrimeNG Modules
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextarea } from 'primeng/inputtextarea';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { CalendarModule } from 'primeng/calendar';
import { ChartModule } from 'primeng/chart';
import { ProgressBarModule } from 'primeng/progressbar';
import { DividerModule } from 'primeng/divider';
import { TimelineModule } from 'primeng/timeline';
import { BadgeModule } from 'primeng/badge';
import { MessageService } from 'primeng/api';

// Routing
import { ReportesClientesRoutingModule } from './reportes-clientes-routing.module';

// Components
import { DashboardReportesComponent } from './pages/dashboard-reportes/dashboard-reportes.component';
import { CrearReporteComponent } from './pages/crear-reporte/crear-reporte.component';
import { ListaReportesComponent } from './pages/lista-reportes/lista-reportes.component';
import { DetalleReporteComponent } from './pages/detalle-reporte/detalle-reporte.component';

// Services
import { ConfirmationService } from 'primeng/api';

@NgModule({
  declarations: [
    DashboardReportesComponent,
    CrearReporteComponent,
    ListaReportesComponent,
    DetalleReporteComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ReportesClientesRoutingModule,
    // PrimeNG
    CardModule,
    ButtonModule,
    TableModule,
    InputTextModule,
    DropdownModule,
    InputTextarea,
    TagModule,
    TooltipModule,
    ConfirmDialogModule,
    ToastModule,
    DialogModule,
    CalendarModule,
    ChartModule,
    ProgressBarModule,
    DividerModule,
    TimelineModule,
    BadgeModule
  ],
  providers: [
    ConfirmationService
  ]
})
export class ReportesClientesModule { }
