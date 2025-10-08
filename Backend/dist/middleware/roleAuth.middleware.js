"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.areaAuth = exports.roleAuth = void 0;
const error_util_1 = require("../utils/error.util");
const response_util_1 = require("../utils/response.util");
const roleAuth = (...rolesPermitidos) => {
    return (req, res, next) => {
        var _a;
        try {
            const usuarioRol = (_a = req.usuario) === null || _a === void 0 ? void 0 : _a.rol;
            if (!usuarioRol) {
                throw new error_util_1.ForbiddenError("Rol no identificado");
            }
            if (!rolesPermitidos.includes(usuarioRol)) {
                throw new error_util_1.ForbiddenError(`Acceso denegado. Se requiere uno de los siguientes roles: ${rolesPermitidos.join(", ")}`);
            }
            next();
        }
        catch (error) {
            return response_util_1.ApiResponse.error(res, error.message, error.statusCode || 403);
        }
    };
};
exports.roleAuth = roleAuth;
// Middleware específico para verificar área
const areaAuth = (req, res, next) => {
    var _a, _b, _c;
    try {
        const usuarioArea = (_a = req.usuario) === null || _a === void 0 ? void 0 : _a.area;
        const areaRequerida = req.params.area || req.body.area;
        // Admin puede acceder a todas las áreas
        if (((_b = req.usuario) === null || _b === void 0 ? void 0 : _b.rol) === "Admin") {
            return next();
        }
        // Directivo y Líder solo su área
        if (["Directivo", "Líder"].includes((_c = req.usuario) === null || _c === void 0 ? void 0 : _c.rol)) {
            if (usuarioArea !== areaRequerida) {
                throw new error_util_1.ForbiddenError("No tienes acceso a esta área");
            }
        }
        next();
    }
    catch (error) {
        return response_util_1.ApiResponse.error(res, error.message, error.statusCode || 403);
    }
};
exports.areaAuth = areaAuth;
