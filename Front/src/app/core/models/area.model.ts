export enum AreaEnum {
  GESTION_ADMINISTRATIVA = 'Gestión Administrativa',
  PAUTAS = 'Pautas',
  DISENO = 'Diseño',
  CONTABILIDAD = 'Contabilidad',
  PROGRAMACION = 'Programación'
}

export interface Area {
  id: number;
  nombre: AreaEnum;
  descripcion?: string;
}