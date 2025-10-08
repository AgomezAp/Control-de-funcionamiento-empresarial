import { RoleEnum } from '../models/role.model';

export const ROLES = {
  [RoleEnum.ADMIN]: {
    id: 1,
    nombre: 'Admin',
    descripcion: 'Acceso total al sistema',
    color: '#FF5722',
    icon: 'pi pi-shield',
  },
  [RoleEnum.DIRECTIVO]: {
    id: 2,
    nombre: 'Directivo',
    descripcion: 'Gestión de su área',
    color: '#9C27B0',
    icon: 'pi pi-users',
  },
  [RoleEnum.LIDER]: {
    id: 3,
    nombre: 'Líder',
    descripcion: 'Supervisión de equipo',
    color: '#2196F3',
    icon: 'pi pi-user',
  },
  [RoleEnum.USUARIO]: {
    id: 4,
    nombre: 'Usuario',
    descripcion: 'Usuario estándar',
    color: '#4CAF50',
    icon: 'pi pi-user',
  },
};

export const PERMISOS_POR_ROL = {
  [RoleEnum.ADMIN]: {
    peticiones: ['crear', 'ver', 'editar', 'eliminar', 'cambiar_estado', 'ver_todas'],
    clientes: ['crear', 'ver', 'editar', 'eliminar', 'ver_todos'],
    usuarios: ['crear', 'ver', 'editar', 'eliminar', 'cambiar_status', 'cambiar_rol', 'ver_todos'],
    estadisticas: ['ver_globales', 'ver_todas_areas', 'recalcular'],
    facturacion: ['generar', 'cerrar', 'facturar', 'ver_todas'],
    areas: ['todas'],
  },
  [RoleEnum.DIRECTIVO]: {
    peticiones: ['crear', 'ver', 'editar', 'cambiar_estado', 'ver_area'],
    clientes: ['crear', 'ver', 'editar', 'ver_area'],
    usuarios: ['ver', 'editar', 'cambiar_status', 'ver_area'],
    estadisticas: ['ver_area', 'ver_usuarios_area'],
    facturacion: ['generar', 'cerrar', 'facturar', 'ver_area'],
    areas: ['propia'],
  },
  [RoleEnum.LIDER]: {
    peticiones: ['crear', 'ver', 'editar', 'ver_area'],
    clientes: ['crear', 'ver', 'ver_area'],
    usuarios: ['ver', 'ver_area'],
    estadisticas: ['ver_area', 'ver_usuarios_area'],
    facturacion: ['ver_area'],
    areas: ['propia'],
  },
  [RoleEnum.USUARIO]: {
    peticiones: ['crear', 'ver_propias', 'aceptar', 'cambiar_estado_propias'],
    clientes: ['ver_asignados'],
    usuarios: ['ver_perfil'],
    estadisticas: ['ver_propias'],
    facturacion: [],
    areas: ['propia'],
  },
};