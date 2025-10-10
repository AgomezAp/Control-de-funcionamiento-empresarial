import Cliente from "../models/Cliente";
import Usuario from "../models/Usuario";
import Area from "../models/Area";
import { NotFoundError, ValidationError, ForbiddenError } from "../utils/error.util";
import { AuditoriaService } from "./auditoria.service";

export class ClienteService {
  private auditoriaService = new AuditoriaService();

  async crear(data: {
    nombre: string;
    pais: string;
    tipo_cliente: string;
    pautador_id: number;
    disenador_id?: number;
    fecha_inicio: Date;
  }, usuarioActual: any) {
    // Verificar que el pautador existe y es del área de Pautas
    const pautador = await Usuario.findByPk(data.pautador_id, {
      include: [{ model: Area, as: "area" }],
    });

    if (!pautador) {
      throw new NotFoundError("El pautador especificado no existe");
    }

    if ((pautador as any).area.nombre !== "Pautas") {
      throw new ValidationError("El usuario asignado como pautador no pertenece al área de Pautas");
    }

    // Verificar diseñador si se proporciona
    if (data.disenador_id) {
      const disenador = await Usuario.findByPk(data.disenador_id, {
        include: [{ model: Area, as: "area" }],
      });

      if (!disenador) {
        throw new NotFoundError("El diseñador especificado no existe");
      }

      if ((disenador as any).area.nombre !== "Diseño") {
        throw new ValidationError("El usuario asignado como diseñador no pertenece al área de Diseño");
      }
    }

    const cliente = await Cliente.create(data);

    // Registrar en auditoría
    await this.auditoriaService.registrarCambio({
      tabla_afectada: "clientes",
      registro_id: cliente.id,
      tipo_cambio: "INSERT",
      valor_nuevo: JSON.stringify(data),
      usuario_id: usuarioActual.uid,
      descripcion: "Creación de nuevo cliente",
    });

    return await Cliente.findByPk(cliente.id, {
      include: [
        { model: Usuario, as: "pautador", attributes: ["uid", "nombre_completo", "correo"] },
        { model: Usuario, as: "disenador", attributes: ["uid", "nombre_completo", "correo"] },
      ],
    });
  }

  async obtenerTodos(usuarioActual: any) {
    // Todos los usuarios pueden ver todos los clientes activos
    // Las restricciones de edición/eliminación se manejan en otros métodos
    const whereClause: any = { status: true };

    return await Cliente.findAll({
      where: whereClause,
      include: [
        { model: Usuario, as: "pautador", attributes: ["uid", "nombre_completo", "correo"] },
        { model: Usuario, as: "disenador", attributes: ["uid", "nombre_completo", "correo"] },
      ],
      order: [["fecha_creacion", "DESC"]],
    });
  }

  async obtenerPorId(id: number, usuarioActual: any) {
    const cliente = await Cliente.findByPk(id, {
      include: [
        { model: Usuario, as: "pautador", attributes: ["uid", "nombre_completo", "correo"] },
        { model: Usuario, as: "disenador", attributes: ["uid", "nombre_completo", "correo"] },
      ],
    });

    if (!cliente) {
      throw new NotFoundError("Cliente no encontrado");
    }

    // Todos los usuarios pueden ver todos los clientes
    // Las restricciones de edición se manejan en el método actualizar()
    return cliente;
  }

  async actualizar(id: number, data: any, usuarioActual: any) {
    const cliente = await Cliente.findByPk(id);

    if (!cliente) {
      throw new NotFoundError("Cliente no encontrado");
    }

    // Verificar cambios de pautador o diseñador
    if (data.pautador_id && data.pautador_id !== cliente.pautador_id) {
      const nuevoPautador = await Usuario.findByPk(data.pautador_id, {
        include: [{ model: Area, as: "area" }],
      });

      if (!nuevoPautador || (nuevoPautador as any).area.nombre !== "Pautas") {
        throw new ValidationError("El nuevo pautador debe pertenecer al área de Pautas");
      }

      // Registrar cambio
      await this.auditoriaService.registrarCambio({
        tabla_afectada: "clientes",
        registro_id: id,
        tipo_cambio: "ASIGNACION",
        campo_modificado: "pautador_id",
        valor_anterior: cliente.pautador_id.toString(),
        valor_nuevo: data.pautador_id.toString(),
        usuario_id: usuarioActual.uid,
        descripcion: "Cambio de pautador asignado",
      });
    }

    if (data.disenador_id && data.disenador_id !== cliente.disenador_id) {
      const nuevoDisenador = await Usuario.findByPk(data.disenador_id, {
        include: [{ model: Area, as: "area" }],
      });

      if (!nuevoDisenador || (nuevoDisenador as any).area.nombre !== "Diseño") {
        throw new ValidationError("El nuevo diseñador debe pertenecer al área de Diseño");
      }

      // Registrar cambio
      await this.auditoriaService.registrarCambio({
        tabla_afectada: "clientes",
        registro_id: id,
        tipo_cambio: "ASIGNACION",
        campo_modificado: "disenador_id",
        valor_anterior: cliente.disenador_id?.toString() || "null",
        valor_nuevo: data.disenador_id.toString(),
        usuario_id: usuarioActual.uid,
        descripcion: "Cambio de diseñador asignado",
      });
    }

    await cliente.update(data);

    return await Cliente.findByPk(id, {
      include: [
        { model: Usuario, as: "pautador", attributes: ["uid", "nombre_completo"] },
        { model: Usuario, as: "disenador", attributes: ["uid", "nombre_completo"] },
      ],
    });
  }

  async desactivar(id: number, usuarioActual: any) {
    const cliente = await Cliente.findByPk(id);

    if (!cliente) {
      throw new NotFoundError("Cliente no encontrado");
    }

    await cliente.update({ status: false });

    await this.auditoriaService.registrarCambio({
      tabla_afectada: "clientes",
      registro_id: id,
      tipo_cambio: "UPDATE",
      campo_modificado: "status",
      valor_anterior: "true",
      valor_nuevo: "false",
      usuario_id: usuarioActual.uid,
      descripcion: "Desactivación de cliente",
    });

    return cliente;
  }
}