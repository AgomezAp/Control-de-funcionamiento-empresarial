/**
 * ⚠️ ARCHIVO DEPRECADO ⚠️
 * 
 * Este archivo ha sido deprecado y ya NO se utiliza en la aplicación.
 * Las categorías ahora se obtienen dinámicamente desde el backend a través de la API REST.
 * 
 * @deprecated Usar CategoriaService.getAll() o métodos específicos del servicio
 * @see Backend/src/services/categoria.service.ts - Fuente de verdad única
 * @see Backend/src/scripts/init-data.ts - Datos iniciales de categorías
 * @see Front/src/app/core/services/categoria.service.ts - Servicio que consume la API
 * 
 * Este archivo se mantiene como BACKUP temporal para referencia.
 * Fecha de deprecación: Octubre 21, 2025
 */

import { AreaTipo } from '../models/categoria.model';

export const CATEGORIAS_DISENO = [
  { id: 1, nombre: 'Creación de subpestaña', area_tipo: AreaTipo.DISENO, costo: 66000, es_variable: false, requiere_descripcion_extra: false },
  { id: 2, nombre: 'Ajuste de copy', area_tipo: AreaTipo.DISENO, costo: 64000, es_variable: false, requiere_descripcion_extra: false },
  { id: 3, nombre: 'Cambio de copy', area_tipo: AreaTipo.DISENO, costo: 128000, es_variable: false, requiere_descripcion_extra: false },
  { id: 4, nombre: 'Fase 1 (color y tipografía)', area_tipo: AreaTipo.DISENO, costo: 104000, es_variable: false, requiere_descripcion_extra: false },
  { id: 5, nombre: 'Fase 2 (diagramación e imágenes)', area_tipo: AreaTipo.DISENO, costo: 144000, es_variable: false, requiere_descripcion_extra: false },
  { id: 6, nombre: 'Fase 3 (Rediseño)', area_tipo: AreaTipo.DISENO, costo: 288000, es_variable: false, requiere_descripcion_extra: false },
  { id: 7, nombre: 'Ajuste de diseño', area_tipo: AreaTipo.DISENO, costo: 80000, es_variable: false, requiere_descripcion_extra: false },
  { id: 8, nombre: 'Migración', area_tipo: AreaTipo.DISENO, costo: 64000, es_variable: false, requiere_descripcion_extra: false },
  { id: 9, nombre: 'Creación de sitio web', area_tipo: AreaTipo.DISENO, costo: 600000, es_variable: false, requiere_descripcion_extra: false },
  { id: 10, nombre: 'Cambio de número', area_tipo: AreaTipo.DISENO, costo: 10000, es_variable: false, requiere_descripcion_extra: false },
  { id: 11, nombre: 'Cambio de nombre', area_tipo: AreaTipo.DISENO, costo: 85000, es_variable: false, requiere_descripcion_extra: false },
  { id: 12, nombre: 'Modelado 3D', area_tipo: AreaTipo.DISENO, costo: 0, es_variable: true, requiere_descripcion_extra: false },
  { id: 13, nombre: 'Creación de pieza publicitaria', area_tipo: AreaTipo.DISENO, costo: 30000, es_variable: false, requiere_descripcion_extra: false },
  { id: 14, nombre: 'Ajuste de pieza publicitaria', area_tipo: AreaTipo.DISENO, costo: 15000, es_variable: false, requiere_descripcion_extra: false },
  { id: 15, nombre: 'Copia de seguridad', area_tipo: AreaTipo.DISENO, costo: 20000, es_variable: false, requiere_descripcion_extra: false },
  { id: 16, nombre: 'Barrido por diseño', area_tipo: AreaTipo.DISENO, costo: 15000, es_variable: false, requiere_descripcion_extra: false },
  { id: 17, nombre: 'Limpieza de caché', area_tipo: AreaTipo.DISENO, costo: 5000, es_variable: false, requiere_descripcion_extra: false },
  { id: 18, nombre: 'Descarga de imágenes', area_tipo: AreaTipo.DISENO, costo: 32000, es_variable: false, requiere_descripcion_extra: false },
];

