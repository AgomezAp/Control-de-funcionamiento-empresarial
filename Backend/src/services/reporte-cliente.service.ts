import ReporteCliente, {
  EstadoReporte,
  TipoProblema,
  PrioridadReporte,
} from "../models/ReporteCliente";
import Cliente from "../models/Cliente";
import Usuario from "../models/Usuario";
import Peticion from "../models/Peticion";
import { Op } from "sequelize";
import notificacionService from "./notificacion.service";
import webSocketService from "./webSocket.service";

class ReporteClienteService {
  /**
   * Crear nuevo reporte de cliente
   */
  async crearReporte(data: {
    cliente_id: number;
    tipo_problema: TipoProblema;
    descripcion_problema: string;
    prioridad: PrioridadReporte;
    creado_por: number;
    notas_internas?: string;
  }): Promise<ReporteCliente> {
    // Validar que el cliente existe
    const cliente = await Cliente.findByPk(data.cliente_id);
    if (!cliente) {
      throw new Error("Cliente no encontrado");
    }

    // Validar que el usuario existe
    const usuario = await Usuario.findByPk(data.creado_por);
    if (!usuario) {
      throw new Error("Usuario no encontrado");
    }

    // Crear el reporte
    const reporte = await ReporteCliente.create({
      ...data,
      estado: EstadoReporte.PENDIENTE,
      fecha_creacion: new Date(),
      peticiones_relacionadas: [],
    });

    // Notificar a los técnicos del área correspondiente
    await this.notificarNuevoReporte(reporte, cliente);

    // Emitir evento WebSocket
    webSocketService.emit("nuevoReporteCliente", {
      reporte_id: reporte.id,
      cliente_nombre: cliente.nombre,
      tipo_problema: reporte.tipo_problema,
      prioridad: reporte.prioridad,
    });

    return reporte;
  }

  /**
   * Obtener todos los reportes con filtros
   */
  async obtenerReportes(filtros?: {
    estado?: EstadoReporte;
    prioridad?: PrioridadReporte;
    tipo_problema?: TipoProblema;
    creado_por?: number;
    atendido_por?: number;
    cliente_id?: number;
  }): Promise<ReporteCliente[]> {
    const where: any = {};

    if (filtros) {
      if (filtros.estado) where.estado = filtros.estado;
      if (filtros.prioridad) where.prioridad = filtros.prioridad;
      if (filtros.tipo_problema) where.tipo_problema = filtros.tipo_problema;
      if (filtros.creado_por) where.creado_por = filtros.creado_por;
      if (filtros.atendido_por) where.atendido_por = filtros.atendido_por;
      if (filtros.cliente_id) where.cliente_id = filtros.cliente_id;
    }

    const reportes = await ReporteCliente.findAll({
      where,
      include: [
        {
          model: Cliente,
          as: "cliente",
          attributes: ["id", "nombre", "correo", "telefono"],
        },
        {
          model: Usuario,
          as: "creador",
          attributes: ["uid", "nombre_completo", "correo"],
        },
        {
          model: Usuario,
          as: "tecnico",
          attributes: ["uid", "nombre_completo", "correo"],
        },
      ],
      order: [
        ["prioridad", "DESC"], // Urgentes primero
        ["fecha_creacion", "DESC"],
      ],
    });

    return reportes;
  }

  /**
   * Obtener reporte por ID
   */
  async obtenerReportePorId(id: number): Promise<ReporteCliente | null> {
    const reporte = await ReporteCliente.findByPk(id, {
      include: [
        {
          model: Cliente,
          as: "cliente",
        },
        {
          model: Usuario,
          as: "creador",
          attributes: ["uid", "nombre_completo", "correo", "area_id"],
          include: [
            {
              model: require("./Area").default,
              as: "area",
              attributes: ["id", "nombre"],
            },
          ],
        },
        {
          model: Usuario,
          as: "tecnico",
          attributes: ["uid", "nombre_completo", "correo"],
        },
      ],
    });

    // Si tiene peticiones relacionadas, cargarlas
    if (reporte && reporte.peticiones_relacionadas && reporte.peticiones_relacionadas.length > 0) {
      const peticiones = await Peticion.findAll({
        where: {
          id: { [Op.in]: reporte.peticiones_relacionadas },
        },
        include: [
          {
            model: Usuario,
            as: "asignado",
            attributes: ["uid", "nombre_completo"],
          },
        ],
      });

      // @ts-ignore - Agregar peticiones al reporte temporalmente
      reporte.peticiones = peticiones;
    }

    return reporte;
  }

