import { AreaTipo } from '../models/categoria.model';

export const CATEGORIAS_DISENO = [
  { id: 1, nombre: 'Creación de subpestaña', costo: 66000, es_variable: false },
  { id: 2, nombre: 'Ajuste de copy', costo: 64000, es_variable: false },
  { id: 3, nombre: 'Cambio de copy', costo: 128000, es_variable: false },
  { id: 4, nombre: 'Fase 1 (color y tipografía)', costo: 104000, es_variable: false },
  { id: 5, nombre: 'Fase 2 (diagramación e imágenes)', costo: 144000, es_variable: false },
  { id: 6, nombre: 'Fase 3 (Rediseño)', costo: 288000, es_variable: false },
  { id: 7, nombre: 'Ajuste de diseño', costo: 80000, es_variable: false },
  { id: 8, nombre: 'Migración', costo: 64000, es_variable: false },
  { id: 9, nombre: 'Creación de sitio web', costo: 600000, es_variable: false },
  { id: 10, nombre: 'Cambio de número', costo: 10000, es_variable: false },
  { id: 11, nombre: 'Cambio de nombre', costo: 85000, es_variable: false },
  { id: 12, nombre: 'Modelado 3D', costo: 0, es_variable: true },
  { id: 13, nombre: 'Creación de pieza publicitaria', costo: 30000, es_variable: false },
  { id: 14, nombre: 'Ajuste de pieza publicitaria', costo: 15000, es_variable: false },
  { id: 15, nombre: 'Copia de seguridad', costo: 20000, es_variable: false },
  { id: 16, nombre: 'Barrido por diseño', costo: 15000, es_variable: false },
  { id: 17, nombre: 'Limpieza de caché', costo: 5000, es_variable: false },
  { id: 18, nombre: 'Descarga de imágenes', costo: 32000, es_variable: false },
];

export const CATEGORIAS_PAUTAS = [
  { id: 19, nombre: 'Barrido web (revisión)', costo: 7000, es_variable: false },
  { id: 20, nombre: 'Barrido Ads (revisión)', costo: 7000, es_variable: false },
  { id: 21, nombre: 'Creación de campaña', costo: 90000, es_variable: false },
  { id: 22, nombre: 'Ajuste de campaña', costo: 36000, es_variable: false },
  { id: 23, nombre: 'Palabras Clave (ajustes)', costo: 36000, es_variable: false },
  { id: 24, nombre: 'Palabras clave (Barrido)', costo: 18000, es_variable: false },
  { id: 25, nombre: 'Estrategias de seguimiento', costo: 72000, es_variable: false, requiere_descripcion_extra: true },
  { id: 26, nombre: 'Ajuste de presupuesto', costo: 72000, es_variable: false },
  { id: 27, nombre: 'Creación de anuncio', costo: 72000, es_variable: false },
  { id: 28, nombre: 'Ajuste de anuncio', costo: 36000, es_variable: false },
  { id: 29, nombre: 'Etiquetas de conversión', costo: 18000, es_variable: false },
  { id: 30, nombre: 'Verificación de anunciante', costo: 18000, es_variable: false },
  { id: 31, nombre: 'Apelación', costo: 18000, es_variable: false },
];

export const TODAS_CATEGORIAS = [...CATEGORIAS_DISENO, ...CATEGORIAS_PAUTAS];