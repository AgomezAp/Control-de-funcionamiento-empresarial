import { Usuario } from './usuario.model';

export interface Archivo {
  id: number;
  peticion_id: number;
  nombre: string;
  nombre_original: string;
  tamano: number;
  tipo: string;
  url: string;
  usuario_id: number;
  fecha_subida: Date;
  usuario?: Usuario;
}

export interface ArchivoUpload {
  peticion_id: number;
  archivo: File;
}