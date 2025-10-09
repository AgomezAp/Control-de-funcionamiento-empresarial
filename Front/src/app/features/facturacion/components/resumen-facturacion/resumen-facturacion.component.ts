import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DropdownModule } from 'primeng/dropdown';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FormsModule } from '@angular/forms';
import { FacturacionService } from '../../../../core/services/facturacion.service';
import { PeriodoFacturacion, EstadoFacturacion, ResumenFacturacionMensual } from '../../../../core/models/periodo-facturacion.model';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-resumen-facturacion',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    TableModule,
    ButtonModule,
    TagModule,
    DropdownModule,
    SkeletonModule,
    ToastModule,
    ConfirmDialogModule,
    FormsModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './resumen-facturacion.component.html',
  styleUrl: './resumen-facturacion.component.css'
})
export class ResumenFacturacionComponent implements OnInit {
  loading = false;
  resumen?: ResumenFacturacionMensual;
  periodos: PeriodoFacturacion[] = [];

  // Filtros
  anios: { label: string; value: number }[] = [];
  meses = [
    { label: 'Enero', value: 1 },
    { label: 'Febrero', value: 2 },
    { label: 'Marzo', value: 3 },
    { label: 'Abril', value: 4 },
    { label: 'Mayo', value: 5 },
    { label: 'Junio', value: 6 },
    { label: 'Julio', value: 7 },
    { label: 'Agosto', value: 8 },
    { label: 'Septiembre', value: 9 },
    { label: 'Octubre', value: 10 },
    { label: 'Noviembre', value: 11 },
    { label: 'Diciembre', value: 12 }
  ];

  selectedAnio: number = new Date().getFullYear();
  selectedMes: number = new Date().getMonth() + 1;

  constructor(
    private facturacionService: FacturacionService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initAnios();
    this.loadResumen();
  }

  initAnios(): void {
    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i >= currentYear - 5; i--) {
      this.anios.push({ label: i.toString(), value: i });
    }
  }

  loadResumen(): void {
    this.loading = true;

    this.facturacionService
      .getResumen(this.selectedAnio, this.selectedMes)
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.resumen = response.data;
            this.periodos = response.data.periodos || [];
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error cargando resumen:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al cargar el resumen de facturación'
          });
          this.loading = false;
        }
      });
  }

  onFiltroChange(): void {
    this.loadResumen();
  }

  cerrarPeriodo(periodo: PeriodoFacturacion): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de cerrar el periodo de facturación de ${periodo.cliente?.nombre}?`,
      header: 'Confirmar Cierre',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.facturacionService.cerrar(periodo.id).subscribe({
          next: (response) => {
            if (response.success) {
              this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Periodo cerrado correctamente'
              });
              this.loadResumen();
            }
          },
          error: (error) => {
            console.error('Error cerrando periodo:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al cerrar el periodo'
            });
          }
        });
      }
    });
  }

  facturarPeriodo(periodo: PeriodoFacturacion): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de marcar como facturado el periodo de ${periodo.cliente?.nombre}?`,
      header: 'Confirmar Facturación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.facturacionService.facturar(periodo.id).subscribe({
          next: (response) => {
            if (response.success) {
              this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Periodo marcado como facturado'
              });
              this.loadResumen();
            }
          },
          error: (error) => {
            console.error('Error facturando periodo:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al facturar el periodo'
            });
          }
        });
      }
    });
  }

  verDetalle(periodo: PeriodoFacturacion): void {
    // Navegar a una vista de detalle (pendiente de implementar)
    console.log('Ver detalle de periodo:', periodo);
    this.messageService.add({
      severity: 'info',
      summary: 'Información',
      detail: 'Vista de detalle próximamente'
    });
  }

  exportarPDF(periodo: PeriodoFacturacion): void {
    console.log('Exportar PDF:', periodo);
    this.messageService.add({
      severity: 'info',
      summary: 'Información',
      detail: 'Exportación a PDF próximamente'
    });
  }

  irAGenerar(): void {
    this.router.navigate(['/facturacion/generar']);
  }

  getEstadoSeverity(estado: EstadoFacturacion): 'success' | 'warning' | 'info' {
    switch (estado) {
      case EstadoFacturacion.FACTURADO:
        return 'success';
      case EstadoFacturacion.CERRADO:
        return 'warning';
      case EstadoFacturacion.ABIERTO:
        return 'info';
      default:
        return 'info';
    }
  }

  puedeModificar(estado: EstadoFacturacion): boolean {
    return estado !== EstadoFacturacion.FACTURADO;
  }

  getPeriodoLabel(periodo: PeriodoFacturacion): string {
    const mesLabel = this.meses[periodo.mes - 1]?.label || '';
    const anioLabel = periodo.año || '';
    return `${mesLabel} ${anioLabel}`;
  }
}

