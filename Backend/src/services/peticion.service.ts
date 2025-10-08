import Peticion from "../models/Peticion";
import PeticionHistorico from "../models/PeticionHistorico";
import Cliente from "../models/Cliente";
import Categoria from "../models/Categoria";
import Usuario from "../models/Usuario";
import Area from "../models/Area";
import { NotFoundError, ValidationError, ForbiddenError } from "../utils/error.util";
import { AuditoriaService } from "./auditoria.service";
import { Op } from "sequelize";

export class PeticionService {
  private auditoriaService = new AuditoriaService();

  async crear(
    data: {
      cliente_id: number;
      categoria_id: number;
      descripcion: string;
      descripcion_extra?: string;
      costo?: number;
      tiempo_limite_horas?: number;
    },
    usuarioActual: any
  ) {
    // Verificar que el cliente existe
    const cliente = await Cliente.findByPk(data.cliente_id);
    if (!cliente) {
      throw new NotFoundError("Cliente no encontrado");
    }

    // Verificar que la categoría existe
    const categoria = await Categoria.findByPk(data.categoria_id);
    if (!categoria) {
      throw new NotFoundError("Categoría no encontrada");
    }

    // Si la categoría requiere descripción extra, validar que venga
    if (categoria.requiere_descripcion_extra && !data.descripcion_extra) {
      throw new ValidationError(
        `La categoría "${categoria.nombre}" requiere descripción adicional`
      );
    }

    // Si la categoría es variable, el costo debe venir en el request
    if (categoria.es_variable && !data.costo) {
      throw new ValidationError(
        `La categoría "${categoria.nombre}" requiere que especifiques el costo`
      );
    }

    // Si no es variable, tomar el costo de la categoría
    const costoFinal = categoria.es_variable ? data.costo! : categoria.costo;

    // Crear la petición
    const peticion = await Peticion.create({
      cliente_id: data.cliente_id,
      categoria_id: data.categoria_id,
      descripcion: data.descripcion,
      descripcion_extra: data.descripcion_extra,
      costo: costoFinal,
      estado: "Pendiente",
      creador_id: usuarioActual.uid,
      tiempo_limite_horas: data.tiempo_limite_horas,
    });

    // Registrar en auditoría
    await this.auditoriaService.registrarCambio({
      tabla_afectada: "peticiones",
      registro_id: peticion.id,
      tipo_cambio: "INSERT",
      valor_nuevo: JSON.stringify({
        cliente_id: data.cliente_id,
        categoria_id: data.categoria_id,
        estado: "Pendiente",
      }),
      usuario_id: usuarioActual.uid,
      descripcion: "Creación de nueva petición",
    });

    return await this.obtenerPorId(peticion.id);
  }

  async obtenerTodos(usuarioActual: any, filtros?: any) {
    const whereClause: any = {};

    // Aplicar filtros de estado si vienen
    if (filtros?.estado) {
      whereClause.estado = filtros.estado;
    }

    // Aplicar filtros de cliente si vienen
    if (filtros?.cliente_id) {
      whereClause.cliente_id = filtros.cliente_id;
    }

    // Permisos según rol
    if (usuarioActual.rol === "Usuario") {
      const area = await Area.findOne({ where: { nombre: usuarioActual.area } });

      if (area?.nombre === "Pautas" || area?.nombre === "Diseño") {
        // Usuario puede ver las que creó o las que le fueron asignadas
        whereClause[Op.or] = [
          { creador_id: usuarioActual.uid },
          { asignado_a: usuarioActual.uid },
        ];
      } else {
        // Otras áreas solo las que crearon
        whereClause.creador_id = usuarioActual.uid;
      }
    }

    if (["Líder", "Directivo"].includes(usuarioActual.rol)) {
      const area = await Area.findOne({ where: { nombre: usuarioActual.area } });

      // Obtener usuarios del área
      const usuariosArea = await Usuario.findAll({
        where: { area_id: area?.id },
        attributes: ["uid"],
      });

      const idsUsuariosArea = usuariosArea.map((u) => u.uid);

      // Ver peticiones creadas o asignadas a usuarios de su área
      whereClause[Op.or] = [
        { creador_id: idsUsuariosArea },
        { asignado_a: idsUsuariosArea },
      ];
    }

    const peticiones = await Peticion.findAll({
      where: whereClause,
      include: [
        {
          model: Cliente,
          as: "cliente",
          attributes: ["id", "nombre", "pais"],
        },
        {
          model: Categoria,
          as: "categoria",
          attributes: ["id", "nombre", "area_tipo", "costo"],
        },
        {
          model: Usuario,
          as: "creador",
          attributes: ["uid", "nombre_completo", "correo"],
        },
        {
          model: Usuario,
          as: "asignado",
          attributes: ["uid", "nombre_completo", "correo"],
        },
      ],
      order: [["fecha_creacion", "DESC"]],
    });

    return peticiones;
  }

