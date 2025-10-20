import EstadisticaUsuario from "../models/EstadisticasUsuario";
import Usuario from "../models/Usuario";
import Peticion from "../models/Peticion";
import PeticionHistorico from "../models/PeticionHistorico";
import Area from "../models/Area";
import { Op } from "sequelize";
import sequelize from "../database/connection";

export class EstadisticaService {
  async calcularEstadisticasUsuario(
    usuario_id: number,
    año: number,
    mes: number
  ) {
    const fechaInicio = new Date(año, mes - 1, 1);
    const fechaFin = new Date(año, mes, 0, 23, 59, 59);

    // Peticiones creadas (activas + históricas)
    const peticiones_creadas_activas = await Peticion.count({
      where: {
        creador_id: usuario_id,
        fecha_creacion: {
          [Op.between]: [fechaInicio, fechaFin],
        },
      },
    });

    const peticiones_creadas_historico = await PeticionHistorico.count({
      where: {
        creador_id: usuario_id,
        fecha_creacion: {
          [Op.between]: [fechaInicio, fechaFin],
        },
      },
    });

    const peticiones_creadas = peticiones_creadas_activas + peticiones_creadas_historico;

    // Peticiones resueltas (solo históricas porque las resueltas se mueven ahí)
    const peticiones_resueltas = await PeticionHistorico.count({
      where: {
        asignado_a: usuario_id,
        estado: "Resuelta",
        fecha_resolucion: {
          [Op.between]: [fechaInicio, fechaFin],
        },
      },
    });

    // Peticiones canceladas (solo históricas porque las canceladas se mueven ahí)
    const peticiones_canceladas = await PeticionHistorico.count({
      where: {
        asignado_a: usuario_id,
        estado: "Cancelada",
        fecha_resolucion: {
          [Op.between]: [fechaInicio, fechaFin],
        },
      },
    });

    // ✅ NUEVAS ESTADÍSTICAS: Peticiones actuales asignadas al usuario (independiente del periodo)
    const peticiones_pendientes_actual = await Peticion.count({
      where: {
        asignado_a: usuario_id,
        estado: "Pendiente",
      },
    });

    const peticiones_en_progreso_actual = await Peticion.count({
      where: {
        asignado_a: usuario_id,
        estado: "En Progreso",
      },
    });

    const peticiones_pausadas_actual = await Peticion.count({
      where: {
        asignado_a: usuario_id,
        estado: "Pausada",
      },
    });

    // Tiempo promedio de resolución
    const peticionesConTiempo = await PeticionHistorico.findAll({
      where: {
        asignado_a: usuario_id,
        estado: "Resuelta",
        fecha_resolucion: {
          [Op.between]: [fechaInicio, fechaFin],
        },
        fecha_aceptacion: {
          [Op.not]: null,
        },
      },
      attributes: ["fecha_aceptacion", "fecha_resolucion"],
    });

    let tiempo_promedio_resolucion_horas = null;

    if (peticionesConTiempo.length > 0) {
      const tiemposTotales = peticionesConTiempo.map((p) => {
        const inicio = new Date(p.fecha_aceptacion!).getTime();
        const fin = new Date(p.fecha_resolucion).getTime();
        return (fin - inicio) / (1000 * 60 * 60); // Convertir a horas
      });

      tiempo_promedio_resolucion_horas =
        tiemposTotales.reduce((sum, t) => sum + t, 0) / tiemposTotales.length;
    }

    // Costo total generado (suma de peticiones resueltas)
    // ⬇️ AQUÍ ESTÁ LA CORRECCIÓN
    const resultadoCosto = (await PeticionHistorico.findOne({
      where: {
        asignado_a: usuario_id,
        estado: "Resuelta",
        fecha_resolucion: {
          [Op.between]: [fechaInicio, fechaFin],
        },
      },
      attributes: [[sequelize.fn("SUM", sequelize.col("costo")), "total"]],
      raw: true,
    })) as { total: string | null } | null;

    const costo_total_generado = Number(resultadoCosto?.total || 0);

    // Crear o actualizar estadística
    const [estadistica, created] = await EstadisticaUsuario.findOrCreate({
      where: {
        usuario_id,
        año,
        mes,
      },
      defaults: {
        usuario_id,
        año,
        mes,
        peticiones_creadas,
        peticiones_resueltas,
        peticiones_canceladas,
        tiempo_promedio_resolucion_horas,
        costo_total_generado,
        fecha_calculo: new Date(),
        // ✅ Nuevos campos de estado actual
        peticiones_pendientes_actual,
        peticiones_en_progreso_actual,
        peticiones_pausadas_actual,
      },
    });

    if (!created) {
      await estadistica.update({
        peticiones_creadas,
        peticiones_resueltas,
        peticiones_canceladas,
        tiempo_promedio_resolucion_horas,
        costo_total_generado,
        fecha_calculo: new Date(),
        // ✅ Actualizar también los campos de estado actual
        peticiones_pendientes_actual,
        peticiones_en_progreso_actual,
        peticiones_pausadas_actual,
      });
    }

    return estadistica;
  }

