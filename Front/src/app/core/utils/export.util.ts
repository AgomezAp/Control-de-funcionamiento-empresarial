import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { FormatUtil } from './format.util';
import { DateUtil } from './date.util';

export class ExportUtil {
  // Exportar tabla a Excel
  static exportToExcel(data: any[], filename: string, sheetName: string = 'Datos'): void {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    saveAs(blob, `${filename}_${DateUtil.formatDate(new Date(), 'yyyyMMdd')}.xlsx`);
  }

  // Exportar tabla a PDF
  static exportTableToPDF(
    data: any[], 
    columns: { header: string; dataKey: string }[], 
    filename: string,
    title?: string
  ): void {
    const doc = new jsPDF();
    
    // Título
    if (title) {
      doc.setFontSize(16);
      doc.text(title, 14, 15);
    }

    // Fecha de generación
    doc.setFontSize(10);
    doc.text(`Generado: ${DateUtil.formatDate(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, title ? 25 : 15);

    // Tabla
    autoTable(doc, {
      startY: title ? 30 : 20,
      head: [columns.map(col => col.header)],
      body: data.map(row => columns.map(col => row[col.dataKey])),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [255, 193, 7], textColor: [0, 0, 0] },
    });

    doc.save(`${filename}_${DateUtil.formatDate(new Date(), 'yyyyMMdd')}.pdf`);
  }

  // Exportar factura a PDF
  static exportInvoiceToPDF(invoice: any, cliente: any): void {
    const doc = new jsPDF();

    // Logo (placeholder)
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('FACTURA', 14, 20);

    // Información del cliente
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Cliente: ${cliente.nombre}`, 14, 35);
    doc.text(`País: ${cliente.pais}`, 14, 42);
    doc.text(`Período: ${DateUtil.getMonthName(invoice.mes)} ${invoice.año}`, 14, 49);

    // Línea separadora
    doc.line(14, 55, 196, 55);

    // Tabla de peticiones
    autoTable(doc, {
      startY: 60,
      head: [['#', 'Categoría', 'Descripción', 'Costo']],
      body: invoice.detalle_peticiones.map((p: any, index: number) => [
        index + 1,
        p.categoria.nombre,
        FormatUtil.truncate(p.descripcion, 50),
        FormatUtil.formatCurrency(p.costo)
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [255, 193, 7], textColor: [0, 0, 0] },
      foot: [[
        '', 
        '', 
        'TOTAL:', 
        FormatUtil.formatCurrency(invoice.costo_total)
      ]],
      footStyles: { fillColor: [240, 240, 240], fontStyle: 'bold' },
    });

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(
        `Página ${i} de ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    doc.save(`Factura_${cliente.nombre}_${invoice.mes}_${invoice.año}.pdf`);
  }

  // Exportar estadísticas a PDF
  static exportStatsToPDF(stats: any, titulo: string): void {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(titulo, 14, 20);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Fecha: ${DateUtil.formatDate(new Date())}`, 14, 30);

    let yPosition = 45;

    // Totales
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Resumen General', 14, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Peticiones Creadas: ${stats.totales.total_peticiones_creadas}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Total Peticiones Resueltas: ${stats.totales.total_peticiones_resueltas}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Costo Total: ${FormatUtil.formatCurrency(stats.totales.total_costo_generado)}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Tiempo Promedio: ${stats.totales.promedio_tiempo_resolucion.toFixed(2)} horas`, 20, yPosition);
    yPosition += 15;

    // Tabla por área
    if (stats.por_area && stats.por_area.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Estadísticas por Área', 14, yPosition);
      yPosition += 5;

      autoTable(doc, {
        startY: yPosition,
        head: [['Área', 'Creadas', 'Resueltas', 'Costo Total']],
        body: stats.por_area.map((area: any) => [
          area.area,
          area.peticiones_creadas,
          area.peticiones_resueltas,
          FormatUtil.formatCurrency(area.costo_total)
        ]),
        styles: { fontSize: 9 },
        headStyles: { fillColor: [255, 193, 7], textColor: [0, 0, 0] },
      });
    }

    doc.save(`Estadisticas_${DateUtil.formatDate(new Date(), 'yyyyMMdd')}.pdf`);
  }

  // Exportar a CSV
  static exportToCSV(data: any[], filename: string, columns?: string[]): void {
    const csvContent = this.convertToCSV(data, columns);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${filename}_${DateUtil.formatDate(new Date(), 'yyyyMMdd')}.csv`);
  }

  // Convertir JSON a CSV
  private static convertToCSV(data: any[], columns?: string[]): string {
    if (data.length === 0) return '';

    const keys = columns || Object.keys(data[0]);
    const header = keys.join(',');
    
    const rows = data.map(row => 
      keys.map(key => {
        let value = row[key];
        if (value === null || value === undefined) return '';
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return value;
      }).join(',')
    );

    return [header, ...rows].join('\n');
  }
}