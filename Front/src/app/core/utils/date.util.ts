import { format, formatDistance, formatRelative, differenceInHours, differenceInMinutes, addHours, isAfter, isBefore } from 'date-fns';
import { es } from 'date-fns/locale';

export class DateUtil {
  // Formatear fecha: "15 de enero de 2024"
  static formatDate(date: Date | string, pattern: string = 'dd/MM/yyyy'): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return format(d, pattern, { locale: es });
  }

  // Fecha relativa: "hace 5 minutos"
  static timeAgo(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return formatDistance(d, new Date(), { addSuffix: true, locale: es });
  }

  // Fecha relativa con contexto: "ayer a las 14:30"
  static formatRelative(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return formatRelative(d, new Date(), { locale: es });
  }

  // Diferencia en horas
  static getDifferenceInHours(dateLeft: Date | string, dateRight: Date | string): number {
    const left = typeof dateLeft === 'string' ? new Date(dateLeft) : dateLeft;
    const right = typeof dateRight === 'string' ? new Date(dateRight) : dateRight;
    return differenceInHours(left, right);
  }

  // Diferencia en minutos
  static getDifferenceInMinutes(dateLeft: Date | string, dateRight: Date | string): number {
    const left = typeof dateLeft === 'string' ? new Date(dateLeft) : dateLeft;
    const right = typeof dateRight === 'string' ? new Date(dateRight) : dateRight;
    return differenceInMinutes(left, right);
  }

  // Agregar horas
  static addHours(date: Date | string, hours: number): Date {
    const d = typeof date === 'string' ? new Date(date) : date;
    return addHours(d, hours);
  }

  // Verificar si está vencida
  static isExpired(date: Date | string): boolean {
    const d = typeof date === 'string' ? new Date(date) : date;
    return isBefore(d, new Date());
  }

  // Verificar si está por vencer (menos de 2 horas)
  static isAboutToExpire(date: Date | string): boolean {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diff = differenceInHours(d, now);
    return diff >= 0 && diff < 2;
  }

  // Obtener mes y año actual
  static getCurrentMonthYear(): { mes: number; año: number } {
    const now = new Date();
    return {
      mes: now.getMonth() + 1,
      año: now.getFullYear(),
    };
  }

  // Obtener nombre del mes
  static getMonthName(month: number): string {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[month - 1];
  }

  // Formatear duración: "2h 30m"
  static formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${mins}m`;
    }
  }

  // Tiempo restante formateado: "02:45:30"
  static formatTimeRemaining(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diff = d.getTime() - now.getTime();

    if (diff <= 0) return '00:00:00';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}