  async obtenerEstadisticasUsuario(
    usuario_id: number,
    año?: number,
    mes?: number
  ) {
    const whereClause: any = { usuario_id };

    if (año) {
      whereClause.año = año;
    }

    if (mes) {
      whereClause.mes = mes;
    }

    let estadisticas = await EstadisticaUsuario.findAll({
      where: whereClause,
      include: [
        {
          model: Usuario,
          as: "usuario",
          attributes: ["uid", "nombre_completo", "correo"],
          include: [{ model: Area, as: "area", attributes: ["nombre"] }],
        },
      ],
      order: [
        ["año", "DESC"],
        ["mes", "DESC"],
      ],
    });

    // 🔥 Si NO existen estadísticas y se especificó año y mes, calcularlas automáticamente
    if ((!estadisticas || estadisticas.length === 0) && año && mes) {
      console.log(`⚠️ No hay estadísticas para usuario ${usuario_id} en ${año}-${mes}. Calculando automáticamente...`);
      await this.calcularEstadisticasUsuario(usuario_id, año, mes);
      
      // Volver a consultar después de calcular
      estadisticas = await EstadisticaUsuario.findAll({
        where: whereClause,
        include: [
          {
            model: Usuario,
            as: "usuario",
            attributes: ["uid", "nombre_completo", "correo"],
            include: [{ model: Area, as: "area", attributes: ["nombre"] }],
          },
        ],
        order: [
          ["año", "DESC"],
          ["mes", "DESC"],
        ],
      });
    }

    return estadisticas;
  }

  async obtenerEstadisticasPorArea(
    area_nombre: string | null,
    año: number,
    mes: number
  ) {
    // Si area_nombre es null (Admin), devolver todas las estadísticas
    if (!area_nombre) {
      return await EstadisticaUsuario.findAll({
        where: { año, mes },
        include: [
          {
            model: Usuario,
            as: "usuario",
            attributes: ["uid", "nombre_completo", "correo"],
            include: [
              {
                model: Area,
                as: "area",
                attributes: ["nombre"],
              },
            ],
          },
        ],
        order: [["peticiones_resueltas", "DESC"]],
      });
    }

    const area = await Area.findOne({ where: { nombre: area_nombre } });

    if (!area) {
      return [];
    }

    const usuariosArea = await Usuario.findAll({
      where: { area_id: area.id },
      attributes: ["uid"],
    });

    const usuariosIds = usuariosArea.map((u) => u.uid);

    return await EstadisticaUsuario.findAll({
      where: {
        usuario_id: usuariosIds,
        año,
        mes,
      },
      include: [
        {
          model: Usuario,
          as: "usuario",
          attributes: ["uid", "nombre_completo", "correo"],
        },
      ],
      order: [["peticiones_resueltas", "DESC"]],
    });
  }

