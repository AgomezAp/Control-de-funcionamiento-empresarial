/**
 * Estados de presencia del usuario (tipo Discord)
 * - Activo: Usuario disponible (verde)
 * - Ausente: Usuario temporalmente ausente (amarillo)
 * - No Molestar: Usuario no quiere ser interrumpido (rojo)
 * - Away: Automático tras 15 min de inactividad (amarillo oscuro)
 * 
 * Nota: "Inactivo" (gris) es diferente - es cuando Admin desactiva al usuario (status=false)
 */
export enum EstadoPresencia {
  ACTIVO = 'Activo',
  AUSENTE = 'Ausente',
  NO_MOLESTAR = 'No Molestar',
  AWAY = 'Away'
}

export interface EstadoPresenciaConfig {
  valor: EstadoPresencia;
  label: string;
  color: string; // Color PrimeNG
  colorHex: string; // Color hex para íconos
  icon: string; // Icono PrimeNG
  descripcion: string;
  seleccionableUsuario: boolean; // Si el usuario puede seleccionarlo manualmente
}

export const ESTADOS_PRESENCIA: EstadoPresenciaConfig[] = [
  {
    valor: EstadoPresencia.ACTIVO,
    label: 'Activo',
    color: 'success',
    colorHex: '#22C55E', // verde
    icon: 'pi-circle-fill',
    descripcion: 'Disponible y activo',
    seleccionableUsuario: true
  },
  {
    valor: EstadoPresencia.AUSENTE,
    label: 'Ausente',
    color: 'warning',
    colorHex: '#EAB308', // amarillo
    icon: 'pi-moon',
    descripcion: 'Temporalmente ausente',
    seleccionableUsuario: true
  },
  {
    valor: EstadoPresencia.NO_MOLESTAR,
    label: 'No Molestar',
    color: 'danger',
    colorHex: '#EF4444', // rojo
    icon: 'pi-minus-circle',
    descripcion: 'No molestar',
    seleccionableUsuario: true
  },
  {
    valor: EstadoPresencia.AWAY,
    label: 'Inactivo',
    color: 'warning',
    colorHex: '#F59E0B', // amarillo oscuro
    icon: 'pi-clock',
    descripcion: 'Ausente por inactividad (15 min)',
    seleccionableUsuario: false // Automático, usuario no puede seleccionar
  }
];

/**
 * Obtener configuración de un estado de presencia
 */
export function getEstadoPresenciaConfig(estado: EstadoPresencia | string): EstadoPresenciaConfig {
  const config = ESTADOS_PRESENCIA.find(e => e.valor === estado);
  return config || ESTADOS_PRESENCIA[0]; // Default: Activo
}

/**
 * Obtener estados seleccionables por el usuario (excluye Away)
 */
export function getEstadosSeleccionables(): EstadoPresenciaConfig[] {
  return ESTADOS_PRESENCIA.filter(e => e.seleccionableUsuario);
}

/**
 * Tiempo de inactividad en milisegundos para cambiar a Away (15 minutos)
 */
export const TIEMPO_INACTIVIDAD_MS = 15 * 60 * 1000; // 15 minutos
