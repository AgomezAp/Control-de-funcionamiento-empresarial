export enum TipoProblema {
  CAMPANA = 'Campaña',
  DISENO_WEB = 'Diseño Web',
  SOPORTE_TECNICO = 'Soporte Técnico',
  CONSULTA_GENERAL = 'Consulta General',
  ESCALAMIENTO = 'Escalamiento',
  SEGUIMIENTO = 'Seguimiento',
  OTRO = 'Otro'
}

export enum PrioridadReporte {
  BAJA = 'Baja',
  MEDIA = 'Media',
  ALTA = 'Alta',
  URGENTE = 'Urgente'
}

export enum EstadoReporte {
  PENDIENTE = 'Pendiente',
  EN_ATENCION = 'En Atención',
  RESUELTO = 'Resuelto',
  CANCELADO = 'Cancelado'
}

export interface Cliente {
  id: number;
  nombre: string;
  cedula?: string;
  correo?: string;
}

export interface Usuario {
  uid: number;
  nombre_completo: string;
  correo: string;
  area?: {
    nombre: string;
  };
}

export interface ReporteCliente {
  id: number;
  cliente_id: number;
  tipo_problema: TipoProblema;
  descripcion_problema: string;
  prioridad: PrioridadReporte;
  estado: EstadoReporte;
  creado_por: number;
  atendido_por?: number;
  peticiones_relacionadas?: number[];
  notas_internas?: string;
  fecha_creacion: Date | string;
  fecha_atencion?: Date | string;
  fecha_resolucion?: Date | string;
  
  // Relaciones cargadas
  cliente?: Cliente;
  creador?: Usuario;
  tecnico?: Usuario;
}

export interface CrearReporteDTO {
  cliente_id: number;
  tipo_problema: TipoProblema;
  descripcion_problema: string;
  prioridad: PrioridadReporte;
  notas_internas?: string;
}

export interface ActualizarEstadoDTO {
  estado: EstadoReporte;
  notas?: string;
}

export interface VincularPeticionDTO {
  peticion_id: number;
}

export interface FiltrosReporte {
  estado?: EstadoReporte;
  prioridad?: PrioridadReporte;
  tipo_problema?: TipoProblema;
  creado_por?: number;
  atendido_por?: number;
  cliente_id?: number;
}

export interface EstadisticasReporte {
  total: number;
  pendientes: number;
  enAtencion: number;
  resueltos: number;
  porPrioridad: {
    prioridad: PrioridadReporte;
    cantidad: number;
  }[];
  tiempoPromedioResolucion: number; // En horas
}

// Constantes útiles para dropdowns
export const TIPOS_PROBLEMA = [
  { value: TipoProblema.CAMPANA, label: 'Campaña' },
  { value: TipoProblema.DISENO_WEB, label: 'Diseño Web' },
  { value: TipoProblema.SOPORTE_TECNICO, label: 'Soporte Técnico' },
  { value: TipoProblema.CONSULTA_GENERAL, label: 'Consulta General' },
  { value: TipoProblema.ESCALAMIENTO, label: 'Escalamiento' },
  { value: TipoProblema.SEGUIMIENTO, label: 'Seguimiento' },
  { value: TipoProblema.OTRO, label: 'Otro' }
];

export const PRIORIDADES = [
  { value: PrioridadReporte.BAJA, label: 'Baja', severity: 'info' },
  { value: PrioridadReporte.MEDIA, label: 'Media', severity: 'warning' },
  { value: PrioridadReporte.ALTA, label: 'Alta', severity: 'danger' },
  { value: PrioridadReporte.URGENTE, label: 'Urgente', severity: 'danger' }
];

export const ESTADOS_REPORTE = [
  { value: EstadoReporte.PENDIENTE, label: 'Pendiente', severity: 'warning' },
  { value: EstadoReporte.EN_ATENCION, label: 'En Atención', severity: 'info' },
  { value: EstadoReporte.RESUELTO, label: 'Resuelto', severity: 'success' },
  { value: EstadoReporte.CANCELADO, label: 'Cancelado', severity: 'danger' }
];
