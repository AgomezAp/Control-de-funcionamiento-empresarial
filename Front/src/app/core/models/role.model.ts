export enum RoleEnum {
  ADMIN = 'Admin',
  DIRECTIVO = 'Directivo',
  LIDER = 'Líder',
  USUARIO = 'Usuario'
}

export interface Role {
  id: number;
  nombre: RoleEnum;
  descripcion?: string;
}