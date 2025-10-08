import { Usuario } from './usuario.model';

export interface Comentario {
  id: number;
  peticion_id: number;
  usuario_id: number;
  contenido: string;
  fecha: Date;
  editado: boolean;
  usuario?: Usuario;
}

export interface ComentarioCreate {
  peticion_id: number;
  contenido: string;
}

export interface ComentarioUpdate {
  contenido: string;
}