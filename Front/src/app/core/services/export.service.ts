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
   * Exporta una petición individual a PDF
   */
  exportarPeticionAPDF(peticion: PeticionParaPDF): void {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPos = 20;

    // Configuración de colores (usando tuplas para evitar errores de TypeScript)
    const colorPrimario: [number, number, number] = [255, 215, 0]; // Amarillo
    const colorNegro: [number, number, number] = [0, 0, 0];

    // ENCABEZADO
    doc.setFillColor(colorPrimario[0], colorPrimario[1], colorPrimario[2]);
    doc.rect(0, 0, pageWidth, 35, 'F');
    
    doc.setTextColor(colorNegro[0], colorNegro[1], colorNegro[2]);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('DETALLE DE PETICIÓN', margin, 15);
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text(`#${peticion.id}`, margin, 25);

    yPos = 50;

    // INFORMACIÓN PRINCIPAL
    doc.setFillColor(245, 245, 245);
    doc.rect(margin, yPos, pageWidth - (margin * 2), 10, 'F');
    doc.setTextColor(colorNegro[0], colorNegro[1], colorNegro[2]);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMACIÓN GENERAL', margin + 5, yPos + 7);

    yPos += 20;

    // Cliente
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Cliente:', margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(peticion.cliente, margin + 30, yPos);
    yPos += 10;

    // Categoría
    doc.setFont('helvetica', 'bold');
    doc.text('Categoría:', margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(peticion.categoria, margin + 30, yPos);
    yPos += 10;

    // Estado
    doc.setFont('helvetica', 'bold');
    doc.text('Estado:', margin, yPos);
    doc.setFont('helvetica', 'normal');
    this.setColorPorEstado(doc, peticion.estado);
    doc.text(peticion.estado, margin + 30, yPos);
    doc.setTextColor(colorNegro[0], colorNegro[1], colorNegro[2]);
    yPos += 10;

    // Costo
    doc.setFont('helvetica', 'bold');
    doc.text('Costo:', margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(40, 167, 69); // Verde
    doc.text(`$${peticion.costo.toLocaleString('es-CO')} COP`, margin + 30, yPos);
    doc.setTextColor(colorNegro[0], colorNegro[1], colorNegro[2]);
    yPos += 15;

    // DESCRIPCIÓN
    doc.setFillColor(245, 245, 245);
    doc.rect(margin, yPos, pageWidth - (margin * 2), 10, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('DESCRIPCIÓN', margin + 5, yPos + 7);

    yPos += 20;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const descripcionLines = doc.splitTextToSize(peticion.descripcion, pageWidth - (margin * 2) - 10);
    doc.text(descripcionLines, margin, yPos);
    yPos += (descripcionLines.length * 6) + 10;

    // DESCRIPCIÓN EXTRA (si existe)
    if (peticion.descripcion_extra) {
      doc.setFillColor(245, 245, 245);
      doc.rect(margin, yPos, pageWidth - (margin * 2), 10, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('DESCRIPCIÓN ADICIONAL', margin + 5, yPos + 7);

      yPos += 20;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      const descripcionExtraLines = doc.splitTextToSize(peticion.descripcion_extra, pageWidth - (margin * 2) - 10);
      doc.text(descripcionExtraLines, margin, yPos);
      yPos += (descripcionExtraLines.length * 6) + 10;
    }

    // INFORMACIÓN ADICIONAL
    doc.setFillColor(245, 245, 245);
    doc.rect(margin, yPos, pageWidth - (margin * 2), 10, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('INFORMACIÓN ADICIONAL', margin + 5, yPos + 7);

    yPos += 20;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    // Creador
    doc.setFont('helvetica', 'bold');
    doc.text('Creado por:', margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(peticion.creador, margin + 30, yPos);
    yPos += 10;

    // Fecha de creación
    doc.setFont('helvetica', 'bold');
    doc.text('Fecha:', margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(peticion.fecha_creacion, margin + 30, yPos);
    yPos += 10;

    // Asignado a (si existe)
    if (peticion.asignado) {
      doc.setFont('helvetica', 'bold');
      doc.text('Asignado a:', margin, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(peticion.asignado, margin + 30, yPos);
      yPos += 10;
    }

    // Tiempo empleado (si existe)
    if (peticion.tiempo_empleado) {
      doc.setFont('helvetica', 'bold');
      doc.text('Tiempo empleado:', margin, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(peticion.tiempo_empleado, margin + 35, yPos);
      yPos += 10;
    }

    // PIE DE PÁGINA
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFillColor(colorPrimario[0], colorPrimario[1], colorPrimario[2]);
    doc.rect(0, pageHeight - 20, pageWidth, 20, 'F');
    doc.setTextColor(colorNegro[0], colorNegro[1], colorNegro[2]);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    const fecha = new Date().toLocaleString('es-CO');
    doc.text(`Generado el ${fecha}`, margin, pageHeight - 10);

    // Guardar PDF
    doc.save(`Peticion_${peticion.id}.pdf`);
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
