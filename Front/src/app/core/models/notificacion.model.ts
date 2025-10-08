export enum TipoNotificacion {
  NUEVA_PETICION = 'NUEVA_PETICION',
  PETICION_ACEPTADA = 'PETICION_ACEPTADA',
  PETICION_RESUELTA = 'PETICION_RESUELTA',
  PETICION_VENCIDA = 'PETICION_VENCIDA',
  NUEVO_COMENTARIO = 'NUEVO_COMENTARIO',
  CAMBIO_ESTADO = 'CAMBIO_ESTADO',
  ASIGNACION = 'ASIGNACION'
}

export interface Notificacion {
  id: string;
  tipo: TipoNotificacion;
  titulo: string;
  mensaje: string;
  peticion_id?: number;
  usuario_id: number;
  leida: boolean;
  fecha: Date;
  data?: any;
}

export interface NotificacionPush {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: any;
}