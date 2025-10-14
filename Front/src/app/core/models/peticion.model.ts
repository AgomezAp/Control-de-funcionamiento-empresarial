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
  fecha_resolucion?: Date | null;
  
  // Campos del temporizador
  tiempo_empleado_segundos: number;
  temporizador_activo: boolean;
  fecha_inicio_temporizador?: Date | null;
  fecha_pausa_temporizador?: Date | null;
  
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
}

export interface PeticionUpdate {
  descripcion?: string;
  descripcion_extra?: string;
  costo?: number;
}

export interface PeticionAceptar {
  // Ya no necesita tiempo_limite_horas
}

export interface PeticionCambiarEstado {
  estado: EstadoPeticion;
}

export interface TiempoEmpleado {
  tiempo_empleado_segundos: number;
  tiempo_empleado_formato: string;
  temporizador_activo: boolean;
}

export interface PeticionFiltros {
  estado?: EstadoPeticion;
  cliente_id?: number;
  area?: string;
  creador_id?: number;
  asignado_a?: number;
}