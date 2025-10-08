import Usuario from "../models/Usuario";
import Role from "../models/Role";
import Area from "../models/Area";
import { hashPassword, comparePassword } from "../utils/bcrypt.util";
import { generateToken } from "../utils/jwt.util";
import {
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "../utils/error.util";

export class AuthService {
  async registrarUsuario(data: {
    nombre_completo: string;
    correo: string;
    contrasena: string;
    rol_id: number;
    area_id: number;
  }) {
    // Verificar si el correo ya existe
    const usuarioExistente = await Usuario.findOne({
      where: { correo: data.correo },
    });

    if (usuarioExistente) {
      throw new ValidationError("El correo ya está registrado");
    }

    // Verificar que el rol exista
    const rol = await Role.findByPk(data.rol_id);
    if (!rol) {
      throw new NotFoundError("El rol especificado no existe");
    }

    // Verificar que el área exista
    const area = await Area.findByPk(data.area_id);
    if (!area) {
      throw new NotFoundError("El área especificada no existe");
    }

    // Hashear contraseña
    const contrasenaHash = await hashPassword(data.contrasena);

    // Crear usuario
    const usuario = await Usuario.create({
      ...data,
      contrasena: contrasenaHash,
    });

    return {
      uid: usuario.uid,
      nombre_completo: usuario.nombre_completo,
      correo: usuario.correo,
      status: usuario.status,
    };
  }

  async login(correo: string, contrasena: string) {
    console.log("🔍 [LOGIN] Iniciando login para:", correo);

    // Buscar usuario con rol y área
    try {
      console.log("📊 [LOGIN] Buscando usuario en BD...");

      const usuario = await Usuario.findOne({
        where: { correo },
        include: [
          { model: Role, as: "rol" },
          { model: Area, as: "area" },
        ],
      });

      console.log("✅ [LOGIN] Usuario encontrado:", usuario ? "SI" : "NO");

      if (!usuario) {
        console.log("❌ [LOGIN] Usuario no encontrado");
        throw new UnauthorizedError("Credenciales inválidas");
      }

      console.log("👤 [LOGIN] Usuario:", {
        uid: usuario.uid,
        correo: usuario.correo,
        status: usuario.status,
      });

      // Verificar si el usuario está activo
      if (!usuario.status) {
        console.log("❌ [LOGIN] Usuario desactivado");
        throw new UnauthorizedError("Usuario desactivado");
      }

      // Verificar contraseña
      console.log("🔐 [LOGIN] Verificando contraseña...");
      const passwordValida = await comparePassword(
        contrasena,
        usuario.contrasena
      );

      if (!passwordValida) {
        console.log("❌ [LOGIN] Contraseña inválida");
        throw new UnauthorizedError("Credenciales inválidas");
      }

      console.log("✅ [LOGIN] Contraseña válida");

      // Verificar asociaciones
      console.log("🔗 [LOGIN] Rol:", (usuario as any).rol);
      console.log("🔗 [LOGIN] Area:", (usuario as any).area);

      // Generar token
      const token = generateToken({
        uid: usuario.uid,
        correo: usuario.correo,
        rol: (usuario as any).rol.nombre,
        area: (usuario as any).area.nombre,
      });

      console.log("✅ [LOGIN] Login exitoso");

      return {
        token,
        usuario: {
          uid: usuario.uid,
          nombre_completo: usuario.nombre_completo,
          correo: usuario.correo,
          rol: (usuario as any).rol.nombre,
          area: (usuario as any).area.nombre,
        },
      };
    } catch (error: any) {
      console.error("❌ [LOGIN] Error en el proceso:", error.message);
      throw error;
    }
  }
}
