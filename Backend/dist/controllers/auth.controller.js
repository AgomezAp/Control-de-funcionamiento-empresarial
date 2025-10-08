"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
const response_util_1 = require("../utils/response.util");
const authService = new auth_service_1.AuthService();
class AuthController {
    registrar(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nombre_completo, correo, contrasena, rol_id, area_id } = req.body;
                const usuario = yield authService.registrarUsuario({
                    nombre_completo,
                    correo,
                    contrasena,
                    rol_id,
                    area_id,
                });
                return response_util_1.ApiResponse.created(res, usuario, "Usuario registrado exitosamente");
            }
            catch (error) {
                return response_util_1.ApiResponse.error(res, error.message || "Error al registrar usuario", error.statusCode || 500);
            }
        });
    }
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { correo, contrasena } = req.body;
                const resultado = yield authService.login(correo, contrasena);
                return response_util_1.ApiResponse.success(res, resultado, "Login exitoso");
            }
            catch (error) {
                return response_util_1.ApiResponse.error(res, error.message || "Error al iniciar sesión", error.statusCode || 500);
            }
        });
    }
    perfil(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // req.usuario viene del middleware de autenticación
                return response_util_1.ApiResponse.success(res, req.usuario, "Perfil obtenido exitosamente");
            }
            catch (error) {
                return response_util_1.ApiResponse.error(res, error.message || "Error al obtener perfil", error.statusCode || 500);
            }
        });
    }
}
exports.AuthController = AuthController;
