import { Cliente } from './cliente.model';
import { Categoria } from './categoria.model';
import { Usuario } from './usuario.model';

export interface PeticionHistorico {
  id: number;
  peticion_id_original: number;
  cliente_id: number;
  categoria_id: number;
  descripcion: string;
  descripcion_extra?: string | null;
  costo: number;
  estado: 'Resuelta' | 'Cancelada';
  creador_id: number;
  asignado_a?: number | null;
  fecha_creacion: Date;
  fecha_aceptacion?: Date | null;
  fecha_limite?: Date | null;
  fecha_resolucion: Date;
  fecha_movido_historico: Date;
  tiempo_limite_horas?: number | null;
  
  // Relaciones
  cliente?: Cliente;
  categoria?: Categoria;
  creador?: Usuario;
  asignado?: Usuario;
}

export interface HistoricoFiltros {
  cliente_id?: number;
  estado?: 'Resuelta' | 'Cancelada';
  año?: number;
  mes?: number;
}