  /**
   * Asignar técnico a un reporte (Pautador/Diseñador toma el reporte)
   */
  async asignarTecnico(
    reporteId: number,
    tecnicoId: number
  ): Promise<ReporteCliente> {
    const reporte = await ReporteCliente.findByPk(reporteId);
    if (!reporte) {
      throw new Error("Reporte no encontrado");
    }

    const tecnico = await Usuario.findByPk(tecnicoId);
    if (!tecnico) {
      throw new Error("Técnico no encontrado");
    }

    reporte.atendido_por = tecnicoId;
    reporte.estado = EstadoReporte.EN_ATENCION;
    reporte.fecha_atencion = new Date();
    await reporte.save();

    // Notificar al creador del reporte
    await notificacionService.crear({
      usuario_id: reporte.creado_por,
      tipo: "sistema",
      titulo: "Reporte en atención",
      mensaje: `${tecnico.nombre_completo} está atendiendo el reporte #${reporteId}`,
    });

    return reporte;
  }

  /**
   * Vincular petición a un reporte
   */
  async vincularPeticion(
    reporteId: number,
    peticionId: number
  ): Promise<ReporteCliente> {
    const reporte = await ReporteCliente.findByPk(reporteId);
    if (!reporte) {
      throw new Error("Reporte no encontrado");
    }

    const peticion = await Peticion.findByPk(peticionId);
    if (!peticion) {
      throw new Error("Petición no encontrada");
    }

    // Agregar petición al array
    const peticionesActuales = reporte.peticiones_relacionadas || [];
    if (!peticionesActuales.includes(peticionId)) {
      peticionesActuales.push(peticionId);
      reporte.peticiones_relacionadas = peticionesActuales;
      await reporte.save();
    }

    return reporte;
  }

  /**
   * Actualizar estado del reporte
   */
  async actualizarEstado(
    reporteId: number,
    nuevoEstado: EstadoReporte,
    notas?: string
  ): Promise<ReporteCliente> {
    const reporte = await ReporteCliente.findByPk(reporteId);
    if (!reporte) {
      throw new Error("Reporte no encontrado");
    }

    reporte.estado = nuevoEstado;

    if (nuevoEstado === EstadoReporte.RESUELTO) {
      reporte.fecha_resolucion = new Date();
    }

    if (notas) {
      reporte.notas_internas = notas;
    }

    await reporte.save();

    // Notificar al creador
    await notificacionService.crear({
      usuario_id: reporte.creado_por,
      tipo: "sistema",
      titulo: `Reporte ${nuevoEstado.toLowerCase()}`,
      mensaje: `El reporte #${reporteId} ha sido ${nuevoEstado.toLowerCase()}`,
    });

    return reporte;
  }

  /**
   * Obtener reportes pendientes para técnicos (Pautadores/Diseñadores)
   */
  async obtenerReportesPendientes(areaTipo?: string): Promise<ReporteCliente[]> {
    const where: any = {
      estado: EstadoReporte.PENDIENTE,
    };

    // Filtrar por tipo de problema según el área
    if (areaTipo === "Pautas") {
      where.tipo_problema = {
        [Op.in]: [TipoProblema.CAMPANA, TipoProblema.SOPORTE_TECNICO],
      };
    } else if (areaTipo === "Diseño") {
      where.tipo_problema = {
        [Op.in]: [TipoProblema.DISENO_WEB, TipoProblema.SOPORTE_TECNICO],
      };
    }

    const reportes = await ReporteCliente.findAll({
      where,
      include: [
        {
          model: Cliente,
          as: "cliente",
          attributes: ["id", "nombre", "correo", "telefono"],
        },
        {
          model: Usuario,
          as: "creador",
          attributes: ["uid", "nombre_completo"],
        },
      ],
      order: [
        ["prioridad", "DESC"],
        ["fecha_creacion", "ASC"],
      ],
    });

    return reportes;
  }

