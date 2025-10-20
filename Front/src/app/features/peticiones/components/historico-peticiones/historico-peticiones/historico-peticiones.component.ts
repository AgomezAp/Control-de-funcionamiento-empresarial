import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

// Services
import { PeticionService } from '../../../../../core/services/peticion.service';

// Models
import { PeticionHistorico } from '../../../../../core/models/peticion-historico';

// Pipes
import { TimeAgoPipe } from '../../../../../shared/pipes/time-ago.pipe';
import { CurrencycopPipe } from '../../../../../shared/pipes/currency-cop.pipe';

// Components
import { EmptyStateComponent } from '../../../../../shared/components/empty-state/empty-state/empty-state.component';
import { LoaderComponent } from '../../../../../shared/components/loader/loader/loader.component';

@Component({
  selector: 'app-historico-peticiones',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TimeAgoPipe,
    CurrencycopPipe,
    LoaderComponent,
  ],
  templateUrl: './historico-peticiones.component.html',
  styleUrls: ['./historico-peticiones.component.css'],
})
export class HistoricoPeticionesComponent implements OnInit {
  historico: PeticionHistorico[] = [];
  loading = false;

  // Paginación
  currentPage = 1;
  rowsPerPage = 15;
  itemsPerPage = 15; // Alias para compatibilidad con el HTML
  totalPages = 1;
  paginatedData: PeticionHistorico[] = [];
  visiblePages: number[] = [];

  // Exponer Math para el template
  Math = Math;

  constructor(
    private peticionService: PeticionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadHistorico();
  }

