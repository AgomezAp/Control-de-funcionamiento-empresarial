import { Area } from "./area.model";
import { Role } from "./role.model";

export interface Usuario {
  uid: number;
  nombre_completo: string;
  correo: string;
  status: boolean;
  rol_id: number;
  area_id: number;
  fecha_creacion: Date;
  fecha_actualizacion: Date;
  rol?: Role;
  area?: Area;
}

export interface UsuarioCreate {
  nombre_completo: string;
  correo: string;
  contrasena: string;
  rol_id: number;
  area_id: number;
}

export interface UsuarioUpdate {
  nombre_completo?: string;
  correo?: string;
  contrasena?: string;
  rol_id?: number;
  area_id?: number;
  status?: boolean;
}