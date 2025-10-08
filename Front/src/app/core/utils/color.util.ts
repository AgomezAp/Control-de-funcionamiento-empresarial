export class ColorUtil {
  // Generar color aleatorio
  static randomColor(): string {
    return '#' + Math.floor(Math.random() * 16777215).toString(16);
  }

  // Convertir hex a rgba
  static hexToRgba(hex: string, alpha: number = 1): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  // Obtener color por estado
  static getColorByEstado(estado: string): string {
    const colores: { [key: string]: string } = {
      'Pendiente': '#2196F3',
      'En Progreso': '#4CAF50',
      'Resuelta': '#8BC34A',
      'Cancelada': '#F44336',
      'Vencida': '#D32F2F',
    };
    return colores[estado] || '#9E9E9E';
  }

  // Obtener color por área
  static getColorByArea(area: string): string {
    const colores: { [key: string]: string } = {
      'Gestión Administrativa': '#FF9800',
      'Pautas': '#2196F3',
      'Diseño': '#9C27B0',
      'Contabilidad': '#4CAF50',
      'Programación': '#607D8B',
    };
    return colores[area] || '#9E9E9E';
  }

  // Generar paleta de colores
  static generatePalette(baseColor: string, count: number): string[] {
    const palette: string[] = [];
    const base = parseInt(baseColor.slice(1), 16);
    
    for (let i = 0; i < count; i++) {
      const variation = Math.floor((base + (i * 0x111111)) % 0xFFFFFF);
      palette.push('#' + variation.toString(16).padStart(6, '0'));
    }
    
    return palette;
  }

  // Verificar si un color es oscuro
  static isDark(hex: string): boolean {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness < 128;
  }

  // Obtener color de texto contrastante
  static getContrastColor(hex: string): string {
    return this.isDark(hex) ? '#FFFFFF' : '#000000';
  }
}