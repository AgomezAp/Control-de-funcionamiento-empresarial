import { Usuario } from './usuario.model';

export interface Cliente {
  id: number;
  nombre: string;
  pais: string;
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
  pais: string;
  pautador_id: number;
  disenador_id?: number;
  fecha_inicio: Date | string;
}

export interface ClienteUpdate {
  nombre?: string;
  pais?: string;
  pautador_id?: number;
  disenador_id?: number;
  fecha_inicio?: Date | string;
  status?: boolean;
}