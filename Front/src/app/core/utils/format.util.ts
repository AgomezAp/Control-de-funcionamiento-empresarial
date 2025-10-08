export class FormatUtil {
  // Formatear moneda: $1,234,567
  static formatCurrency(value: number, currency: string = 'COP'): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  // Formatear número: 1,234,567
  static formatNumber(value: number, decimals: number = 0): string {
    return new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  }

  // Formatear tamaño de archivo: 2.3 MB
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  // Capitalizar primera letra
  static capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }

  // Truncar texto
  static truncate(text: string, length: number = 50): string {
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
  }

  // Slug
  static slugify(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  }

  // Iniciales de nombre: "Juan Pérez" -> "JP"
  static getInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }

  // Formatear teléfono: +57 300 123 4567
  static formatPhone(phone: string, countryCode: string = '+57'): string {
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    
    if (match) {
      return `${countryCode} ${match[1]} ${match[2]} ${match[3]}`;
    }
    
    return phone;
  }

  // Porcentaje: 0.75 -> "75%"
  static formatPercentage(value: number, decimals: number = 0): string {
    return `${(value * 100).toFixed(decimals)}%`;
  }

  // Número con separador de miles: 1234567 -> "1.234.567"
  static formatThousands(value: number): string {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }
}