export const CATEGORIAS_PAUTAS = [
  { id: 19, nombre: 'Barrido web (revisión)', area_tipo: AreaTipo.PAUTAS, costo: 7000, es_variable: false, requiere_descripcion_extra: false },
  { id: 20, nombre: 'Barrido Ads (revisión)', area_tipo: AreaTipo.PAUTAS, costo: 7000, es_variable: false, requiere_descripcion_extra: false },
  { id: 21, nombre: 'Creación de campaña', area_tipo: AreaTipo.PAUTAS, costo: 90000, es_variable: false, requiere_descripcion_extra: false },
  { id: 22, nombre: 'Ajuste de campaña', area_tipo: AreaTipo.PAUTAS, costo: 36000, es_variable: false, requiere_descripcion_extra: false },
  { id: 23, nombre: 'Palabras Clave (ajustes)', area_tipo: AreaTipo.PAUTAS, costo: 36000, es_variable: false, requiere_descripcion_extra: false },
  { id: 24, nombre: 'Palabras clave (Barrido)', area_tipo: AreaTipo.PAUTAS, costo: 18000, es_variable: false, requiere_descripcion_extra: false },
  { id: 25, nombre: 'Estrategias de seguimiento', area_tipo: AreaTipo.PAUTAS, costo: 72000, es_variable: false, requiere_descripcion_extra: true },
  { id: 26, nombre: 'Ajuste de presupuesto', area_tipo: AreaTipo.PAUTAS, costo: 72000, es_variable: false, requiere_descripcion_extra: false },
  { id: 27, nombre: 'Creación de anuncio', area_tipo: AreaTipo.PAUTAS, costo: 72000, es_variable: false, requiere_descripcion_extra: false },
  { id: 28, nombre: 'Ajuste de anuncio', area_tipo: AreaTipo.PAUTAS, costo: 36000, es_variable: false, requiere_descripcion_extra: false },
  { id: 29, nombre: 'Etiquetas de conversión', area_tipo: AreaTipo.PAUTAS, costo: 18000, es_variable: false, requiere_descripcion_extra: false },
  { id: 30, nombre: 'Verificación de anunciante', area_tipo: AreaTipo.PAUTAS, costo: 18000, es_variable: false, requiere_descripcion_extra: false },
  { id: 31, nombre: 'Apelación', area_tipo: AreaTipo.PAUTAS, costo: 18000, es_variable: false, requiere_descripcion_extra: false },
];

export const CATEGORIAS_GESTION_ADMINISTRATIVA = [
  { id: 32, nombre: 'Revisión de documentos', area_tipo: AreaTipo.GESTION_ADMINISTRATIVA, costo: 50000, es_variable: false, requiere_descripcion_extra: false },
  { id: 33, nombre: 'Gestión de contratos', area_tipo: AreaTipo.GESTION_ADMINISTRATIVA, costo: 100000, es_variable: false, requiere_descripcion_extra: false },
  { id: 34, nombre: 'Elaboración de informes', area_tipo: AreaTipo.GESTION_ADMINISTRATIVA, costo: 75000, es_variable: false, requiere_descripcion_extra: false },
  { id: 35, nombre: 'Archivo y organización', area_tipo: AreaTipo.GESTION_ADMINISTRATIVA, costo: 30000, es_variable: false, requiere_descripcion_extra: false },
  { id: 36, nombre: 'Gestión de correspondencia', area_tipo: AreaTipo.GESTION_ADMINISTRATIVA, costo: 40000, es_variable: false, requiere_descripcion_extra: false },
  { id: 37, nombre: 'Actualización de base de datos', area_tipo: AreaTipo.GESTION_ADMINISTRATIVA, costo: 60000, es_variable: false, requiere_descripcion_extra: false },
  { id: 38, nombre: 'Coordinación de reuniones', area_tipo: AreaTipo.GESTION_ADMINISTRATIVA, costo: 35000, es_variable: false, requiere_descripcion_extra: false },
  { id: 39, nombre: 'Soporte administrativo general', area_tipo: AreaTipo.GESTION_ADMINISTRATIVA, costo: 0, es_variable: true, requiere_descripcion_extra: true },
];

export const TODAS_CATEGORIAS = [...CATEGORIAS_DISENO, ...CATEGORIAS_PAUTAS, ...CATEGORIAS_GESTION_ADMINISTRATIVA];