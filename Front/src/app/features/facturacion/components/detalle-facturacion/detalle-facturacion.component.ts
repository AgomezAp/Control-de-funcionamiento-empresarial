import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { FacturacionService } from '../../../../core/services/facturacion.service';
import { DetalleFacturacion, EstadoFacturacion, PeriodoFacturacion } from '../../../../core/models/periodo-facturacion.model';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-detalle-facturacion',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    TableModule,
    ButtonModule,
    TagModule,
    SkeletonModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './detalle-facturacion.component.html',
  styleUrl: './detalle-facturacion.component.css'
})
export class DetalleFacturacionComponent implements OnInit {
  loading = false;
  periodoId!: number;
  periodo?: PeriodoFacturacion;
  detalle?: DetalleFacturacion;

  meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private facturacionService: FacturacionService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.periodoId = +params['id'];
      if (this.periodoId) {
        this.loadDetalle();
      }
    });
  }

  loadDetalle(): void {
    this.loading = true;

    // Primero obtener el periodo
    this.facturacionService.getById(this.periodoId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.periodo = response.data;
          
          // Luego obtener el detalle completo
          this.facturacionService.getDetalle(
            this.periodo.cliente_id,
            this.periodo.año,
            this.periodo.mes
          ).subscribe({
            next: (detalleResponse) => {
              if (detalleResponse.success && detalleResponse.data) {
                this.detalle = detalleResponse.data;
              }
              this.loading = false;
            },
            error: (error) => {
              console.error('Error cargando detalle:', error);
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al cargar el detalle de facturación'
              });
              this.loading = false;
            }
          });
        }
      },
      error: (error) => {
        console.error('Error cargando periodo:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar el periodo de facturación'
        });
        this.loading = false;
        this.volver();
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

  getPeriodoLabel(): string {
    if (!this.periodo) return '';
    const mesLabel = this.meses[this.periodo.mes - 1] || '';
    return `${mesLabel} ${this.periodo.año}`;
  }

  volver(): void {
    this.router.navigate(['/facturacion/resumen']);
  }

  exportarPDF(): void {
    if (!this.detalle) return;

    const { periodo, detalle_peticiones, resumen_categorias, totales } = this.detalle;
    
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
          <p>${this.getPeriodoLabel()}</p>
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
              <th>Usuario</th>
              <th>Fecha Resolución</th>
              <th>Costo</th>
            </tr>
          </thead>
          <tbody>
            ${detalle_peticiones.map((pet: any) => `
              <tr>
                <td>#${pet.id}</td>
                <td>${pet.categoria?.nombre || 'N/A'}</td>
                <td>${pet.asignado?.nombre_completo || 'N/A'}</td>
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

    const ventana = window.open('', '_blank');
    if (ventana) {
      ventana.document.write(contenidoHTML);
      ventana.document.close();
      
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
}
