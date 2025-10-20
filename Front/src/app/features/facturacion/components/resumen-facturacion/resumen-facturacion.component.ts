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
    // Navegar a vista de detalle con el ID del periodo
    this.router.navigate(['/facturacion/detalle', periodo.id]);
  }

  exportarPDF(periodo: PeriodoFacturacion): void {
    this.loading = true;
    
    // Obtener el detalle completo del periodo para el PDF
    this.facturacionService.getDetalle(periodo.cliente_id, periodo.año, periodo.mes).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.crearDocumentoPDF(response.data);
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error generando PDF:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al generar el PDF'
        });
        this.loading = false;
      }
    });
  }

  private crearDocumentoPDF(detalle: any): void {
    const { periodo, detalle_peticiones, resumen_categorias, totales } = detalle;
    
    // Crear contenido HTML para el PDF
    const contenidoHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Facturación - ${periodo.cliente?.nombre || 'Cliente'}</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 40px;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #3b82f6;
            padding-bottom: 20px;
          }
          .header h1 {
            color: #1e40af;
            margin: 0;
          }
          .info-section {
            margin-bottom: 30px;
            background: #f9fafb;
            padding: 20px;
            border-radius: 8px;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
          }
          .info-label {
            font-weight: bold;
            color: #6b7280;
          }
          .info-value {
            color: #1f2937;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          th {
            background: #3b82f6;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: 600;
          }
          td {
            padding: 10px;
            border-bottom: 1px solid #e5e7eb;
          }
          tr:hover {
            background: #f9fafb;
          }
          .total-row {
            background: #eff6ff;
            font-weight: bold;
          }
          .total-row td {
            border-top: 2px solid #3b82f6;
            padding: 15px;
          }
          .estado {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
          }
          .estado-abierto { background: #dbeafe; color: #1e40af; }
          .estado-cerrado { background: #fef3c7; color: #92400e; }
          .estado-facturado { background: #d1fae5; color: #065f46; }
          .footer {
            text-align: center;
            margin-top: 50px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            color: #6b7280;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Periodo de Facturación</h1>
          <p>${this.getPeriodoLabel(periodo)}</p>
        </div>

        <div class="info-section">
          <h2>Información del Cliente</h2>
          <div class="info-row">
            <span class="info-label">Cliente:</span>
            <span class="info-value">${periodo.cliente?.nombre || 'N/A'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Cédula/NIT:</span>
            <span class="info-value">${periodo.cliente?.cedula || 'No especificado'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Teléfono:</span>
            <span class="info-value">${periodo.cliente?.telefono || 'No especificado'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Correo:</span>
            <span class="info-value">${periodo.cliente?.correo || 'No especificado'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Ciudad:</span>
            <span class="info-value">${periodo.cliente?.ciudad || 'No especificado'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Dirección:</span>
            <span class="info-value">${periodo.cliente?.direccion || 'No especificado'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">País:</span>
            <span class="info-value">${periodo.cliente?.pais || 'N/A'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Tipo:</span>
            <span class="info-value">${periodo.cliente?.tipo_cliente || 'N/A'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Estado:</span>
            <span class="info-value estado estado-${periodo.estado.toLowerCase()}">${periodo.estado}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Fecha de Generación:</span>
            <span class="info-value">${new Date(periodo.fecha_generacion).toLocaleDateString()}</span>
          </div>
        </div>

        <h2>Resumen por Categoría</h2>
        <table>
          <thead>
            <tr>
              <th>Categoría</th>
              <th>Área</th>
              <th>Cantidad</th>
              <th>Costo Total</th>
            </tr>
          </thead>
          <tbody>
            ${resumen_categorias.map((cat: any) => `
              <tr>
                <td>${cat.categoria}</td>
                <td>${cat.area_tipo}</td>
                <td>${cat.cantidad}</td>
                <td>$${cat.costo_total.toLocaleString('es-CO', { minimumFractionDigits: 2 })}</td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td colspan="2"><strong>TOTAL</strong></td>
              <td><strong>${totales.total_peticiones}</strong></td>
              <td><strong>$${totales.costo_total.toLocaleString('es-CO', { minimumFractionDigits: 2 })}</strong></td>
            </tr>
          </tbody>
        </table>

        <h2>Detalle de Peticiones</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Categoría</th>
              <th>Fecha Resolución</th>
              <th>Costo</th>
            </tr>
          </thead>
          <tbody>
            ${detalle_peticiones.map((pet: any) => `
              <tr>
                <td>#${pet.id}</td>
                <td>${pet.categoria?.nombre || 'N/A'}</td>
                <td>${new Date(pet.fecha_resolucion).toLocaleDateString()}</td>
                <td>$${pet.costo.toLocaleString('es-CO', { minimumFractionDigits: 2 })}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          <p>Documento generado el ${new Date().toLocaleString()}</p>
          <p>Sistema de Control de Funcionamiento Empresarial</p>
        </div>
      </body>
      </html>
    `;

    // Crear ventana temporal para imprimir/guardar como PDF
    const ventana = window.open('', '_blank');
    if (ventana) {
      ventana.document.write(contenidoHTML);
      ventana.document.close();
      
      // Esperar a que se cargue y luego abrir diálogo de impresión
      ventana.onload = () => {
        ventana.print();
      };

      this.messageService.add({
        severity: 'success',
        summary: 'PDF Generado',
        detail: 'Use Ctrl+P o Guardar como PDF en el diálogo de impresión'
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo abrir la ventana de impresión. Verifique el bloqueador de ventanas emergentes.'
      });
    }
  }

  irAGenerar(): void {
    this.router.navigate(['/facturacion/generar']);
  }

  generarAutomatica(): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de generar la facturación automática para ${this.meses[this.selectedMes - 1].label} ${this.selectedAnio}? Esto creará periodos de facturación para TODOS los clientes con peticiones resueltas en este periodo.`,
      header: 'Confirmar Generación Automática',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.loading = true;
        this.facturacionService
          .generarAutomatica(this.selectedAnio, this.selectedMes)
          .subscribe({
            next: (response) => {
              if (response.success) {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Éxito',
                  detail: `Facturación automática generada: ${response.data.periodos_generados} clientes, ${response.data.total_peticiones} peticiones, $${response.data.costo_total.toLocaleString()}`
                });
                this.loadResumen();
              }
              this.loading = false;
            },
            error: (error) => {
              console.error('Error generando facturación automática:', error);
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al generar la facturación automática'
              });
              this.loading = false;
            }
          });
      }
    });
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

