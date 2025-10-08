import { RoleEnum } from '../models/role.model';
import { AreaEnum } from '../models/area.model';
import { PERMISOS_POR_ROL } from '../constants/roles.constants';

export class PermissionUtil {
  // Verificar si el usuario tiene un permiso específico
  static hasPermission(userRole: RoleEnum, module: string, action: string): boolean {
    const permissions = PERMISOS_POR_ROL[userRole];
    
    if (!permissions || !permissions[module]) {
      return false;
    }

    return permissions[module].includes(action);
  }

  // Verificar si el usuario puede ver todos los datos
  static canViewAll(userRole: RoleEnum): boolean {
    return userRole === RoleEnum.ADMIN;
  }

  // Verificar si el usuario puede ver datos de su área
  static canViewArea(userRole: RoleEnum): boolean {
    return [RoleEnum.ADMIN, RoleEnum.DIRECTIVO, RoleEnum.LIDER].includes(userRole);
  }

  // Verificar si el usuario puede editar
  static canEdit(userRole: RoleEnum, module: string): boolean {
    return this.hasPermission(userRole, module, 'editar');
  }

  // Verificar si el usuario puede eliminar
  static canDelete(userRole: RoleEnum, module: string): boolean {
    return this.hasPermission(userRole, module, 'eliminar');
  }

  // Verificar si el usuario puede crear
  static canCreate(userRole: RoleEnum, module: string): boolean {
    return this.hasPermission(userRole, module, 'crear');
  }

  // Verificar si el usuario es de una área específica
  static isFromArea(userArea: AreaEnum, targetArea: AreaEnum): boolean {
    return userArea === targetArea;
  }

  // Verificar si el usuario puede gestionar usuarios
  static canManageUsers(userRole: RoleEnum): boolean {
    return [RoleEnum.ADMIN, RoleEnum.DIRECTIVO].includes(userRole);
  }

  // Verificar si el usuario puede ver estadísticas globales
  static canViewGlobalStats(userRole: RoleEnum): boolean {
    return userRole === RoleEnum.ADMIN;
  }

  // Verificar si el usuario puede generar facturación
  static canGenerateInvoices(userRole: RoleEnum): boolean {
    return [RoleEnum.ADMIN, RoleEnum.DIRECTIVO].includes(userRole);
  }

  // Verificar si el usuario puede aceptar peticiones
  static canAcceptRequests(userArea: AreaEnum): boolean {
    return [AreaEnum.PAUTAS, AreaEnum.DISENO].includes(userArea);
  }

  // Verificar si el usuario puede cambiar el rol de otro usuario
  static canChangeRole(userRole: RoleEnum): boolean {
    return userRole === RoleEnum.ADMIN;
  }

  // Verificar acceso a módulo completo
  static hasModuleAccess(userRole: RoleEnum, module: string): boolean {
    const permissions = PERMISOS_POR_ROL[userRole];
    return permissions && module in permissions && permissions[module].length > 0;
  }
}