import Usuario from "../models/Usuario";
import Role from "../models/Role";
import Area from "../models/Area";
import { hashPassword } from "../utils/bcrypt.util";
import { NotFoundError, ValidationError, ForbiddenError } from "../utils/error.util";
import { AuditoriaService } from "./auditoria.service";

export class UsuarioService {
  private auditoriaService = new AuditoriaService();

  async obtenerTodos(usuarioActual: any) {
    const whereClause: any = {};

    // Si es Directivo o Líder, solo ver de su área
    if (["Directivo", "Líder"].includes(usuarioActual.rol)) {
      const area = await Area.findOne({ where: { nombre: usuarioActual.area } });
      whereClause.area_id = area?.id;
    }

    const usuarios = await Usuario.findAll({
      where: whereClause,
      attributes: { exclude: ["contrasena"] },
      include: [
        { model: Role, as: "rol", attributes: ["id", "nombre"] },
        { model: Area, as: "area", attributes: ["id", "nombre"] },
      ],
    });

    return usuarios;
  }

  async obtenerPorId(uid: number, usuarioActual: any) {
    const usuario = await Usuario.findByPk(uid, {
      attributes: { exclude: ["contrasena"] },
      include: [
        { model: Role, as: "rol", attributes: ["id", "nombre"] },
        { model: Area, as: "area", attributes: ["id", "nombre"] },
      ],
    });

    if (!usuario) {
      throw new NotFoundError("Usuario no encontrado");
    }

    // Verificar permisos
    if (usuarioActual.rol === "Usuario" && usuarioActual.uid !== uid) {
      throw new ForbiddenError("No tienes permiso para ver este usuario");
    }

    if (["Directivo", "Líder"].includes(usuarioActual.rol)) {
      if ((usuario as any).area.nombre !== usuarioActual.area) {
        throw new ForbiddenError("No tienes permiso para ver usuarios de otra área");
      }
    }

    return usuario;
  }

  async actualizar(uid: number, data: any, usuarioActual: any) {
    const usuario = await Usuario.findByPk(uid);

    if (!usuario) {
      throw new NotFoundError("Usuario no encontrado");
    }

    // Solo Admin puede cambiar roles
    if (data.rol_id && usuarioActual.rol !== "Admin") {
      throw new ForbiddenError("Solo Admin puede cambiar roles");
    }

    // Si cambia contraseña, hashearla
    if (data.contrasena) {
      data.contrasena = await hashPassword(data.contrasena);
    }

    // Registrar cambios en auditoría
    const cambios: any = {};
    Object.keys(data).forEach((key) => {
      if ((usuario as any)[key] !== data[key]) {
        cambios[key] = {
          anterior: (usuario as any)[key],
          nuevo: data[key],
        };
      }
    });

    await usuario.update(data);

    // Registrar en auditoría
    for (const campo in cambios) {
      await this.auditoriaService.registrarCambio({
        tabla_afectada: "usuarios",
        registro_id: uid,
        tipo_cambio: "UPDATE",
        campo_modificado: campo,
        valor_anterior: cambios[campo].anterior?.toString(),
        valor_nuevo: cambios[campo].nuevo?.toString(),
        usuario_id: usuarioActual.uid,
        descripcion: `Actualización del campo ${campo}`,
      });
    }

    return await Usuario.findByPk(uid, {
      attributes: { exclude: ["contrasena"] },
      include: [
        { model: Role, as: "rol" },
        { model: Area, as: "area" },
      ],
    });
  }

  async cambiarStatus(uid: number, status: boolean, usuarioActual: any) {
    const usuario = await Usuario.findByPk(uid);

    if (!usuario) {
      throw new NotFoundError("Usuario no encontrado");
    }

    // Solo Admin y Directivo pueden cambiar status
    if (!["Admin", "Directivo"].includes(usuarioActual.rol)) {
      throw new ForbiddenError("No tienes permiso para cambiar el status");
    }

    await usuario.update({ status });

    // Registrar en auditoría
    await this.auditoriaService.registrarCambio({
      tabla_afectada: "usuarios",
      registro_id: uid,
      tipo_cambio: "UPDATE",
      campo_modificado: "status",
      valor_anterior: (!status).toString(),
      valor_nuevo: status.toString(),
      usuario_id: usuarioActual.uid,
      descripcion: `Cambio de status a ${status ? "activo" : "inactivo"}`,
    });

    return usuario;
  }

  async obtenerPorArea(areaNombre: string) {
    const area = await Area.findOne({ where: { nombre: areaNombre } });

    if (!area) {
      throw new NotFoundError("Área no encontrada");
    }

    return await Usuario.findAll({
      where: { area_id: area.id, status: true },
      attributes: { exclude: ["contrasena"] },
      include: [
        { model: Role, as: "rol" },
        { model: Area, as: "area" },
      ],
    });
  }

  /**
   * Cambiar estado de presencia (Activo, Ausente, No Molestar, Away)
   * El usuario puede cambiar su propio estado, pero no puede poner "Inactivo" (eso es status=false del admin)
   */
  async cambiarEstadoPresencia(
    uid: number,
    estadoPresencia: "Activo" | "Ausente" | "No Molestar" | "Away",
    usuarioActual: any
  ) {
    const usuario = await Usuario.findByPk(uid);

    if (!usuario) {
      throw new NotFoundError("Usuario no encontrado");
    }

    // Solo puede cambiar su propio estado de presencia
    if (usuarioActual.uid !== uid) {
      throw new ForbiddenError("Solo puedes cambiar tu propio estado de presencia");
    }

    // Validar estados permitidos
    const estadosPermitidos = ["Activo", "Ausente", "No Molestar", "Away"];
    if (!estadosPermitidos.includes(estadoPresencia)) {
      throw new ValidationError("Estado de presencia inválido");
    }

    const valorAnterior = usuario.estado_presencia;
    await usuario.update({ 
      estado_presencia: estadoPresencia,
      ultima_actividad: new Date() 
    });

    // Registrar en auditoría
    await this.auditoriaService.registrarCambio({
      tabla_afectada: "usuarios",
      registro_id: uid,
      tipo_cambio: "UPDATE",
      campo_modificado: "estado_presencia",
      valor_anterior: valorAnterior,
      valor_nuevo: estadoPresencia,
      usuario_id: usuarioActual.uid,
      descripcion: `Cambio de estado de presencia a ${estadoPresencia}`,
    });

    return usuario;
  }

  /**
   * Actualizar última actividad del usuario
   */
  async actualizarActividad(uid: number) {
    const usuario = await Usuario.findByPk(uid);

    if (!usuario) {
      throw new NotFoundError("Usuario no encontrado");
    }

    await usuario.update({ 
      ultima_actividad: new Date(),
      // Si estaba Away, cambiar automáticamente a Activo
      estado_presencia: usuario.estado_presencia === "Away" ? "Activo" : usuario.estado_presencia
    });

    return usuario;
  }
}