  async obtenerPorId(id: number) {
    const peticion = await Peticion.findByPk(id, {
      include: [
        {
          model: Cliente,
          as: "cliente",
          attributes: ["id", "nombre", "pais"],
        },
        {
          model: Categoria,
          as: "categoria",
          attributes: ["id", "nombre", "area_tipo", "costo", "es_variable"],
        },
        {
          model: Usuario,
          as: "creador",
          attributes: ["uid", "nombre_completo", "correo"],
          include: [{ model: Area, as: "area", attributes: ["nombre"] }],
        },
        {
          model: Usuario,
          as: "asignado",
          attributes: ["uid", "nombre_completo", "correo"],
          include: [{ model: Area, as: "area", attributes: ["nombre"] }],
        },
      ],
    });

    if (!peticion) {
      throw new NotFoundError("Petición no encontrada");
    }

    return peticion;
  }

  async obtenerPendientes(area?: string) {
    const whereClause: any = { estado: "Pendiente" };

    if (area) {
      const categoria = await Categoria.findAll({
        where: { area_tipo: area },
        attributes: ["id"],
      });

      const categoriasIds = categoria.map((c) => c.id);
      whereClause.categoria_id = categoriasIds;
    }

    return await Peticion.findAll({
      where: whereClause,
      include: [
        {
          model: Cliente,
          as: "cliente",
          attributes: ["id", "nombre"],
        },
        {
          model: Categoria,
          as: "categoria",
          attributes: ["id", "nombre", "area_tipo"],
        },
        {
          model: Usuario,
          as: "creador",
          attributes: ["uid", "nombre_completo"],
        },
      ],
      order: [["fecha_creacion", "ASC"]],
    });
  }

  async aceptarPeticion(id: number, tiempo_limite_horas: number, usuarioActual: any) {
    const peticion = await Peticion.findByPk(id);

    if (!peticion) {
      throw new NotFoundError("Petición no encontrada");
    }

    if (peticion.estado !== "Pendiente") {
      throw new ValidationError("Solo se pueden aceptar peticiones pendientes");
    }

    // Verificar que el usuario sea del área correcta
    const categoria = await Categoria.findByPk(peticion.categoria_id);
    const usuarioArea = await Area.findOne({ where: { nombre: usuarioActual.area } });

    if (categoria?.area_tipo !== usuarioArea?.nombre) {
      throw new ForbiddenError(
        `Solo usuarios del área de ${categoria?.area_tipo} pueden aceptar esta petición`
      );
    }

    // Calcular fecha límite
    const fecha_aceptacion = new Date();
    const fecha_limite = new Date(fecha_aceptacion);
    fecha_limite.setHours(fecha_limite.getHours() + tiempo_limite_horas);

    await peticion.update({
      estado: "En Progreso",
      asignado_a: usuarioActual.uid,
      fecha_aceptacion,
      fecha_limite,
      tiempo_limite_horas,
    });

    // Registrar en auditoría
    await this.auditoriaService.registrarCambio({
      tabla_afectada: "peticiones",
      registro_id: id,
      tipo_cambio: "ASIGNACION",
      campo_modificado: "asignado_a",
      valor_anterior: "null",
      valor_nuevo: usuarioActual.uid.toString(),
      usuario_id: usuarioActual.uid,
      descripcion: `Petición aceptada con ${tiempo_limite_horas} horas de límite`,
    });

    return await this.obtenerPorId(id);
  }

  async cambiarEstado(id: number, nuevoEstado: string, usuarioActual: any) {
    const peticion = await Peticion.findByPk(id);

    if (!peticion) {
      throw new NotFoundError("Petición no encontrada");
    }

    // Validar transiciones de estado
    const estadoAnterior = peticion.estado;

    if (estadoAnterior === "Resuelta" || estadoAnterior === "Cancelada") {
      throw new ValidationError("No se puede cambiar el estado de una petición resuelta o cancelada");
    }

    // Solo quien está asignado o creó la petición puede cambiar el estado
    if (
      peticion.asignado_a !== usuarioActual.uid &&
      peticion.creador_id !== usuarioActual.uid &&
      !["Admin", "Directivo", "Líder"].includes(usuarioActual.rol)
    ) {
      throw new ForbiddenError("No tienes permiso para cambiar el estado de esta petición");
    }

    // Si se marca como resuelta, establecer fecha_resolucion
    const updateData: any = { estado: nuevoEstado };
    if (nuevoEstado === "Resuelta") {
      updateData.fecha_resolucion = new Date();
    }

    await peticion.update(updateData);

    // Registrar en auditoría
    await this.auditoriaService.registrarCambio({
      tabla_afectada: "peticiones",
      registro_id: id,
      tipo_cambio: "CAMBIO_ESTADO",
      campo_modificado: "estado",
      valor_anterior: estadoAnterior,
      valor_nuevo: nuevoEstado,
      usuario_id: usuarioActual.uid,
      descripcion: `Cambio de estado de ${estadoAnterior} a ${nuevoEstado}`,
    });

    // Si se marca como Resuelta o Cancelada, mover al histórico
    if (nuevoEstado === "Resuelta" || nuevoEstado === "Cancelada") {
      await this.moverAHistorico(peticion);
    }

    return await this.obtenerPorId(id);
  }