  loadHistorico(): void {
    this.loading = true;
    this.peticionService.getHistorico().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.historico = response.data;
          this.calculatePagination();
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar histórico:', error);
        this.loading = false;
      },
    });
  }

  // ============================================
  // PAGINACIÓN
  // ============================================
  calculatePagination(): void {
    this.totalPages = Math.ceil(this.historico.length / this.rowsPerPage);
    this.updatePaginatedData();
    this.updateVisiblePages();
  }

  updatePaginatedData(): void {
    const start = (this.currentPage - 1) * this.rowsPerPage;
    const end = start + this.rowsPerPage;
    this.paginatedData = this.historico.slice(start, end);
  }

  updateVisiblePages(): void {
    const pages: number[] = [];
    const maxVisible = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisible - 1);

    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    this.visiblePages = pages;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedData();
      this.updateVisiblePages();

      // Scroll al inicio de la tabla
      const tableWrapper = document.querySelector('.table-scroll');
      if (tableWrapper) {
        tableWrapper.scrollTop = 0;
      }
    }
  }

  // ============================================
  // NAVEGACIÓN
  // ============================================
  verDetalle(peticionId: number): void {
    this.router.navigate(['/peticiones', peticionId], {
      state: { fromHistorico: true },
    });
  }

  // ============================================
  // EXPORTAR Y IMPRIMIR
  // ============================================
  exportarPDF(peticion: PeticionHistorico): void {
    // Crear contenido HTML para el PDF
    const contenidoHTML = this.generarContenidoPDF(peticion);
    
    // Crear ventana nueva
    const ventana = window.open('', '_blank');
    if (!ventana) {
      alert('Por favor, permite las ventanas emergentes para exportar el PDF');
      return;
    }

    // Escribir contenido
    ventana.document.write(contenidoHTML);
    ventana.document.close();

    // Esperar a que cargue y luego imprimir
    ventana.onload = () => {
      ventana.print();
    };
  }

  imprimir(peticion: PeticionHistorico): void {
    // Igual que exportar PDF
    this.exportarPDF(peticion);
  }

  private generarContenidoPDF(peticion: PeticionHistorico): string {
    const fechaCreacion = peticion.fecha_creacion 
      ? new Date(peticion.fecha_creacion).toLocaleDateString('es-CO', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      : 'No especificada';

    const fechaResolucion = peticion.fecha_resolucion 
      ? new Date(peticion.fecha_resolucion).toLocaleDateString('es-CO', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      : 'No especificada';

    const horaResolucion = peticion.fecha_resolucion 
      ? new Date(peticion.fecha_resolucion).toLocaleTimeString('es-CO', {
          hour: '2-digit',
          minute: '2-digit'
        })
      : '';

    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reporte de Petición - ${peticion.id}</title>
        <style>
          @page {
            margin: 2cm;
          }
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Arial', 'Helvetica', sans-serif;
            line-height: 1.6;
            color: #2c3e50;
            background: #ffffff;
          }
          
          .document {
            max-width: 210mm;
            margin: 0 auto;
            background: white;
          }
          
          /* HEADER CORPORATIVO */
          .header {
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            color: white;
            padding: 30px;
            position: relative;
            overflow: hidden;
          }
          
          .header::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -10%;
            width: 300px;
            height: 300px;
            background: rgba(255, 215, 0, 0.1);
            border-radius: 50%;
          }
          
          .header-content {
            position: relative;
            z-index: 1;
          }
          
          .company-name {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 5px;
            color: #ffd700;
            text-transform: uppercase;
            letter-spacing: 2px;
          }
          
          .document-title {
            font-size: 16px;
            font-weight: 400;
            color: #e0e0e0;
            margin-bottom: 20px;
          }
          
          .header-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid rgba(255, 215, 0, 0.3);
          }
          
          .peticion-id {
            font-size: 28px;
            font-weight: 700;
            color: #ffd700;
          }
          
          .estado-badge {
            display: inline-block;
            padding: 8px 20px;
            border-radius: 20px;
            font-weight: 700;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          
          .estado-resuelta {
            background: #27ae60;
            color: white;
            box-shadow: 0 4px 15px rgba(39, 174, 96, 0.3);
          }
          
          .estado-cancelada {
            background: #e74c3c;
            color: white;
            box-shadow: 0 4px 15px rgba(231, 76, 60, 0.3);
          }
          
          /* SECCIÓN DE INFORMACIÓN */
          .content {
            padding: 40px 30px;
          }
          
          .section {
            margin-bottom: 35px;
          }
          
          .section-title {
            font-size: 16px;
            font-weight: 700;
            color: #1a1a1a;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 3px solid #ffd700;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          
          .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
          }
          
          .info-item {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #ffd700;
          }
          
          .info-label {
            font-size: 11px;
            font-weight: 700;
            color: #7f8c8d;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
          }
          
          .info-value {
            font-size: 15px;
            font-weight: 600;
            color: #2c3e50;
          }
          
          .info-item.full-width {
            grid-column: 1 / -1;
          }
          
          .info-item.highlight {
            background: linear-gradient(135deg, #fff9e6 0%, #fff4cc 100%);
            border-left-color: #f39c12;
          }
          
          .info-value.large {
            font-size: 28px;
            color: #27ae60;
            font-weight: 700;
          }
          
          .description-box {
            background: #ffffff;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            padding: 20px;
            min-height: 100px;
            line-height: 1.8;
          }
          
          /* TABLA DE DETALLES */
          .details-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
          }
          
          .details-table th {
            background: #34495e;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: 600;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .details-table td {
            padding: 12px;
            border-bottom: 1px solid #e0e0e0;
            font-size: 14px;
          }
          
          .details-table tr:last-child td {
            border-bottom: none;
          }
          
          .details-table tr:nth-child(even) {
            background: #f8f9fa;
          }
          
          /* FOOTER CORPORATIVO */
          .footer {
            background: #1a1a1a;
            color: #e0e0e0;
            padding: 30px;
            margin-top: 40px;
          }
          
          .footer-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          .footer-left {
            flex: 1;
          }
          
          .footer-title {
            font-size: 14px;
            font-weight: 700;
            color: #ffd700;
            margin-bottom: 5px;
          }
          
          .footer-text {
            font-size: 11px;
            color: #95a5a6;
          }
          
          .footer-right {
            text-align: right;
          }
          
          .generation-date {
            font-size: 11px;
            color: #95a5a6;
          }
          
          .generation-date strong {
            color: #ffd700;
          }
          
          /* SEPARADOR */
          .divider {
            height: 2px;
            background: linear-gradient(90deg, #ffd700 0%, transparent 100%);
            margin: 30px 0;
          }
          
          @media print {
            body {
              background: white;
            }
            
            .document {
              max-width: 100%;
            }
            
            .section {
              page-break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <div class="document">
          <!-- HEADER CORPORATIVO -->
          <div class="header">
            <div class="header-content">
              <div class="company-name">Sistema de Gestión</div>
              <div class="document-title">Reporte Detallado de Petición del Histórico</div>
              
              <div class="header-info">
                <div class="peticion-id">PETICIÓN #${peticion.id}</div>
                <div class="estado-badge ${peticion.estado === 'Resuelta' ? 'estado-resuelta' : 'estado-cancelada'}">
                  ${peticion.estado === 'Resuelta' ? '✓ Resuelta' : '✗ Cancelada'}
                </div>
              </div>
            </div>
          </div>
          
          <!-- CONTENIDO -->
          <div class="content">
            <!-- INFORMACIÓN DEL CLIENTE -->
            <div class="section">
              <div class="section-title">Información del Cliente</div>
              <div class="info-grid">
                <div class="info-item">
                  <div class="info-label">Cliente</div>
                  <div class="info-value">${peticion.cliente?.nombre || 'No especificado'}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Categoría</div>
                  <div class="info-value">${peticion.categoria?.nombre || 'No especificada'}</div>
                </div>
              </div>
            </div>
            
            <div class="divider"></div>
            
            <!-- DESCRIPCIÓN -->
            <div class="section">
              <div class="section-title">Descripción de la Petición</div>
              <div class="description-box">
                ${peticion.descripcion || 'Sin descripción disponible'}
              </div>
              ${peticion.descripcion_extra ? `
                <div style="margin-top: 15px;">
                  <div class="info-label">Información Adicional</div>
                  <div class="description-box" style="background: #f0f9ff; border-color: #3498db;">
                    ${peticion.descripcion_extra}
                  </div>
                </div>
              ` : ''}
            </div>
            
            <div class="divider"></div>
            
            <!-- DATOS DE RESOLUCIÓN -->
            <div class="section">
              <div class="section-title">Datos de Resolución</div>
              <div class="info-grid">
                <div class="info-item">
                  <div class="info-label">Fecha de Creación</div>
                  <div class="info-value">${fechaCreacion}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Fecha de Resolución</div>
                  <div class="info-value">${fechaResolucion} ${horaResolucion}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Resuelto Por</div>
                  <div class="info-value">${peticion.asignado?.nombre_completo || 'No especificado'}</div>
                </div>
                <div class="info-item highlight">
                  <div class="info-label">Costo Total</div>
                  <div class="info-value large">$ ${peticion.costo?.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) || '0'}</div>
                </div>
              </div>
            </div>
            
            <!-- DETALLES TÉCNICOS -->
            <div class="section">
              <div class="section-title">Detalles Técnicos</div>
              <table class="details-table">
                <thead>
                  <tr>
                    <th>Campo</th>
                    <th>Valor</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>ID Original</strong></td>
                    <td>${peticion.peticion_id_original}</td>
                  </tr>
                  <tr>
                    <td><strong>Estado Final</strong></td>
                    <td>${peticion.estado}</td>
                  </tr>
                  <tr>
                    <td><strong>Creada por</strong></td>
                    <td>${peticion.creador?.nombre_completo || 'No especificado'}</td>
                  </tr>
                  <tr>
                    <td><strong>Movida al Histórico</strong></td>
                    <td>${new Date(peticion.fecha_movido_historico).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <!-- FOOTER CORPORATIVO -->
          <div class="footer">
            <div class="footer-content">
              <div class="footer-left">
                <div class="footer-title">Sistema de Gestión de Peticiones</div>
                <div class="footer-text">Documento confidencial · Uso interno</div>
              </div>
              <div class="footer-right">
                <div class="generation-date">
                  <strong>Generado:</strong> ${new Date().toLocaleDateString('es-CO', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