  async obtenerEstadisticasGlobales(año: number, mes: number) {
    // Verificar si existen estadísticas para este periodo
    let estadisticas = await EstadisticaUsuario.findAll({
      where: { año, mes },
      include: [
        {
          model: Usuario,
          as: "usuario",
          attributes: ["uid", "nombre_completo"],
          include: [{ model: Area, as: "area", attributes: ["nombre"] }],
        },
      ],
    });

    // 🔥 Si NO existen estadísticas, calcularlas automáticamente
    if (!estadisticas || estadisticas.length === 0) {
      console.log(`⚠️ No hay estadísticas para ${año}-${mes}. Recalculando automáticamente...`);
      await this.recalcularTodasEstadisticas(año, mes);
      
      // Volver a consultar después de calcular
      estadisticas = await EstadisticaUsuario.findAll({
        where: { año, mes },
        include: [
          {
            model: Usuario,
            as: "usuario",
            attributes: ["uid", "nombre_completo"],
            include: [{ model: Area, as: "area", attributes: ["nombre"] }],
          },
        ],
      });
    }

    const totales = {
      total_peticiones_creadas: 0,
      total_peticiones_resueltas: 0,
      total_peticiones_canceladas: 0,
      total_costo_generado: 0,
      promedio_tiempo_resolucion: 0,
    };

    let sumaPromediosTiempo = 0;
    let contadorPromedios = 0;

    estadisticas.forEach((est) => {
      totales.total_peticiones_creadas += est.peticiones_creadas;
      totales.total_peticiones_resueltas += est.peticiones_resueltas;
      totales.total_peticiones_canceladas += est.peticiones_canceladas;
      totales.total_costo_generado += Number(est.costo_total_generado);

      if (est.tiempo_promedio_resolucion_horas) {
        sumaPromediosTiempo += Number(est.tiempo_promedio_resolucion_horas);
        contadorPromedios++;
      }
    });

    if (contadorPromedios > 0) {
      totales.promedio_tiempo_resolucion =
        sumaPromediosTiempo / contadorPromedios;
    }

    // Agrupar por área
    const porArea: any = {};

    estadisticas.forEach((est) => {
      const areaNombre = (est as any).usuario.area.nombre;

      if (!porArea[areaNombre]) {
        porArea[areaNombre] = {
          area: areaNombre,
          peticiones_creadas: 0,
          peticiones_resueltas: 0,
          peticiones_canceladas: 0,
          costo_total: 0,
          efectividad: 0,
        };
      }

      porArea[areaNombre].peticiones_creadas += est.peticiones_creadas;
      porArea[areaNombre].peticiones_resueltas += est.peticiones_resueltas;
      porArea[areaNombre].peticiones_canceladas += est.peticiones_canceladas;
      porArea[areaNombre].costo_total += Number(est.costo_total_generado);
    });

    // Calcular efectividad por área
    Object.values(porArea).forEach((area: any) => {
      const totalProcesadas = area.peticiones_resueltas + area.peticiones_canceladas;
      if (totalProcesadas > 0) {
        area.efectividad = ((area.peticiones_resueltas / totalProcesadas) * 100).toFixed(2);
      } else {
        area.efectividad = 0;
      }
    });

    return {
      totales,
      por_area: Object.values(porArea),
      por_usuario: estadisticas.map((est) => ({
        uid: (est as any).usuario.uid,
        nombre_completo: (est as any).usuario.nombre_completo,
        area: (est as any).usuario.area.nombre,
        peticiones_creadas: est.peticiones_creadas,
        peticiones_resueltas: est.peticiones_resueltas,
        peticiones_canceladas: est.peticiones_canceladas,
        tiempo_promedio_resolucion_horas: est.tiempo_promedio_resolucion_horas,
        costo_total_generado: est.costo_total_generado,
      })),
    };
  }

  async recalcularTodasEstadisticas(año: number, mes: number) {
    const usuarios = await Usuario.findAll({
      where: { status: true },
      attributes: ["uid"],
    });

    const resultados = [];

    for (const usuario of usuarios) {
      const estadistica = await this.calcularEstadisticasUsuario(
        usuario.uid,
        año,
        mes
      );
      resultados.push(estadistica);
    }

    console.log(
      `✅ Recalculadas ${resultados.length} estadísticas para ${año}-${mes}`
    );

    return resultados;
  }
}
