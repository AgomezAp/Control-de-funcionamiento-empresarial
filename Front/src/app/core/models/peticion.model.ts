import { Cliente } from './cliente.model';
import { Categoria } from './categoria.model';
import { Usuario } from './usuario.model';

export enum EstadoPeticion {
  PENDIENTE = 'Pendiente',
  EN_PROGRESO = 'En Progreso',
  RESUELTA = 'Resuelta',
  CANCELADA = 'Cancelada'
}

export interface Peticion {
  id: number;
  cliente_id: number;
  categoria_id: number;
  descripcion: string;
  descripcion_extra?: string | null;
  costo: number;
  estado: EstadoPeticion;
  creador_id: number;
  asignado_a?: number | null;
  fecha_creacion: Date;
  fecha_aceptacion?: Date | null;
  fecha_limite?: Date | null;
  fecha_resolucion?: Date | null;
  tiempo_limite_horas?: number | null;
  
  // Relaciones
  cliente?: Cliente;
  categoria?: Categoria;
  creador?: Usuario;
  asignado?: Usuario;
}

export interface PeticionCreate {
  cliente_id: number;
  categoria_id: number;
  descripcion: string;
  descripcion_extra?: string;
  costo?: number;
  tiempo_limite_horas?: number;
}

export interface PeticionUpdate {
  descripcion?: string;
  descripcion_extra?: string;
  costo?: number;
  tiempo_limite_horas?: number;
}

export interface PeticionAceptar {
  tiempo_limite_horas: number;
}

export interface PeticionCambiarEstado {
  estado: EstadoPeticion;
}

export interface PeticionFiltros {
  estado?: EstadoPeticion;
  cliente_id?: number;
  area?: string;
  creador_id?: number;
  asignado_a?: number;
}