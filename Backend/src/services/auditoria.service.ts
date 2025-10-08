import AuditoriaCambios from "../models/AuditoriaCambio";
import Usuario from "../models/Usuario";
import { Op } from "sequelize";

export class AuditoriaService {
  async registrarCambio(data: {
    tabla_afectada: string;
    registro_id: number;
    tipo_cambio: "INSERT" | "UPDATE" | "DELETE" | "ASIGNACION" | "CAMBIO_ESTADO";
    campo_modificado?: string;
    valor_anterior?: string;
    valor_nuevo?: string;
    usuario_id: number;
    descripcion?: string;
  }) {
    try {
      await AuditoriaCambios.create(data);
    } catch (error) {
      console.error("Error al registrar auditoría:", error);
    }
  }

  async obtenerPorTabla(tabla: string, registro_id?: number) {
    const whereClause: any = { tabla_afectada: tabla };

    if (registro_id) {
      whereClause.registro_id = registro_id;
    }

    return await AuditoriaCambios.findAll({
      where: whereClause,
      include: [
        {
          model: Usuario,
          as: "usuario",
          attributes: ["uid", "nombre_completo", "correo"],
        },
      ],
      order: [["fecha_cambio", "DESC"]],
    });
  }

  async obtenerPorUsuario(usuario_id: number, fechaInicio?: Date, fechaFin?: Date) {
    const whereClause: any = { usuario_id };

    if (fechaInicio && fechaFin) {
      whereClause.fecha_cambio = {
        [Op.between]: [fechaInicio, fechaFin],
      };
    }

    return await AuditoriaCambios.findAll({
      where: whereClause,
      order: [["fecha_cambio", "DESC"]],
    });
  }

  async obtenerPorRango(fechaInicio: Date, fechaFin: Date) {
    return await AuditoriaCambios.findAll({
      where: {
        fecha_cambio: {
          [Op.between]: [fechaInicio, fechaFin],
        },
      },
      include: [
        {
          model: Usuario,
          as: "usuario",
          attributes: ["uid", "nombre_completo"],
        },
      ],
      order: [["fecha_cambio", "DESC"]],
    });
  }
}