  async actualizar(id: number, data: any, usuarioActual: any) {
    const peticion = await Peticion.findByPk(id);

    if (!peticion) {
      throw new NotFoundError("Petición no encontrada");
    }

    // Solo el creador o admin pueden actualizar
    if (
      peticion.creador_id !== usuarioActual.uid &&
      !["Admin", "Directivo"].includes(usuarioActual.rol)
    ) {
      throw new ForbiddenError("No tienes permiso para actualizar esta petición");
    }

    // No permitir cambios si ya está resuelta o cancelada
    if (["Resuelta", "Cancelada"].includes(peticion.estado)) {
      throw new ValidationError("No se puede actualizar una petición resuelta o cancelada");
    }

    await peticion.update(data);

    // Registrar en auditoría
    await this.auditoriaService.registrarCambio({
      tabla_afectada: "peticiones",
      registro_id: id,
      tipo_cambio: "UPDATE",
      valor_anterior: JSON.stringify(peticion),
      valor_nuevo: JSON.stringify(data),
      usuario_id: usuarioActual.uid,
      descripcion: "Actualización de petición",
    });

    return await this.obtenerPorId(id);
  }

  async obtenerPorClienteYMes(cliente_id: number, año: number, mes: number) {
    const fechaInicio = new Date(año, mes - 1, 1);
    const fechaFin = new Date(año, mes, 0, 23, 59, 59);

    const peticiones = await Peticion.findAll({
      where: {
        cliente_id,
        fecha_creacion: {
          [Op.between]: [fechaInicio, fechaFin],
        },
      },
      include: [
        { model: Categoria, as: "categoria", attributes: ["nombre", "area_tipo"] },
        { model: Usuario, as: "creador", attributes: ["nombre_completo"] },
        { model: Usuario, as: "asignado", attributes: ["nombre_completo"] },
      ],
    });

    // También buscar en el histórico
    const peticionesHistorico = await PeticionHistorico.findAll({
      where: {
        cliente_id,
        fecha_creacion: {
          [Op.between]: [fechaInicio, fechaFin],
        },
      },
      include: [
        { model: Categoria, as: "categoria", attributes: ["nombre", "area_tipo"] },
        { model: Usuario, as: "creador", attributes: ["nombre_completo"] },
        { model: Usuario, as: "asignado", attributes: ["nombre_completo"] },
      ],
    });

    const todasPeticiones = [...peticiones, ...peticionesHistorico];

    const totalCosto = todasPeticiones.reduce((sum, p) => sum + Number(p.costo), 0);

    return {
      peticiones: todasPeticiones,
      resumen: {
        total_peticiones: todasPeticiones.length,
        costo_total: totalCosto,
        por_estado: {
          pendientes: peticiones.filter((p) => p.estado === "Pendiente").length,
          en_progreso: peticiones.filter((p) => p.estado === "En Progreso").length,
          resueltas: peticionesHistorico.filter((p) => p.estado === "Resuelta").length,
          canceladas: peticionesHistorico.filter((p) => p.estado === "Cancelada").length,
        },
      },
    };
  }

  async moverAHistorico(peticion: Peticion) {
    // Copiar a histórico
    await PeticionHistorico.create({
      peticion_id_original: peticion.id,
      cliente_id: peticion.cliente_id,
      categoria_id: peticion.categoria_id,
      descripcion: peticion.descripcion,
      descripcion_extra: peticion.descripcion_extra,
      costo: peticion.costo,
      estado: peticion.estado as "Resuelta" | "Cancelada",
      creador_id: peticion.creador_id,
      asignado_a: peticion.asignado_a,
      fecha_creacion: peticion.fecha_creacion,
      fecha_aceptacion: peticion.fecha_aceptacion,
      fecha_limite: peticion.fecha_limite,
      fecha_resolucion: peticion.fecha_resolucion!,
      tiempo_limite_horas: peticion.tiempo_limite_horas,
    });

    // Eliminar de la tabla de peticiones activas
    await peticion.destroy();

    console.log(`✅ Petición ${peticion.id} movida al histórico`);
  }

  async obtenerHistorico(filtros?: any) {
    const whereClause: any = {};

    if (filtros?.cliente_id) {
      whereClause.cliente_id = filtros.cliente_id;
    }

    if (filtros?.estado) {
      whereClause.estado = filtros.estado;
    }

    if (filtros?.año && filtros?.mes) {
      const fechaInicio = new Date(filtros.año, filtros.mes - 1, 1);
      const fechaFin = new Date(filtros.año, filtros.mes, 0, 23, 59, 59);

      whereClause.fecha_resolucion = {
        [Op.between]: [fechaInicio, fechaFin],
      };
    }

    return await PeticionHistorico.findAll({
      where: whereClause,
      include: [
        { model: Cliente, as: "cliente", attributes: ["id", "nombre"] },
        { model: Categoria, as: "categoria", attributes: ["id", "nombre", "area_tipo"] },
        { model: Usuario, as: "creador", attributes: ["uid", "nombre_completo"] },
        { model: Usuario, as: "asignado", attributes: ["uid", "nombre_completo"] },
      ],
      order: [["fecha_resolucion", "DESC"]],
    });
  }
}