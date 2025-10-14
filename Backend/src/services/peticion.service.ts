import Peticion from "../models/Peticion";
import PeticionHistorico from "../models/PeticionHistorico";
import Cliente from "../models/Cliente";
import Categoria from "../models/Categoria";
import Usuario from "../models/Usuario";
import Area from "../models/Area";
import { NotFoundError, ValidationError, ForbiddenError } from "../utils/error.util";
import { AuditoriaService } from "./auditoria.service";
import { webSocketService } from "./webSocket.service";
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
      area: "Pautas" | "Diseño";
      tiempo_limite_horas?: number;
    },
    usuarioActual: any
  ) {
    // Verificar que el cliente existe
    const clienteData = await Cliente.findByPk(data.cliente_id);
    if (!clienteData) {
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

    // Determinar estado y asignación según el área
    let estadoInicial: "Pendiente" | "En Progreso" = "Pendiente";
    let usuarioAsignado: number | null = null;
    let fechaAceptacion: Date | null = null;
    let temporizadorActivo = false;
    let fechaInicioTemporizador: Date | null = null;

    // Si el área es "Pautas", asignar automáticamente al pautador del cliente
    if (data.area === "Pautas") {
      estadoInicial = "En Progreso";
      usuarioAsignado = clienteData.pautador_id;
      fechaAceptacion = new Date();
      temporizadorActivo = true;
      fechaInicioTemporizador = new Date();
    }

    // Crear la petición
    const peticion = await Peticion.create({
      cliente_id: data.cliente_id,
      categoria_id: data.categoria_id,
      descripcion: data.descripcion,
      descripcion_extra: data.descripcion_extra,
      costo: costoFinal,
      area: data.area,
      estado: estadoInicial,
      creador_id: usuarioActual.uid,
      asignado_a: usuarioAsignado,
      fecha_aceptacion: fechaAceptacion,
      temporizador_activo: temporizadorActivo,
      fecha_inicio_temporizador: fechaInicioTemporizador,
    });

    // Registrar en auditoría
    await this.auditoriaService.registrarCambio({
      tabla_afectada: "peticiones",
      registro_id: peticion.id,
      tipo_cambio: "INSERT",
      valor_nuevo: JSON.stringify({
        cliente_id: data.cliente_id,
        categoria_id: data.categoria_id,
        area: data.area,
        estado: estadoInicial,
        asignado_a: usuarioAsignado,
      }),
      usuario_id: usuarioActual.uid,
      descripcion: data.area === "Pautas" 
        ? "Creación de petición de Pautas (auto-asignada)"
        : "Creación de nueva petición",
    });

    // Obtener petición completa con relaciones
    const peticionCompleta = await this.obtenerPorId(peticion.id);

    // Emitir evento WebSocket
    if (data.area === "Pautas") {
      // Si fue auto-asignada, emitir evento de aceptación
      // Obtener datos del usuario asignado
      const usuarioPautador = await Usuario.findByPk(usuarioAsignado!);
      
      webSocketService.emitPeticionAceptada(
        peticion.id,
        usuarioAsignado!,
        {
          uid: usuarioPautador!.uid,
          nombre_completo: usuarioPautador!.nombre_completo,
          correo: usuarioPautador!.correo,
        },
        fechaAceptacion!,
        null,
        0
      );
    } else {
      // Si es de Diseño, emitir evento de nueva petición
      webSocketService.emitNuevaPeticion(peticionCompleta);
    }

    return peticionCompleta;
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

  async aceptarPeticion(id: number, usuarioActual: any) {
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

    // Iniciar temporizador automáticamente
    const fecha_aceptacion = new Date();

    await peticion.update({
      estado: "En Progreso",
      asignado_a: usuarioActual.uid,
      fecha_aceptacion,
      temporizador_activo: true,
      fecha_inicio_temporizador: fecha_aceptacion,
      tiempo_empleado_segundos: 0,
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
      descripcion: `Petición aceptada - Temporizador iniciado`,
    });

    // Obtener petición actualizada con relaciones
    const peticionActualizada = await this.obtenerPorId(id);

    // Emitir evento WebSocket de petición aceptada
    webSocketService.emitPeticionAceptada(
      id,
      usuarioActual.uid,
      {
        uid: usuarioActual.uid,
        nombre_completo: usuarioActual.nombre_completo,
        email: usuarioActual.email,
      },
      fecha_aceptacion,
      null, // ya no hay fecha_limite
      0 // ya no hay tiempo_limite_horas
    );

    return peticionActualizada;
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

    // Si se marca como resuelta o cancelada, establecer fecha_resolucion
    const updateData: any = { estado: nuevoEstado };
    if (nuevoEstado === "Resuelta" || nuevoEstado === "Cancelada") {
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

    // Emitir evento WebSocket de cambio de estado
    webSocketService.emitCambioEstado(
      id,
      nuevoEstado,
      nuevoEstado === "Resuelta" ? updateData.fecha_resolucion : undefined
    );

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
    // Asegurar que tenga fecha_resolucion (por si acaso)
    if (!peticion.fecha_resolucion) {
      peticion.fecha_resolucion = new Date();
      await peticion.save();
    }

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
      fecha_resolucion: peticion.fecha_resolucion,
      tiempo_empleado_segundos: peticion.tiempo_empleado_segundos,
    });

    // Eliminar de la tabla de peticiones activas
    await peticion.destroy();

    console.log(`✅ Petición ${peticion.id} movida al histórico`);
  }

  async obtenerHistorico(filtros?: any, usuarioActual?: any) {
    const whereClause: any = {};

    // Si el usuario no es Admin, solo puede ver:
    // - Peticiones que él creó (creador_id)
    // - Peticiones que le fueron asignadas (asignado_a)
    if (usuarioActual && usuarioActual.role !== "Admin") {
      whereClause[Op.or] = [
        { creador_id: usuarioActual.uid },
        { asignado_a: usuarioActual.uid },
      ];
    }

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

  /**
   * Obtener resumen global de peticiones (activas + históricas)
   * Útil para dashboards de administradores
   */
  async obtenerResumenGlobal() {
    // Contar peticiones activas
    const peticionesActivas = await Peticion.findAll();
    
    // Contar peticiones históricas
    const peticionesHistoricas = await PeticionHistorico.findAll();

    // Totales
    const totalPeticiones = peticionesActivas.length + peticionesHistoricas.length;
    
    // Por estado
    const pendientes = peticionesActivas.filter((p) => p.estado === "Pendiente").length;
    const enProgreso = peticionesActivas.filter((p) => p.estado === "En Progreso").length;
    const resueltas = peticionesHistoricas.filter((p) => p.estado === "Resuelta").length;
    const canceladas = peticionesHistoricas.filter((p) => p.estado === "Cancelada").length;

    // Costo total
    const costoActivas = peticionesActivas.reduce((sum, p) => sum + Number(p.costo), 0);
    const costoHistoricas = peticionesHistoricas.reduce((sum, p) => sum + Number(p.costo), 0);
    const costoTotal = costoActivas + costoHistoricas;

    return {
      total_peticiones: totalPeticiones,
      por_estado: {
        pendientes,
        en_progreso: enProgreso,
        resueltas,
        canceladas,
      },
      costo_total: costoTotal,
      activas: peticionesActivas.length,
      historicas: peticionesHistoricas.length,
    };
  }

  // ====== MÉTODOS DE CONTROL DE TEMPORIZADOR ======

  async pausarTemporizador(id: number, usuarioActual: any) {
    const peticion = await Peticion.findByPk(id);
    if (!peticion) throw new NotFoundError("Petición no encontrada");
    if (peticion.asignado_a !== usuarioActual.uid) {
      throw new ForbiddenError("Solo puedes pausar peticiones asignadas a ti");
    }
    if (!peticion.temporizador_activo) {
      throw new ValidationError("El temporizador no está activo");
    }

    const ahora = new Date();
    const tiempoTranscurridoSegundos = Math.floor(
      (ahora.getTime() - peticion.fecha_inicio_temporizador!.getTime()) / 1000
    );
    const nuevoTiempoTotal = peticion.tiempo_empleado_segundos + tiempoTranscurridoSegundos;

    await peticion.update({
      temporizador_activo: false,
      tiempo_empleado_segundos: nuevoTiempoTotal,
      fecha_pausa_temporizador: ahora,
    });

    await this.auditoriaService.registrarCambio({
      tabla_afectada: "peticiones",
      registro_id: id,
      tipo_cambio: "UPDATE",
      campo_modificado: "temporizador_activo",
      valor_anterior: "true",
      valor_nuevo: "false",
      usuario_id: usuarioActual.uid,
      descripcion: `Temporizador pausado`,
    });

    const peticionActualizada = await this.obtenerPorId(id);
    webSocketService.emitCambioEstado(id, peticion.estado, usuarioActual.uid);
    return peticionActualizada;
  }

  async reanudarTemporizador(id: number, usuarioActual: any) {
    const peticion = await Peticion.findByPk(id);
    if (!peticion) throw new NotFoundError("Petición no encontrada");
    if (peticion.asignado_a !== usuarioActual.uid) {
      throw new ForbiddenError("Solo puedes reanudar peticiones asignadas a ti");
    }
    if (peticion.temporizador_activo) {
      throw new ValidationError("El temporizador ya está activo");
    }
    if (peticion.estado !== "En Progreso") {
      throw new ValidationError("Solo se pueden reanudar peticiones en progreso");
    }

    const ahora = new Date();
    await peticion.update({
      temporizador_activo: true,
      fecha_inicio_temporizador: ahora,
    });

    await this.auditoriaService.registrarCambio({
      tabla_afectada: "peticiones",
      registro_id: id,
      tipo_cambio: "UPDATE",
      campo_modificado: "temporizador_activo",
      valor_anterior: "false",
      valor_nuevo: "true",
      usuario_id: usuarioActual.uid,
      descripcion: `Temporizador reanudado`,
    });

    const peticionActualizada = await this.obtenerPorId(id);
    webSocketService.emitCambioEstado(id, peticion.estado, usuarioActual.uid);
    return peticionActualizada;
  }

  async obtenerTiempoEmpleado(id: number) {
    const peticion = await Peticion.findByPk(id);
    if (!peticion) throw new NotFoundError("Petición no encontrada");

    let tiempoTotal = peticion.tiempo_empleado_segundos;
    if (peticion.temporizador_activo && peticion.fecha_inicio_temporizador) {
      const ahora = new Date();
      const tiempoTranscurrido = Math.floor(
        (ahora.getTime() - peticion.fecha_inicio_temporizador.getTime()) / 1000
      );
      tiempoTotal += tiempoTranscurrido;
    }

    return {
      tiempo_empleado_segundos: tiempoTotal,
      tiempo_empleado_formato: this.formatearTiempo(tiempoTotal),
      temporizador_activo: peticion.temporizador_activo,
    };
  }

  private formatearTiempo(segundos: number): string {
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    const segs = segundos % 60;
    return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
  }
}