  /**
   * Obtener estadísticas de reportes
   */
  async obtenerEstadisticas(userId?: number): Promise<any> {
    const where: any = {};
    if (userId) {
      where.creado_por = userId;
    }

    const total = await ReporteCliente.count({ where });
    const pendientes = await ReporteCliente.count({
      where: { ...where, estado: EstadoReporte.PENDIENTE },
    });
    const enAtencion = await ReporteCliente.count({
      where: { ...where, estado: EstadoReporte.EN_ATENCION },
    });
    const resueltos = await ReporteCliente.count({
      where: { ...where, estado: EstadoReporte.RESUELTO },
    });

    // Estadísticas por prioridad
    const porPrioridad = await Promise.all(
      Object.values(PrioridadReporte).map(async (prioridad) => ({
        prioridad,
        count: await ReporteCliente.count({ where: { ...where, prioridad } }),
      }))
    );

    // Tiempo promedio de resolución (últimos 30 días)
    const hace30Dias = new Date();
    hace30Dias.setDate(hace30Dias.getDate() - 30);

    const reportesResueltos = await ReporteCliente.findAll({
      where: {
        ...where,
        estado: EstadoReporte.RESUELTO,
        fecha_resolucion: { [Op.gte]: hace30Dias },
      },
      attributes: ["fecha_creacion", "fecha_resolucion"],
    });

    let tiempoPromedioHoras = 0;
    if (reportesResueltos.length > 0) {
      const tiempos = reportesResueltos.map((r) => {
        const diff =
          r.fecha_resolucion!.getTime() - r.fecha_creacion.getTime();
        return diff / (1000 * 60 * 60); // Convertir a horas
      });
      tiempoPromedioHoras =
        tiempos.reduce((a, b) => a + b, 0) / tiempos.length;
    }

    return {
      total,
      pendientes,
      enAtencion,
      resueltos,
      porPrioridad,
      tiempoPromedioResolucion: Math.round(tiempoPromedioHoras * 10) / 10,
    };
  }

  /**
   * Notificar nuevo reporte a los técnicos
   */
  private async notificarNuevoReporte(
    reporte: ReporteCliente,
    cliente: Cliente
  ): Promise<void> {
    // Determinar a quién notificar según el tipo de problema
    let usuariosANotificar: Usuario[] = [];

    if (
      reporte.tipo_problema === TipoProblema.CAMPANA ||
      reporte.tipo_problema === TipoProblema.SOPORTE_TECNICO
    ) {
      // Notificar al pautador del cliente
      if (cliente.pautador_id) {
        const pautador = await Usuario.findByPk(cliente.pautador_id);
        if (pautador) usuariosANotificar.push(pautador);
      }
    }

    if (
      reporte.tipo_problema === TipoProblema.DISENO_WEB ||
      reporte.tipo_problema === TipoProblema.SOPORTE_TECNICO
    ) {
      // Notificar al diseñador del cliente
      if (cliente.disenador_id) {
        const disenador = await Usuario.findByPk(cliente.disenador_id);
        if (disenador) usuariosANotificar.push(disenador);
      }
    }

    // Crear notificaciones
    for (const usuario of usuariosANotificar) {
      await notificacionService.crear({
        usuario_id: usuario.uid,
        tipo: "sistema",
        titulo: "Nuevo reporte de cliente",
        mensaje: `${cliente.nombre}: ${reporte.tipo_problema} - ${reporte.prioridad}`,
      });
    }
  }
}

export default new ReporteClienteService();
