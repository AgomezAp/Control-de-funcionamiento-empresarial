import { environment } from "../../../environments/environments";

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: `${environment.apiUrl}/auth/login`,
    REGISTRO: `${environment.apiUrl}/auth/registro`,
    PERFIL: `${environment.apiUrl}/auth/perfil`,
  },

  // Usuarios
  USUARIOS: {
    BASE: `${environment.apiUrl}/usuarios`,
    BY_ID: (uid: number) => `${environment.apiUrl}/usuarios/${uid}`,
    BY_AREA: (area: string) => `${environment.apiUrl}/usuarios/area/${area}`,
    CAMBIAR_STATUS: (uid: number) => `${environment.apiUrl}/usuarios/${uid}/status`,
  },

  // Clientes
  CLIENTES: {
    BASE: `${environment.apiUrl}/clientes`,
    BY_ID: (id: number) => `${environment.apiUrl}/clientes/${id}`,
  },

  // Peticiones
  PETICIONES: {
    BASE: `${environment.apiUrl}/peticiones`,
    BY_ID: (id: number) => `${environment.apiUrl}/peticiones/${id}`,
    PENDIENTES: `${environment.apiUrl}/peticiones/pendientes`,
    HISTORICO: `${environment.apiUrl}/peticiones/historico`,
    CLIENTE_MES: `${environment.apiUrl}/peticiones/cliente-mes`,
    ACEPTAR: (id: number) => `${environment.apiUrl}/peticiones/${id}/aceptar`,
    CAMBIAR_ESTADO: (id: number) => `${environment.apiUrl}/peticiones/${id}/estado`,
  },

  // Estadísticas
  ESTADISTICAS: {
    MIS_ESTADISTICAS: `${environment.apiUrl}/estadisticas/mis-estadisticas`,
    CALCULAR: `${environment.apiUrl}/estadisticas/calcular`,
    RECALCULAR: `${environment.apiUrl}/estadisticas/recalcular`,
    GLOBALES: `${environment.apiUrl}/estadisticas/globales`,
    POR_AREA: (area: string) => `${environment.apiUrl}/estadisticas/area/${area}`,
    POR_USUARIO: (uid: number) => `${environment.apiUrl}/estadisticas/usuario/${uid}`,
  },

  // Facturación
  FACTURACION: {
    BASE: `${environment.apiUrl}/facturacion`,
    GENERAR: `${environment.apiUrl}/facturacion/generar`,
    GENERAR_TODOS: `${environment.apiUrl}/facturacion/generar-todos`,
    RESUMEN: `${environment.apiUrl}/facturacion/resumen`,
    DETALLE: `${environment.apiUrl}/facturacion/detalle`,
    BY_ID: (id: number) => `${environment.apiUrl}/facturacion/${id}`,
    CERRAR: (id: number) => `${environment.apiUrl}/facturacion/${id}/cerrar`,
    FACTURAR: (id: number) => `${environment.apiUrl}/facturacion/${id}/facturar`,
    POR_CLIENTE: (clienteId: number) => `${environment.apiUrl}/facturacion/cliente/${clienteId}`,
  },
};

export const WS_EVENTS = {
  // Eventos del servidor
  NUEVA_PETICION: 'nuevaPeticion',
  CAMBIO_ESTADO: 'cambioEstado',
  NUEVO_COMENTARIO: 'nuevoComentario',
  PETICION_ACEPTADA: 'peticionAceptada',
  PETICION_VENCIDA: 'peticionVencida',
  USUARIO_ONLINE: 'usuarioOnline',
  USUARIO_OFFLINE: 'usuarioOffline',
  USUARIO_ESCRIBIENDO: 'usuarioEscribiendo',

  // Eventos del cliente
  JOIN_ROOM: 'joinRoom',
  LEAVE_ROOM: 'leaveRoom',
  TYPING: 'typing',
  STOP_TYPING: 'stopTyping',
};