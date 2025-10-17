import { Usuario } from './usuario.model';

export enum TipoCliente {
  META_ADS = 'Meta Ads',
  GOOGLE_ADS = 'Google Ads',
  EXTERNO = 'Externo',
  OTRO = 'Otro'
}

export interface Cliente {
  id: number;
  nombre: string;
  cedula?: string; // ✅ Nuevo campo
  pais: string;
  tipo_cliente: TipoCliente;
  pautador_id: number;
  disenador_id?: number | null;
  fecha_creacion: Date;
  fecha_inicio: Date;
  status: boolean;
  pautador?: Usuario;
  disenador?: Usuario;
}

export interface ClienteCreate {
  nombre: string;
  cedula?: string; // ✅ Nuevo campo
  pais: string;
  tipo_cliente: TipoCliente | string;
  pautador_id: number;
  disenador_id?: number;
  fecha_inicio: Date | string;
}

export interface ClienteUpdate {
  nombre?: string;
  cedula?: string; // ✅ Nuevo campo
  pais?: string;
  tipo_cliente?: TipoCliente | string;
  pautador_id?: number;
  disenador_id?: number;
  fecha_inicio?: Date | string;
  status?: boolean;
}