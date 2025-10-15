export enum TipoNotificacion {
  ASIGNACION = 'asignacion',
  CAMBIO_ESTADO = 'cambio_estado',
  COMENTARIO = 'comentario',
  MENCION = 'mencion',
  SISTEMA = 'sistema'
}

export interface Notificacion {
  id: number;
  usuario_id: number;
  tipo: TipoNotificacion;
  titulo: string;
  mensaje: string;
  peticion_id?: number;
  leida: boolean;
  fecha_creacion: Date;
  fecha_lectura?: Date;
  peticion?: any; // Datos de la petición si se incluyen
}

export interface NotificacionCreate {
  tipo: TipoNotificacion;
  titulo: string;
  mensaje: string;
  peticion_id?: number;
}

export interface NotificacionFiltros {
  leida?: boolean;
  limit?: number;
}