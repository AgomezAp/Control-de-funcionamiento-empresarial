import { Usuario } from './usuario.model';

export interface EstadisticaUsuario {
  id: number;
  usuario_id: number;
  año: number;
  mes: number;
  peticiones_creadas: number;
  peticiones_resueltas: number;
  peticiones_canceladas: number;
  tiempo_promedio_resolucion_horas?: number | null;
  costo_total_generado: number;
  fecha_calculo: Date;
  usuario?: Usuario;
}

export interface EstadisticaGlobal {
  totales: {
    total_peticiones_creadas: number;
    total_peticiones_resueltas: number;
    total_peticiones_canceladas: number;
    total_costo_generado: number;
    promedio_tiempo_resolucion: number;
  };
  por_area: EstadisticaPorArea[];
  por_usuario: EstadisticaUsuario[];
}

export interface EstadisticaPorArea {
  area: string;
  peticiones_creadas: number;
  peticiones_resueltas: number;
  peticiones_canceladas: number;
  costo_total: number;
  efectividad: number | string;
}

export interface TopUsuario {
  usuario: Usuario;
  peticiones_resueltas: number;
  costo_total: number;
  tiempo_promedio: number;
}