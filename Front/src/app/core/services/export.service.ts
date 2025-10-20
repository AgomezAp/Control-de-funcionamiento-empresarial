import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';

export interface PeticionParaPDF {
  id: number;
  cliente: string;
  categoria: string;
  descripcion: string;
  descripcion_extra?: string;
  costo: number;
  estado: string;
  fecha_creacion: string;
  creador: string;
  asignado?: string;
  tiempo_empleado?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  constructor() { }

  /**
   * Exporta una petición individual a PDF - DISEÑO EMPRESARIAL PROFESIONAL
   */
  exportarPeticionAPDF(peticion: PeticionParaPDF): void {
    // Crear contenido HTML para el PDF con diseño profesional
    const contenidoHTML = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Petición ${peticion.id}</title>
        <style>
          @page {
            margin: 1.5cm;
          }
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Segoe UI', 'Arial', sans-serif;
            line-height: 1.6;
            color: #2c3e50;
          }
          
          .document {
            max-width: 210mm;
            margin: 0 auto;
          }
          
          /* HEADER CORPORATIVO */
          .header {
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            color: white;
            padding: 30px;
            margin-bottom: 30px;
            position: relative;
            overflow: hidden;
          }
          
          .header::after {
            content: '';
            position: absolute;
            top: -50px;
            right: -50px;
            width: 200px;
            height: 200px;
            background: rgba(255, 215, 0, 0.1);
            border-radius: 50%;
          }
          
          .header-content {
            position: relative;
            z-index: 1;
          }
          
          .company-name {
            font-size: 16px;
            font-weight: 700;
            color: #ffd700;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-bottom: 10px;
          }
          
          .document-title {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 15px;
          }
          
          .peticion-numero {
            display: inline-block;
            background: #ffd700;
            color: #000;
            padding: 8px 20px;
            border-radius: 20px;
            font-weight: 700;
            font-size: 18px;
          }
          
          /* ESTADO BADGE */
          .estado-section {
            text-align: right;
            margin-top: 15px;
          }
          
