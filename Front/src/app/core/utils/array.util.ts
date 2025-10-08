export class ArrayUtil {
  // Ordenar array por propiedad
  static sortBy<T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] {
    return [...array].sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];
      
      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // Agrupar por propiedad
  static groupBy<T>(array: T[], key: keyof T): { [key: string]: T[] } {
    return array.reduce((result, item) => {
      const groupKey = String(item[key]);
      if (!result[groupKey]) {
        result[groupKey] = [];
      }
      result[groupKey].push(item);
      return result;
    }, {} as { [key: string]: T[] });
  }

  // Eliminar duplicados
  static unique<T>(array: T[]): T[] {
    return [...new Set(array)];
  }

  // Eliminar duplicados por propiedad
  static uniqueBy<T>(array: T[], key: keyof T): T[] {
    const seen = new Set();
    return array.filter(item => {
      const value = item[key];
      if (seen.has(value)) {
        return false;
      }
      seen.add(value);
      return true;
    });
  }

  // Paginar array
  static paginate<T>(array: T[], page: number, pageSize: number): T[] {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return array.slice(start, end);
  }

  // Dividir array en chunks
  static chunk<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  // Mezclar array (shuffle)
  static shuffle<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Obtener elementos aleatorios
  static sample<T>(array: T[], count: number): T[] {
    const shuffled = this.shuffle(array);
    return shuffled.slice(0, Math.min(count, array.length));
  }

  // Sumar valores de una propiedad
  static sumBy<T>(array: T[], key: keyof T): number {
    return array.reduce((sum, item) => sum + Number(item[key]), 0);
  }

  // Promedio de valores de una propiedad
  static averageBy<T>(array: T[], key: keyof T): number {
    if (array.length === 0) return 0;
    return this.sumBy(array, key)
        return this.sumBy(array, key) / array.length;
  }

  // Encontrar mínimo por propiedad
  static minBy<T>(array: T[], key: keyof T): T | undefined {
    if (array.length === 0) return undefined;
    return array.reduce((min, item) => 
      Number(item[key]) < Number(min[key]) ? item : min
    );
  }

  // Encontrar máximo por propiedad
  static maxBy<T>(array: T[], key: keyof T): T | undefined {
    if (array.length === 0) return undefined;
    return array.reduce((max, item) => 
      Number(item[key]) > Number(max[key]) ? item : max
    );
  }

  // Filtrar valores nulos/undefined
  static compact<T>(array: (T | null | undefined)[]): T[] {
    return array.filter((item): item is T => item !== null && item !== undefined);
  }

  // Diferencia entre dos arrays
  static difference<T>(array1: T[], array2: T[]): T[] {
    return array1.filter(item => !array2.includes(item));
  }

  // Intersección de dos arrays
  static intersection<T>(array1: T[], array2: T[]): T[] {
    return array1.filter(item => array2.includes(item));
  }

  // Contar ocurrencias
  static countBy<T>(array: T[], key: keyof T): { [key: string]: number } {
    return array.reduce((result, item) => {
      const groupKey = String(item[key]);
      result[groupKey] = (result[groupKey] || 0) + 1;
      return result;
    }, {} as { [key: string]: number });
  }
}