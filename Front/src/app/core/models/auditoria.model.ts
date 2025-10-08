import { Usuario } from './usuario.model';

export enum TipoCambio {
  INSERT = 'INSERT',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  ASIGNACION = 'ASIGNACION',
  CAMBIO_ESTADO = 'CAMBIO_ESTADO'
}

export interface AuditoriaCambio {
  id: number;
  tabla_afectada: string;
  registro_id: number;
  tipo_cambio: TipoCambio;
  campo_modificado?: string | null;
  valor_anterior?: string | null;
  valor_nuevo?: string | null;
  usuario_id: number;
  fecha_cambio: Date;
  descripcion?: string | null;
  usuario?: Usuario;
}

export interface AuditoriaFiltros {
  tabla_afectada?: string;
  registro_id?: number;
  usuario_id?: number;
  fecha_inicio?: Date;
  fecha_fin?: Date;
}