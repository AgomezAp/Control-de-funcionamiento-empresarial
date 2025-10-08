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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const Usuario_1 = __importDefault(require("../models/Usuario"));
const Role_1 = __importDefault(require("../models/Role"));
const Area_1 = __importDefault(require("../models/Area"));
const bcrypt_util_1 = require("../utils/bcrypt.util");
const jwt_util_1 = require("../utils/jwt.util");
const error_util_1 = require("../utils/error.util");
class AuthService {
    registrarUsuario(data) {
        return __awaiter(this, void 0, void 0, function* () {
            // Verificar si el correo ya existe
            const usuarioExistente = yield Usuario_1.default.findOne({
                where: { correo: data.correo },
            });
            if (usuarioExistente) {
                throw new error_util_1.ValidationError("El correo ya está registrado");
            }
            // Verificar que el rol exista
            const rol = yield Role_1.default.findByPk(data.rol_id);
            if (!rol) {
                throw new error_util_1.NotFoundError("El rol especificado no existe");
            }
            // Verificar que el área exista
            const area = yield Area_1.default.findByPk(data.area_id);
            if (!area) {
                throw new error_util_1.NotFoundError("El área especificada no existe");
            }
            // Hashear contraseña
            const contrasenaHash = yield (0, bcrypt_util_1.hashPassword)(data.contrasena);
            // Crear usuario
            const usuario = yield Usuario_1.default.create(Object.assign(Object.assign({}, data), { contrasena: contrasenaHash }));
            return {
                uid: usuario.uid,
                nombre_completo: usuario.nombre_completo,
                correo: usuario.correo,
                status: usuario.status,
            };
        });
    }
    login(correo, contrasena) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("🔍 [LOGIN] Iniciando login para:", correo);
            // Buscar usuario con rol y área
            try {
                console.log("📊 [LOGIN] Buscando usuario en BD...");
                const usuario = yield Usuario_1.default.findOne({
                    where: { correo },
                    include: [
                        { model: Role_1.default, as: "rol" },
                        { model: Area_1.default, as: "area" },
                    ],
                });
                console.log("✅ [LOGIN] Usuario encontrado:", usuario ? "SI" : "NO");
                if (!usuario) {
                    console.log("❌ [LOGIN] Usuario no encontrado");
                    throw new error_util_1.UnauthorizedError("Credenciales inválidas");
                }
                console.log("👤 [LOGIN] Usuario:", {
                    uid: usuario.uid,
                    correo: usuario.correo,
                    status: usuario.status,
                });
                // Verificar si el usuario está activo
                if (!usuario.status) {
                    console.log("❌ [LOGIN] Usuario desactivado");
                    throw new error_util_1.UnauthorizedError("Usuario desactivado");
                }
                // Verificar contraseña
                console.log("🔐 [LOGIN] Verificando contraseña...");
                const passwordValida = yield (0, bcrypt_util_1.comparePassword)(contrasena, usuario.contrasena);
                if (!passwordValida) {
                    console.log("❌ [LOGIN] Contraseña inválida");
                    throw new error_util_1.UnauthorizedError("Credenciales inválidas");
                }
                console.log("✅ [LOGIN] Contraseña válida");
                // Verificar asociaciones
                console.log("🔗 [LOGIN] Rol:", usuario.rol);
                console.log("🔗 [LOGIN] Area:", usuario.area);
                // Generar token
                const token = (0, jwt_util_1.generateToken)({
                    uid: usuario.uid,
                    correo: usuario.correo,
                    rol: usuario.rol.nombre,
                    area: usuario.area.nombre,
                });
                console.log("✅ [LOGIN] Login exitoso");
                return {
                    token,
                    usuario: {
                        uid: usuario.uid,
                        nombre_completo: usuario.nombre_completo,
                        correo: usuario.correo,
                        rol: usuario.rol.nombre,
                        area: usuario.area.nombre,
                    },
                };
            }
            catch (error) {
                console.error("❌ [LOGIN] Error en el proceso:", error.message);
                throw error;
            }
        });
    }
}
exports.AuthService = AuthService;
