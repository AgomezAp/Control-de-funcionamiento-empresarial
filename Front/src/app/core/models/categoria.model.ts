export enum AreaTipo {
  DISENO = 'Diseño',
  PAUTAS = 'Pautas',
  GESTION_ADMINISTRATIVA = 'Gestión Administrativa'
}
export interface Categoria {
  id: number;
  nombre: string;
  area_tipo: AreaTipo;
  costo: number;
  es_variable: boolean;
  requiere_descripcion_extra: boolean;
}
// Categorías de Diseño
export enum CategoriasDiseno {
  CREACION_SUBPESTANA = 'Creación de subpestaña',
  AJUSTE_COPY = 'Ajuste de copy',
  CAMBIO_COPY = 'Cambio de copy',
  FASE_1 = 'Fase 1 (color y tipografía)',
  FASE_2 = 'Fase 2 (diagramación e imágenes)',
  FASE_3 = 'Fase 3 (Rediseño)',
  AJUSTE_DISENO = 'Ajuste de diseño',
  MIGRACION = 'Migración',
  CREACION_SITIO_WEB = 'Creación de sitio web',
  CAMBIO_NUMERO = 'Cambio de número',
  CAMBIO_NOMBRE = 'Cambio de nombre',
  MODELADO_3D = 'Modelado 3D',
  CREACION_PIEZA = 'Creación de pieza publicitaria',
  AJUSTE_PIEZA = 'Ajuste de pieza publicitaria',
  COPIA_SEGURIDAD = 'Copia de seguridad',
  BARRIDO_DISENO = 'Barrido por diseño',
  LIMPIEZA_CACHE = 'Limpieza de caché',
  DESCARGA_IMAGENES = 'Descarga de imágenes'
}
// Categorías de Pautas
export enum CategoriasPautas {
  BARRIDO_WEB = 'Barrido web (revisión)',
  BARRIDO_ADS = 'Barrido Ads (revisión)',
  CREACION_CAMPANA = 'Creación de campaña',
  AJUSTE_CAMPANA = 'Ajuste de campaña',
  PALABRAS_CLAVE_AJUSTES = 'Palabras Clave (ajustes)',
  PALABRAS_CLAVE_BARRIDO = 'Palabras clave (Barrido)',
  ESTRATEGIAS_SEGUIMIENTO = 'Estrategias de seguimiento',
  AJUSTE_PRESUPUESTO = 'Ajuste de presupuesto',
  CREACION_ANUNCIO = 'Creación de anuncio',
  AJUSTE_ANUNCIO = 'Ajuste de anuncio',
  ETIQUETAS_CONVERSION = 'Etiquetas de conversión',
  VERIFICACION_ANUNCIANTE = 'Verificación de anunciante',
  APELACION = 'Apelación'
}
// Categorías de Gestión Administrativa
// NOTA: El usuario puede modificar estas categorías según sus necesidades
export enum CategoriasGestionAdministrativa {
  TRAMITE_ADMINISTRATIVO = 'Trámite Administrativo',
  GESTION_DOCUMENTAL = 'Gestión Documental',
  ARCHIVO_ORGANIZACION = 'Archivo y Organización',
  PROCESO_COMPRAS = 'Proceso de Compras',
  GESTION_CONTRATOS = 'Gestión de Contratos'
}
