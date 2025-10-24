import { Request, Response } from "express";
import reporteClienteService from "../services/reporte-cliente.service";
import { TipoProblema, PrioridadReporte, EstadoReporte } from "../models/ReporteCliente";

// Crear nuevo reporte
export const crearReporte = async (req: Request, res: Response) => {
  try {
    const { cliente_id, tipo_problema, descripcion_problema, prioridad, notas_internas } = req.body;
    const creado_por = req.usuario?.uid;

    if (!cliente_id || !tipo_problema || !descripcion_problema || !prioridad) {
      return res.status(400).json({
        ok: false,
        msg: "Faltan campos requeridos: cliente_id, tipo_problema, descripcion_problema, prioridad",
      });
    }

    if (!creado_por) {
      return res.status(401).json({
        ok: false,
        msg: "Usuario no autenticado",
      });
    }

    const reporte = await reporteClienteService.crearReporte({
      cliente_id,
      tipo_problema: tipo_problema as TipoProblema,
      descripcion_problema,
      prioridad: prioridad as PrioridadReporte,
      creado_por,
      notas_internas,
    });

    res.status(201).json({
      ok: true,
      msg: "Reporte creado exitosamente",
      reporte,
    });
  } catch (error: any) {
    console.error("Error al crear reporte:", error);
    res.status(500).json({
      ok: false,
      msg: error.message || "Error al crear reporte",
    });
  }
};

// Obtener reportes con filtros
export const obtenerReportes = async (req: Request, res: Response) => {
  try {
    const { estado, prioridad, tipo_problema, creado_por, atendido_por, cliente_id } = req.query;

    const filtros: any = {};
    if (estado) filtros.estado = estado as EstadoReporte;
    if (prioridad) filtros.prioridad = prioridad as PrioridadReporte;
    if (tipo_problema) filtros.tipo_problema = tipo_problema as TipoProblema;
    if (creado_por) filtros.creado_por = parseInt(creado_por as string);
    if (atendido_por) filtros.atendido_por = parseInt(atendido_por as string);
    if (cliente_id) filtros.cliente_id = parseInt(cliente_id as string);

    const reportes = await reporteClienteService.obtenerReportes(filtros);

    res.json({
      ok: true,
      reportes,
      total: reportes.length,
    });
  } catch (error: any) {
    console.error("Error al obtener reportes:", error);
    res.status(500).json({
      ok: false,
      msg: error.message || "Error al obtener reportes",
    });
  }
};

// Obtener reporte por ID
export const obtenerReportePorId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        ok: false,
        msg: "ID de reporte inválido",
      });
    }

    const reporte = await reporteClienteService.obtenerReportePorId(parseInt(id));

    res.json({
      ok: true,
      reporte,
    });
  } catch (error: any) {
    console.error("Error al obtener reporte:", error);
    res.status(error.message.includes("no encontrado") ? 404 : 500).json({
      ok: false,
      msg: error.message || "Error al obtener reporte",
    });
  }
};

// Asignar técnico a reporte
export const asignarTecnico = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tecnico_id = req.usuario?.uid;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        ok: false,
        msg: "ID de reporte inválido",
      });
    }

    if (!tecnico_id) {
      return res.status(400).json({
        ok: false,
        msg: "No se pudo identificar al técnico",
      });
    }

    const reporte = await reporteClienteService.asignarTecnico(parseInt(id), tecnico_id);

    res.json({
      ok: true,
      msg: "Técnico asignado exitosamente",
      reporte,
    });
  } catch (error: any) {
    console.error("Error al asignar técnico:", error);
    res.status(500).json({
      ok: false,
      msg: error.message || "Error al asignar técnico",
    });
  }
};

// Vincular petición a reporte
export const vincularPeticion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { peticion_id } = req.body;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        ok: false,
        msg: "ID de reporte inválido",
      });
    }

    if (!peticion_id) {
      return res.status(400).json({
        ok: false,
        msg: "ID de petición requerido",
      });
    }

    const reporte = await reporteClienteService.vincularPeticion(parseInt(id), peticion_id);

    res.json({
      ok: true,
      msg: "Petición vinculada exitosamente",
      reporte,
    });
  } catch (error: any) {
    console.error("Error al vincular petición:", error);
    res.status(500).json({
      ok: false,
      msg: error.message || "Error al vincular petición",
    });
  }
};

// Actualizar estado del reporte
export const actualizarEstado = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { estado, notas } = req.body;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        ok: false,
        msg: "ID de reporte inválido",
      });
    }

    if (!estado) {
      return res.status(400).json({
        ok: false,
        msg: "Estado requerido",
      });
    }

    // Validar que el estado sea válido
    if (!Object.values(EstadoReporte).includes(estado as EstadoReporte)) {
      return res.status(400).json({
        ok: false,
        msg: "Estado inválido. Valores permitidos: Pendiente, En Atención, Resuelto, Cancelado",
      });
    }

    const reporte = await reporteClienteService.actualizarEstado(
      parseInt(id),
      estado as EstadoReporte,
      notas
    );

    res.json({
      ok: true,
      msg: "Estado actualizado exitosamente",
      reporte,
    });
  } catch (error: any) {
    console.error("Error al actualizar estado:", error);
    res.status(500).json({
      ok: false,
      msg: error.message || "Error al actualizar estado",
    });
  }
};

// Obtener reportes pendientes (para técnicos)
export const obtenerReportesPendientes = async (req: Request, res: Response) => {
  try {
    const usuario = req.usuario;

    if (!usuario || !usuario.area) {
      return res.status(400).json({
        ok: false,
        msg: "No se pudo identificar el área del usuario",
      });
    }

    const areaTipo = usuario.area;
    const reportes = await reporteClienteService.obtenerReportesPendientes(areaTipo);

    res.json({
      ok: true,
      reportes,
      total: reportes.length,
    });
  } catch (error: any) {
    console.error("Error al obtener reportes pendientes:", error);
    res.status(500).json({
      ok: false,
      msg: error.message || "Error al obtener reportes pendientes",
    });
  }
};

// Obtener estadísticas de reportes
export const obtenerEstadisticas = async (req: Request, res: Response) => {
  try {
    const usuario = req.usuario;
    const { usuario_id } = req.query;

    // Si se especifica usuario_id y el usuario actual tiene permisos, usar ese ID
    // Si no, usar el ID del usuario actual
    const userId = usuario_id
      ? parseInt(usuario_id as string)
      : usuario?.rol === "Admin" || usuario?.rol === "Directivo"
      ? undefined
      : usuario?.uid;

    const estadisticas = await reporteClienteService.obtenerEstadisticas(userId);

    res.json({
      ok: true,
      estadisticas,
    });
  } catch (error: any) {
    console.error("Error al obtener estadísticas:", error);
    res.status(500).json({
      ok: false,
      msg: error.message || "Error al obtener estadísticas",
    });
  }
};

// Obtener mis reportes (creados por el usuario actual)
export const obtenerMisReportes = async (req: Request, res: Response) => {
  try {
    const creado_por = req.usuario?.uid;

    if (!creado_por) {
      return res.status(400).json({
        ok: false,
        msg: "No se pudo identificar al usuario",
      });
    }

    const reportes = await reporteClienteService.obtenerReportes({ creado_por });

    res.json({
      ok: true,
      reportes,
      total: reportes.length,
    });
  } catch (error: any) {
    console.error("Error al obtener mis reportes:", error);
    res.status(500).json({
      ok: false,
      msg: error.message || "Error al obtener mis reportes",
    });
  }
};
