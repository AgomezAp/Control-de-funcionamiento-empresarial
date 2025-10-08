import { Request, Response, NextFunction } from "express";
import { ForbiddenError } from "../utils/error.util";
import { ApiResponse } from "../utils/response.util";

type RoleType = "Admin" | "Directivo" | "Líder" | "Usuario";

export const roleAuth = (...rolesPermitidos: RoleType[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const usuarioRol = req.usuario?.rol;

      if (!usuarioRol) {
        throw new ForbiddenError("Rol no identificado");
      }

      if (!rolesPermitidos.includes(usuarioRol as RoleType)) {
        throw new ForbiddenError(
          `Acceso denegado. Se requiere uno de los siguientes roles: ${rolesPermitidos.join(", ")}`
        );
      }

      next();
    } catch (error: any) {
      return ApiResponse.error(res, error.message, error.statusCode || 403);
    }
  };
};

// Middleware específico para verificar área
export const areaAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const usuarioArea = req.usuario?.area;
    const areaRequerida = req.params.area || req.body.area;

    // Admin puede acceder a todas las áreas
    if (req.usuario?.rol === "Admin") {
      return next();
    }

    // Directivo y Líder solo su área
    if (["Directivo", "Líder"].includes(req.usuario?.rol as string)) {
      if (usuarioArea !== areaRequerida) {
        throw new ForbiddenError("No tienes acceso a esta área");
      }
    }

    next();
  } catch (error: any) {
    return ApiResponse.error(res, error.message, error.statusCode || 403);
  }
};