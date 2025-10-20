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
    
    // Generar número de factura (formato: FAC-YYYYMM-CLIENTEID-PERIODOID)
    const numeroFactura = `FAC-${periodo.año}${String(periodo.mes).padStart(2, '0')}-${periodo.cliente_id}-${periodo.id}`;
    
    // Calcular subtotal, IVA y total (Colombia: IVA 19%)
    const subtotal = totales.costo_total / 1.19;
    const iva = totales.costo_total - subtotal;
    
    const contenidoHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Factura ${numeroFactura}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Arial', sans-serif;
            font-size: 11px;
            line-height: 1.4;
            color: #000;
            padding: 20mm;
          }
          
          .factura-container {
            width: 100%;
            max-width: 210mm;
            margin: 0 auto;
            border: 2px solid #000;
            padding: 15px;
          }
          
          /* HEADER - Información de la empresa emisora */
          .header-factura {
            display: flex;
            justify-content: space-between;
            border-bottom: 2px solid #000;
            padding-bottom: 15px;
            margin-bottom: 15px;
          }
          
          .empresa-info {
            width: 60%;
          }
          
          .empresa-info h1 {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 5px;
            color: #000;
          }
          
          .empresa-info p {
            margin: 2px 0;
            font-size: 10px;
          }
          
          .factura-numero {
            width: 35%;
            text-align: right;
            border-left: 2px solid #000;
            padding-left: 10px;
          }
          
          .factura-numero h2 {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 8px;
            color: #d32f2f;
          }
          
          .factura-numero p {
            margin: 3px 0;
            font-size: 10px;
          }
          
          .factura-numero .numero {
            font-size: 14px;
            font-weight: bold;
            color: #000;
            margin: 5px 0;
          }
          
          /* SECCIÓN CLIENTE */
          .seccion-cliente {
            border: 1px solid #000;
            padding: 10px;
            margin-bottom: 15px;
            background: #f5f5f5;
          }
          
          .seccion-cliente h3 {
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 8px;
            border-bottom: 1px solid #000;
            padding-bottom: 5px;
          }
          
          .cliente-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
          }
          
          .cliente-item {
            display: flex;
          }
          
          .cliente-label {
            font-weight: bold;
            width: 120px;
            flex-shrink: 0;
          }
          
          .cliente-value {
            flex: 1;
          }
          
          /* TABLA DE ITEMS */
          .tabla-items {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
          }
          
          .tabla-items thead {
            background: #333;
            color: white;
          }
          
          .tabla-items th {
            padding: 10px 8px;
            text-align: left;
            font-size: 11px;
            font-weight: bold;
            border: 1px solid #000;
          }
          
          .tabla-items td {
            padding: 8px;
            border: 1px solid #ccc;
            font-size: 10px;
          }
          
          .tabla-items tbody tr:nth-child(even) {
            background: #f9f9f9;
          }
          
          .text-center {
            text-align: center;
          }
          
          .text-right {
            text-align: right;
          }
          
          /* TOTALES */
          .seccion-totales {
            width: 100%;
            margin-top: 20px;
          }
          
          .totales-grid {
            width: 300px;
            float: right;
            border: 2px solid #000;
          }
          
          .total-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 12px;
            border-bottom: 1px solid #ccc;
          }
          
          .total-row:last-child {
            border-bottom: none;
            background: #333;
            color: white;
            font-weight: bold;
            font-size: 13px;
          }
          
          .total-label {
            font-weight: bold;
          }
          
          .total-value {
            text-align: right;
            min-width: 120px;
          }
          
          /* FOOTER - Información legal */
          .footer-legal {
            clear: both;
            margin-top: 40px;
            padding-top: 15px;
            border-top: 1px solid #000;
            font-size: 9px;
            text-align: justify;
          }
          
          .footer-legal h4 {
            font-size: 10px;
            margin-bottom: 5px;
          }
          
          .footer-legal p {
            margin: 3px 0;
            line-height: 1.3;
          }
          
          .firmas {
            margin-top: 40px;
            display: flex;
            justify-content: space-between;
          }
          
          .firma-box {
            width: 45%;
            text-align: center;
          }
          
          .firma-linea {
            border-top: 1px solid #000;
            margin-bottom: 5px;
            margin-top: 60px;
          }
          
          .firma-label {
            font-size: 10px;
            font-weight: bold;
          }
          
          /* MARCA DE AGUA */
          .estado-marca {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 80px;
            font-weight: bold;
            color: rgba(0, 0, 0, 0.05);
            z-index: -1;
            pointer-events: none;
          }
          
          @media print {
            body {
              padding: 0;
            }
            .factura-container {
              border: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="factura-container">
          
          <!-- MARCA DE AGUA -->
          <div class="estado-marca">${periodo.estado}</div>
          
          <!-- HEADER -->
          <div class="header-factura">
            <div class="empresa-info">
              <h1>Andres Publicidad</h1>
              <p><strong>NIT:</strong> 900.123.456-7</p>
              <p><strong>Dirección:</strong> Calle 123 #45-67, Bogotá D.C., Colombia</p>
              <p><strong>Teléfono:</strong> +57 (1) 234-5678</p>
              <p><strong>Email:</strong> facturacion@andrespublicidad.com</p>
              <p><strong>Página Web:</strong> www.andrespublicidad.com</p>
              <p style="margin-top: 5px;"><strong>Régimen:</strong> Responsable de IVA - Gran Contribuyente</p>
              <p><strong>Actividad Económica:</strong> Servicios de publicidad digital y marketing</p>
            </div>
            
            <div class="factura-numero">
              <h2>FACTURA DE VENTA</h2>
              <p class="numero">${numeroFactura}</p>
              <p><strong>Fecha Emisión:</strong></p>
              <p>${new Date(periodo.fecha_generacion).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p style="margin-top: 8px;"><strong>Período Facturado:</strong></p>
              <p>${this.meses[periodo.mes - 1]} ${periodo.año}</p>
              <p style="margin-top: 8px;"><strong>Resolución DIAN:</strong></p>
              <p style="font-size: 9px;">No. 18764123456789</p>
              <p style="font-size: 9px;">Rango: FAC-1 a FAC-50000</p>
              <p style="font-size: 9px;">Vigencia: 2024-2026</p>
            </div>
          </div>
          
          <!-- INFORMACIÓN DEL CLIENTE -->
          <div class="seccion-cliente">
            <h3>DATOS DEL CLIENTE</h3>
            <div class="cliente-grid">
              <div class="cliente-item">
                <span class="cliente-label">Razón Social:</span>
                <span class="cliente-value">${periodo.cliente?.nombre || 'N/A'}</span>
              </div>
              <div class="cliente-item">
                <span class="cliente-label">${periodo.cliente?.tipo_persona === 'Jurídica' ? 'NIT' : 'Cédula'}:</span>
                <span class="cliente-value">${periodo.cliente?.cedula || 'No especificado'}</span>
              </div>
              <div class="cliente-item">
                <span class="cliente-label">Tipo de Persona:</span>
                <span class="cliente-value">${periodo.cliente?.tipo_persona || 'No especificado'}</span>
              </div>
              <div class="cliente-item">
                <span class="cliente-label">Tipo de Cliente:</span>
                <span class="cliente-value">${periodo.cliente?.tipo_cliente || 'N/A'}</span>
              </div>
              <div class="cliente-item">
                <span class="cliente-label">Dirección:</span>
                <span class="cliente-value">${periodo.cliente?.direccion || 'No especificada'}</span>
              </div>
              <div class="cliente-item">
                <span class="cliente-label">Ciudad:</span>
                <span class="cliente-value">${periodo.cliente?.ciudad || 'No especificada'}</span>
              </div>
              <div class="cliente-item">
                <span class="cliente-label">Teléfono:</span>
                <span class="cliente-value">${periodo.cliente?.telefono || 'No especificado'}</span>
              </div>
              <div class="cliente-item">
                <span class="cliente-label">Email:</span>
                <span class="cliente-value">${periodo.cliente?.correo || 'No especificado'}</span>
              </div>
            </div>
          </div>
          
          <!-- TABLA DE ITEMS/SERVICIOS -->
          <table class="tabla-items">
            <thead>
              <tr>
                <th style="width: 8%;" class="text-center">ÍTEM</th>
                <th style="width: 10%;" class="text-center">CÓDIGO</th>
                <th style="width: 32%;">DESCRIPCIÓN DEL SERVICIO</th>
                <th style="width: 15%;">ÁREA</th>
                <th style="width: 10%;" class="text-center">CANTIDAD</th>
                <th style="width: 12%;" class="text-right">VALOR UNIT.</th>
                <th style="width: 13%;" class="text-right">VALOR TOTAL</th>
              </tr>
            </thead>
            <tbody>
              ${resumen_categorias.map((cat: any, index: number) => {
                const valorUnitario = cat.cantidad > 0 ? cat.costo_total / cat.cantidad : 0;
                return `
                  <tr>
                    <td class="text-center">${index + 1}</td>
                    <td class="text-center">SRV-${String(index + 1).padStart(3, '0')}</td>
                    <td><strong>${cat.categoria}</strong><br><span style="font-size: 9px;">Servicios de ${cat.categoria.toLowerCase()} - Período ${this.meses[periodo.mes - 1]} ${periodo.año}</span></td>
                    <td>${cat.area_tipo}</td>
                    <td class="text-center">${cat.cantidad}</td>
                    <td class="text-right">$${valorUnitario.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td class="text-right">$${cat.costo_total.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
          
          <!-- TOTALES -->
          <div class="seccion-totales">
            <div class="totales-grid">
              <div class="total-row">
                <span class="total-label">Subtotal:</span>
                <span class="total-value">$${subtotal.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div class="total-row">
                <span class="total-label">IVA (19%):</span>
                <span class="total-value">$${iva.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div class="total-row">
                <span class="total-label">TOTAL A PAGAR:</span>
                <span class="total-value">$${totales.costo_total.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
          
          <!-- INFORMACIÓN LEGAL -->
          <div class="footer-legal">
            <h4>INFORMACIÓN DE PAGO</h4>
            <p><strong>Cuenta Bancaria:</strong> Banco de Bogotá - Cuenta Corriente No. 123-456789-01 | <strong>Beneficiario:</strong> TU EMPRESA S.A.S. - NIT 900.123.456-7</p>
            <p><strong>Condiciones de Pago:</strong> 30 días calendario a partir de la fecha de emisión de esta factura.</p>
            
            <h4 style="margin-top: 10px;">OBSERVACIONES</h4>
            <p>Esta factura corresponde a los servicios de publicidad digital y marketing prestados durante el período de <strong>${this.meses[periodo.mes - 1]} ${periodo.año}</strong>. Se incluyen ${totales.total_peticiones} peticiones/servicios completadas exitosamente según el detalle de categorías especificado.</p>
            
            <h4 style="margin-top: 10px;">NOTAS LEGALES</h4>
            <p>• Esta factura se asimila en sus efectos legales a la Letra de Cambio según Art. 774 del Código de Comercio.</p>
            <p>• Sujeto a retención en la fuente según corresponda por ley vigente.</p>
            <p>• Factura electrónica con validez fiscal según normatividad DIAN.</p>
            <p>• Para cualquier aclaración o duda sobre esta factura, por favor contactar al departamento de facturación.</p>
          </div>
          
          <!-- FIRMAS -->
          <div class="firmas">
            <div class="firma-box">
              <div class="firma-linea"></div>
              <p class="firma-label">ELABORADO POR</p>
              <p style="font-size: 9px; margin-top: 3px;">Dpto. de Facturación</p>
            </div>
            <div class="firma-box">
              <div class="firma-linea"></div>
              <p class="firma-label">RECIBIDO POR</p>
              <p style="font-size: 9px; margin-top: 3px;">Cliente - Firma y Sello</p>
            </div>
          </div>
          
          <!-- PIE DE PÁGINA -->
          <div style="margin-top: 30px; text-align: center; font-size: 8px; color: #666;">
            <p>Sistema de Gestión de Facturación | Generado electrónicamente el ${new Date().toLocaleString('es-CO')}</p>
            <p>Esta factura fue generada automáticamente por el sistema y no requiere firma autógrafa | Documento controlado</p>
          </div>
          
        </div>
      </body>
      </html>
    `;

    // Crear ventana y generar PDF
    const ventana = window.open('', '_blank');
    if (ventana) {
      ventana.document.write(contenidoHTML);
      ventana.document.close();
      
      // Esperar a que se cargue el contenido antes de imprimir
      ventana.onload = () => {
        setTimeout(() => {
          ventana.print();
        }, 250);
      };
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo abrir la ventana para generar el PDF. Por favor, permite las ventanas emergentes.'
      });
    }
  }
}
