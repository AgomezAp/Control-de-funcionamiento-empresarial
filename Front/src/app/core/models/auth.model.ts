import { RoleEnum } from './role.model';
import { AreaEnum } from './area.model';

export interface LoginRequest {
  correo: string;
  contrasena: string;
}

export interface LoginResponse {
  token: string;
  usuario: UsuarioAuth;
}

export interface UsuarioAuth {
  uid: number;
  nombre_completo: string;
  correo: string;
  rol: RoleEnum;
  area: AreaEnum;
}

export interface JWTPayload {
  uid: number;
  correo: string;
  rol: RoleEnum;
  area: AreaEnum;
  iat?: number;
  exp?: number;
}

export interface RegisterRequest {
  nombre_completo: string;
  correo: string;
  contrasena: string;
  rol_id: number;
  area_id: number;
}