          .estado-badge {
            display: inline-block;
            padding: 10px 25px;
            border-radius: 25px;
            font-weight: 700;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          
          .estado-pendiente {
            background: #3498db;
            color: white;
          }
          
          .estado-en-progreso {
            background: #f39c12;
            color: white;
          }
          
          .estado-resuelta {
            background: #27ae60;
            color: white;
          }
          
          .estado-cancelada {
            background: #e74c3c;
            color: white;
          }
          
          .estado-pausada {
            background: #95a5a6;
            color: white;
          }
          
          /* SECCIONES */
          .section {
            margin-bottom: 30px;
          }
          
          .section-title {
            font-size: 16px;
            font-weight: 700;
            color: #1a1a1a;
            margin-bottom: 15px;
            padding-bottom: 8px;
            border-bottom: 3px solid #ffd700;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          
          .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin-bottom: 20px;
          }
          
          .info-card {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #ffd700;
          }
          
          .info-label {
            font-size: 11px;
            font-weight: 700;
            color: #7f8c8d;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 5px;
          }
          
          .info-value {
            font-size: 14px;
            font-weight: 600;
            color: #2c3e50;
          }
          
          .info-card.highlight {
            background: linear-gradient(135deg, #fff9e6 0%, #fff4cc 100%);
            border-left-color: #f39c12;
          }
          
          .info-value.large {
            font-size: 24px;
            color: #27ae60;
            font-weight: 700;
          }
          
          .info-card.full-width {
            grid-column: 1 / -1;
          }
          
          .description-box {
            background: white;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            padding: 20px;
            line-height: 1.8;
            color: #34495e;
            min-height: 80px;
          }
          
          .description-box.extra {
            background: #f0f9ff;
            border-color: #3498db;
            margin-top: 15px;
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
          }
          
          .details-table td {
            padding: 12px;
            border-bottom: 1px solid #e0e0e0;
            font-size: 13px;
          }
          
          .details-table tr:nth-child(even) {
            background: #f8f9fa;
          }
          
          /* FOOTER */
          .footer {
            margin-top: 40px;
            padding: 25px;
            background: #1a1a1a;
            color: #e0e0e0;
            text-align: center;
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
          
          .divider {
            height: 2px;
            background: linear-gradient(90deg, #ffd700 0%, transparent 100%);
            margin: 25px 0;
          }
          
          @media print {
            body {
              background: white;
            }
            
            .section {
              page-break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <div class="document">
          <!-- HEADER -->
          <div class="header">
            <div class="header-content">
              <div class="company-name">Sistema de Gestión de Peticiones</div>
              <div class="document-title">Reporte Detallado de Petición</div>
              <div class="peticion-numero">PETICIÓN #${peticion.id}</div>
              <div class="estado-section">
                <span class="estado-badge estado-${peticion.estado.toLowerCase().replace(' ', '-')}">
                  ${peticion.estado.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
          
          <!-- INFORMACIÓN PRINCIPAL -->
          <div class="section">
            <div class="section-title">Información General</div>
            <div class="info-grid">
              <div class="info-card">
                <div class="info-label">Cliente</div>
                <div class="info-value">${peticion.cliente}</div>
              </div>
              <div class="info-card">
                <div class="info-label">Categoría</div>
                <div class="info-value">${peticion.categoria}</div>
              </div>
              <div class="info-card">
                <div class="info-label">Fecha de Creación</div>
                <div class="info-value">${peticion.fecha_creacion}</div>
              </div>
              <div class="info-card highlight">
                <div class="info-label">Costo Total</div>
                <div class="info-value large">$ ${peticion.costo.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
              </div>
            </div>
          </div>
          
          <div class="divider"></div>
          
          <!-- DESCRIPCIÓN -->
          <div class="section">
            <div class="section-title">Descripción de la Petición</div>
            <div class="description-box">
              ${peticion.descripcion}
            </div>
            ${peticion.descripcion_extra ? `
              <div class="description-box extra">
                <strong>Información Adicional:</strong><br>${peticion.descripcion_extra}
              </div>
            ` : ''}
          </div>
          
          <div class="divider"></div>
          
          <!-- DETALLES TÉCNICOS -->
          <div class="section">
            <div class="section-title">Detalles de Gestión</div>
            <table class="details-table">
              <thead>
                <tr>
                  <th>Campo</th>
                  <th>Información</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Creada por</strong></td>
                  <td>${peticion.creador}</td>
                </tr>
                ${peticion.asignado ? `
                  <tr>
                    <td><strong>Asignada a</strong></td>
                    <td>${peticion.asignado}</td>
                  </tr>
                ` : ''}
                ${peticion.tiempo_empleado ? `
                  <tr>
                    <td><strong>Tiempo Empleado</strong></td>
                    <td>${peticion.tiempo_empleado}</td>
                  </tr>
                ` : ''}
                <tr>
                  <td><strong>Estado Actual</strong></td>
                  <td><strong>${peticion.estado}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <!-- FOOTER -->
          <div class="footer">
            <div class="footer-title">Documento Generado Automáticamente</div>
            <div class="footer-text">
              Fecha de generación: ${new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </div>
            <div class="footer-text" style="margin-top: 8px;">
              Este documento es de uso interno y contiene información confidencial
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Abrir nueva ventana con el contenido
    const ventana = window.open('', '_blank');
    if (!ventana) {
      alert('Por favor, permite las ventanas emergentes para exportar el PDF');
      return;
    }

    ventana.document.write(contenidoHTML);
    ventana.document.close();
    ventana.onload = () => {
      ventana.print();
    };
  }

  /**
   * Exporta una lista de peticiones a PDF
   */
  exportarListaPeticionesAPDF(peticiones: PeticionParaPDF[], titulo: string = 'Lista de Peticiones'): void {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let yPos = 20;

    // Configuración de colores
    const colorPrimario: [number, number, number] = [255, 215, 0];
    const colorNegro: [number, number, number] = [0, 0, 0];

    // ENCABEZADO
    doc.setFillColor(colorPrimario[0], colorPrimario[1], colorPrimario[2]);
    doc.rect(0, 0, pageWidth, 30, 'F');
    
    doc.setTextColor(colorNegro[0], colorNegro[1], colorNegro[2]);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(titulo, margin, 15);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total: ${peticiones.length} peticiones`, margin, 23);

    yPos = 45;

    // TABLA DE PETICIONES
    doc.setFontSize(9);

    // Encabezados de tabla
    doc.setFillColor(245, 245, 245);
    doc.rect(margin, yPos - 5, pageWidth - (margin * 2), 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.text('ID', margin + 2, yPos);
    doc.text('Cliente', margin + 15, yPos);
    doc.text('Categoría', margin + 65, yPos);
    doc.text('Estado', margin + 115, yPos);
    doc.text('Costo', margin + 145, yPos);

    yPos += 10;

    // Contenido de la tabla
    doc.setFont('helvetica', 'normal');
    peticiones.forEach((peticion, index) => {
      // Verificar si necesita nueva página
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;

        // Repetir encabezados
        doc.setFillColor(245, 245, 245);
        doc.rect(margin, yPos - 5, pageWidth - (margin * 2), 8, 'F');
        doc.setFont('helvetica', 'bold');
        doc.text('ID', margin + 2, yPos);
        doc.text('Cliente', margin + 15, yPos);
        doc.text('Categoría', margin + 65, yPos);
        doc.text('Estado', margin + 115, yPos);
        doc.text('Costo', margin + 145, yPos);
        yPos += 10;
        doc.setFont('helvetica', 'normal');
      }

      // Fila alternada
      if (index % 2 === 0) {
        doc.setFillColor(250, 250, 250);
        doc.rect(margin, yPos - 5, pageWidth - (margin * 2), 8, 'F');
      }

      doc.setTextColor(colorNegro[0], colorNegro[1], colorNegro[2]);
      doc.text(`#${peticion.id}`, margin + 2, yPos);
      doc.text(this.truncateText(peticion.cliente, 18), margin + 15, yPos);
      doc.text(this.truncateText(peticion.categoria, 18), margin + 65, yPos);
      
      this.setColorPorEstado(doc, peticion.estado);
      doc.text(peticion.estado, margin + 115, yPos);
      
      doc.setTextColor(40, 167, 69);
      doc.text(`$${peticion.costo.toLocaleString('es-CO')}`, margin + 145, yPos);

      yPos += 8;
    });

    // PIE DE PÁGINA
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFillColor(colorPrimario[0], colorPrimario[1], colorPrimario[2]);
    doc.rect(0, pageHeight - 15, pageWidth, 15, 'F');
    doc.setTextColor(colorNegro[0], colorNegro[1], colorNegro[2]);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'italic');
    const fecha = new Date().toLocaleString('es-CO');
    doc.text(`Generado el ${fecha}`, margin, pageHeight - 8);

    // Guardar PDF
    doc.save(`Peticiones_${new Date().getTime()}.pdf`);
  }

  /**
   * Imprime una petición individual
   */
  imprimirPeticion(peticion: PeticionParaPDF): void {
    const ventanaImpresion = window.open('', '_blank', 'width=800,height=600');
    
    if (!ventanaImpresion) {
      alert('Por favor, habilite las ventanas emergentes para imprimir');
      return;
    }

    const html = this.generarHTMLParaImpresion(peticion);
    ventanaImpresion.document.write(html);
    ventanaImpresion.document.close();

    // Esperar a que se cargue el contenido antes de imprimir
    ventanaImpresion.onload = () => {
      ventanaImpresion.print();
      // Cerrar la ventana después de imprimir
      ventanaImpresion.onafterprint = () => {
        ventanaImpresion.close();
      };
    };
  }

  /**
   * Imprime la lista completa de peticiones
   */
  imprimirListaPeticiones(peticiones: PeticionParaPDF[], titulo: string = 'Lista de Peticiones'): void {
    const ventanaImpresion = window.open('', '_blank', 'width=1000,height=800');
    
    if (!ventanaImpresion) {
      alert('Por favor, habilite las ventanas emergentes para imprimir');
      return;
    }

    const html = this.generarHTMLListaParaImpresion(peticiones, titulo);
    ventanaImpresion.document.write(html);
    ventanaImpresion.document.close();

    ventanaImpresion.onload = () => {
      ventanaImpresion.print();
      ventanaImpresion.onafterprint = () => {
        ventanaImpresion.close();
      };
    };
  }

  // ============================================
  // MÉTODOS PRIVADOS
  // ============================================

  private setColorPorEstado(doc: jsPDF, estado: string): void {
    switch (estado) {
      case 'Pendiente':
        doc.setTextColor(23, 162, 184); // Azul
        break;
      case 'En Progreso':
        doc.setTextColor(255, 193, 7); // Amarillo
        break;
      case 'Resuelta':
        doc.setTextColor(40, 167, 69); // Verde
        break;
      case 'Cancelada':
        doc.setTextColor(220, 53, 69); // Rojo
        break;
      default:
        doc.setTextColor(100, 100, 100); // Gris
    }
  }

  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }

  private generarHTMLParaImpresion(peticion: PeticionParaPDF): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Petición #${peticion.id}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            color: #333;
          }
          .header {
            background-color: #FFD700;
            padding: 20px;
            margin-bottom: 30px;
            border-radius: 5px;
          }
          .header h1 {
            font-size: 24px;
            margin-bottom: 5px;
          }
          .header .id {
            font-size: 18px;
            font-weight: normal;
          }
          .section {
            margin-bottom: 25px;
            page-break-inside: avoid;
          }
          .section-title {
            background-color: #f5f5f5;
            padding: 10px;
            font-weight: bold;
            margin-bottom: 15px;
            border-left: 4px solid #FFD700;
          }
          .info-row {
            display: flex;
            margin-bottom: 10px;
            padding: 8px 0;
            border-bottom: 1px solid #eee;
          }
          .info-label {
            font-weight: bold;
            min-width: 150px;
          }
          .info-value {
            flex: 1;
          }
          .estado {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 4px;
            font-weight: bold;
          }
          .estado-pendiente { background-color: #17a2b8; color: white; }
          .estado-en-progreso { background-color: #ffc107; color: black; }
          .estado-resuelta { background-color: #28a745; color: white; }
          .estado-cancelada { background-color: #dc3545; color: white; }
          .costo {
            font-size: 20px;
            font-weight: bold;
            color: #28a745;
          }
          .descripcion {
            padding: 15px;
            background-color: #f9f9f9;
            border-left: 3px solid #FFD700;
            line-height: 1.6;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #FFD700;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
          @media print {
            body {
              padding: 10px;
            }
            .header {
              background-color: #FFD700 !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .section-title {
              background-color: #f5f5f5 !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .estado {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>DETALLE DE PETICIÓN</h1>
          <div class="id">#${peticion.id}</div>
        </div>

        <div class="section">
          <div class="section-title">INFORMACIÓN GENERAL</div>
          <div class="info-row">
            <div class="info-label">Cliente:</div>
            <div class="info-value">${peticion.cliente}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Categoría:</div>
            <div class="info-value">${peticion.categoria}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Estado:</div>
            <div class="info-value">
              <span class="estado estado-${peticion.estado.toLowerCase().replace(' ', '-')}">${peticion.estado}</span>
            </div>
          </div>
          <div class="info-row">
            <div class="info-label">Costo:</div>
            <div class="info-value costo">$${peticion.costo.toLocaleString('es-CO')} COP</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">DESCRIPCIÓN</div>
          <div class="descripcion">${peticion.descripcion}</div>
        </div>

        ${peticion.descripcion_extra ? `
        <div class="section">
          <div class="section-title">DESCRIPCIÓN ADICIONAL</div>
          <div class="descripcion">${peticion.descripcion_extra}</div>
        </div>
        ` : ''}

        <div class="section">
          <div class="section-title">INFORMACIÓN ADICIONAL</div>
          <div class="info-row">
            <div class="info-label">Creado por:</div>
            <div class="info-value">${peticion.creador}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Fecha de creación:</div>
            <div class="info-value">${peticion.fecha_creacion}</div>
          </div>
          ${peticion.asignado ? `
          <div class="info-row">
            <div class="info-label">Asignado a:</div>
            <div class="info-value">${peticion.asignado}</div>
          </div>
          ` : ''}
          ${peticion.tiempo_empleado ? `
          <div class="info-row">
            <div class="info-label">Tiempo empleado:</div>
            <div class="info-value">${peticion.tiempo_empleado}</div>
          </div>
          ` : ''}
        </div>

        <div class="footer">
          Generado el ${new Date().toLocaleString('es-CO')}
        </div>
      </body>
      </html>
    `;
  }

  private generarHTMLListaParaImpresion(peticiones: PeticionParaPDF[], titulo: string): string {
    const filasHTML = peticiones.map(p => `
      <tr>
        <td>#${p.id}</td>
        <td>${p.cliente}</td>
        <td>${p.categoria}</td>
        <td><span class="estado estado-${p.estado.toLowerCase().replace(' ', '-')}">${p.estado}</span></td>
        <td class="costo">$${p.costo.toLocaleString('es-CO')}</td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${titulo}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            color: #333;
          }
          .header {
            background-color: #FFD700;
            padding: 20px;
            margin-bottom: 30px;
            border-radius: 5px;
          }
          .header h1 {
            font-size: 24px;
            margin-bottom: 5px;
          }
          .header .total {
            font-size: 14px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          thead {
            background-color: #f5f5f5;
          }
          th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
          }
          th {
            font-weight: bold;
            border-bottom: 2px solid #FFD700;
          }
          tr:hover {
            background-color: #f9f9f9;
          }
          .estado {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 3px;
            font-size: 12px;
            font-weight: bold;
          }
          .estado-pendiente { background-color: #17a2b8; color: white; }
          .estado-en-progreso { background-color: #ffc107; color: black; }
          .estado-resuelta { background-color: #28a745; color: white; }
          .estado-cancelada { background-color: #dc3545; color: white; }
          .costo {
            font-weight: bold;
            color: #28a745;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #FFD700;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
          @media print {
            body {
              padding: 10px;
            }
            .header {
              background-color: #FFD700 !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            thead {
              background-color: #f5f5f5 !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .estado {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${titulo}</h1>
          <div class="total">Total: ${peticiones.length} peticiones</div>
        </div>

        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th>Categoría</th>
              <th>Estado</th>
              <th>Costo</th>
            </tr>
          </thead>
          <tbody>
            ${filasHTML}
          </tbody>
        </table>

        <div class="footer">
          Generado el ${new Date().toLocaleString('es-CO')}
        </div>
      </body>
      </html>
    `;
  }
}
