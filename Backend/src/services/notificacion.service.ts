import Notificacion from "../models/Notificacion";
import Usuario from "../models/Usuario";
import Peticion from "../models/Peticion";
import webSocketService from "./webSocket.service";
import { Op } from "sequelize";

interface CrearNotificacionData {
  usuario_id: number;
  tipo: "asignacion" | "cambio_estado" | "comentario" | "mencion" | "sistema";
  titulo: string;
  mensaje: string;
  peticion_id?: number;
}

class NotificacionService {
  /**
   * Crear una notificación y enviarla en tiempo real
   */
  async crear(data: CrearNotificacionData) {
    try {
      // Crear la notificación en la base de datos
      const notificacion = await Notificacion.create({
        usuario_id: data.usuario_id,
        tipo: data.tipo,
        titulo: data.titulo,
        mensaje: data.mensaje,
        peticion_id: data.peticion_id,
        leida: false,
        fecha_creacion: new Date(),
      });

      // Obtener la notificación con las relaciones
      const notificacionCompleta = await this.obtenerPorId(notificacion.id);

      // Emitir la notificación en tiempo real al usuario específico
      webSocketService.emitToUser(data.usuario_id, "nuevaNotificacion", notificacionCompleta);

      // También emitir el contador de notificaciones no leídas
      const noLeidas = await this.contarNoLeidas(data.usuario_id);
      webSocketService.emitToUser(data.usuario_id, "contadorNotificaciones", {
        total: noLeidas,
      });

      console.log(`📬 Notificación creada y enviada a usuario ${data.usuario_id}`);
      return notificacionCompleta;
    } catch (error) {
      console.error("Error al crear notificación:", error);
      throw error;
    }
  }

  /**
   * Crear notificación de asignación de petición
   */
  async notificarAsignacion(peticion: any, usuarioAsignado: any, usuarioAsignador: any) {
    return await this.crear({
      usuario_id: usuarioAsignado.uid,
      tipo: "asignacion",
      titulo: "Nueva petición asignada",
      mensaje: `${usuarioAsignador.nombre_completo} te ha asignado una petición de ${peticion.cliente?.nombre || "un cliente"}`,
      peticion_id: peticion.id,
    });
  }

  /**
   * Obtener notificación por ID
   */
  async obtenerPorId(id: number) {
    return await Notificacion.findByPk(id, {
      include: [
        {
          model: Usuario,
          as: "usuario",
          attributes: ["uid", "nombre_completo", "correo"],
        },
        {
          model: Peticion,
          as: "peticion",
          attributes: ["id", "descripcion", "estado"],
        },
      ],
    });
  }

  /**
   * Obtener todas las notificaciones de un usuario
   */
  async obtenerPorUsuario(usuario_id: number, filtros?: { leida?: boolean; limit?: number }) {
    const whereClause: any = { usuario_id };

    if (filtros?.leida !== undefined) {
      whereClause.leida = filtros.leida;
    }

    const notificaciones = await Notificacion.findAll({
      where: whereClause,
      include: [
        {
          model: Peticion,
          as: "peticion",
          attributes: ["id", "descripcion", "estado"],
          required: false,
        },
      ],
      order: [["fecha_creacion", "DESC"]],
      limit: filtros?.limit || 50,
    });

    return notificaciones;
  }

  /**
   * Marcar notificación como leída
   */
  async marcarComoLeida(id: number, usuario_id: number) {
    const notificacion = await Notificacion.findOne({
      where: { id, usuario_id },
    });

    if (!notificacion) {
      throw new Error("Notificación no encontrada");
    }

    if (notificacion.leida) {
      return notificacion;
    }

    await notificacion.update({
      leida: true,
      fecha_lectura: new Date(),
    });

    // Actualizar contador de notificaciones no leídas
    const noLeidas = await this.contarNoLeidas(usuario_id);
    webSocketService.emitToUser(usuario_id, "contadorNotificaciones", {
      total: noLeidas,
    });

    return notificacion;
  }

  /**
   * Marcar todas las notificaciones como leídas
   */
  async marcarTodasComoLeidas(usuario_id: number) {
    await Notificacion.update(
      {
        leida: true,
        fecha_lectura: new Date(),
      },
      {
        where: {
          usuario_id,
          leida: false,
        },
      }
    );

    // Actualizar contador
    webSocketService.emitToUser(usuario_id, "contadorNotificaciones", {
      total: 0,
    });

    return { message: "Todas las notificaciones marcadas como leídas" };
  }

  /**
   * Contar notificaciones no leídas
   */
  async contarNoLeidas(usuario_id: number): Promise<number> {
    return await Notificacion.count({
      where: {
        usuario_id,
        leida: false,
      },
    });
  }

  /**
   * Eliminar notificación
   */
  async eliminar(id: number, usuario_id: number) {
    const notificacion = await Notificacion.findOne({
      where: { id, usuario_id },
    });

    if (!notificacion) {
      throw new Error("Notificación no encontrada");
    }

    await notificacion.destroy();

    // Actualizar contador
    const noLeidas = await this.contarNoLeidas(usuario_id);
    webSocketService.emitToUser(usuario_id, "contadorNotificaciones", {
      total: noLeidas,
    });

    return { message: "Notificación eliminada" };
  }

  /**
   * Eliminar todas las notificaciones de un usuario
   */
  async eliminarTodas(usuario_id: number) {
    await Notificacion.destroy({
      where: { usuario_id },
    });

    webSocketService.emitToUser(usuario_id, "contadorNotificaciones", {
      total: 0,
    });

    return { message: "Todas las notificaciones eliminadas" };
  }

  /**
   * Limpiar notificaciones antiguas (más de 30 días)
   */
  async limpiarAntiguas() {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - 30);

    const eliminadas = await Notificacion.destroy({
      where: {
        fecha_creacion: {
          [Op.lt]: fechaLimite,
        },
        leida: true,
      },
    });

    console.log(`🧹 Limpieza: ${eliminadas} notificaciones antiguas eliminadas`);
    return eliminadas;
  }
}

export default new NotificacionService();
