import PeriodoFacturacion from "../models/PeriodoFacturacion";
import Cliente from "../models/Cliente";
import Peticion from "../models/Peticion";
import PeticionHistorico from "../models/PeticionHistorico";
import Categoria from "../models/Categoria";
import { Op } from "sequelize";
import sequelize from "../database/connection";
import { NotFoundError } from "../utils/error.util";

export class FacturacionService {
  async generarPeriodoFacturacion(cliente_id: number, año: number, mes: number) {
    // Verificar que el cliente existe
    const cliente = await Cliente.findByPk(cliente_id);
    if (!cliente) {
      throw new NotFoundError("Cliente no encontrado");
    }

    // Calcular fechas del periodo
    const fechaInicio = new Date(año, mes - 1, 1);
    const fechaFin = new Date(año, mes, 0, 23, 59, 59);

    // Buscar peticiones del periodo (activas)
    const peticionesActivas = await Peticion.findAll({
      where: {
        cliente_id,
        fecha_creacion: {
          [Op.between]: [fechaInicio, fechaFin],
        },
      },
    });

    // Buscar peticiones del periodo (histórico)
    const peticionesHistorico = await PeticionHistorico.findAll({
      where: {
        cliente_id,
        fecha_creacion: {
          [Op.between]: [fechaInicio, fechaFin],
        },
      },
    });

    const todasPeticiones = [...peticionesActivas, ...peticionesHistorico];

    // Calcular totales
    const total_peticiones = todasPeticiones.length;
    const costo_total = todasPeticiones.reduce((sum, p) => sum + Number(p.costo), 0);

    // Crear o actualizar periodo de facturación
    const [periodo, created] = await PeriodoFacturacion.findOrCreate({
      where: {
        cliente_id,
        año,
        mes,
      },
      defaults: {
        cliente_id,
        año,
        mes,
        total_peticiones,
        costo_total,
        estado: "Abierto",
      },
    });

    if (!created) {
      await periodo.update({
        total_peticiones,
        costo_total,
      });
    }

    return await this.obtenerPeriodoPorId(periodo.id);
  }

  async obtenerPeriodoPorId(id: number) {
    const periodo = await PeriodoFacturacion.findByPk(id, {
      include: [
        {
          model: Cliente,
          as: "cliente",
          attributes: ["id", "nombre", "pais"],
        },
      ],
    });

    if (!periodo) {
      throw new NotFoundError("Periodo de facturación no encontrado");
    }

    return periodo;
  }

  async obtenerPeriodosPorCliente(cliente_id: number, año?: number) {
    const whereClause: any = { cliente_id };

    if (año) {
      whereClause.año = año;
    }

    return await PeriodoFacturacion.findAll({
      where: whereClause,
      include: [
        {
          model: Cliente,
          as: "cliente",
          attributes: ["id", "nombre"],
        },
      ],
      order: [["año", "DESC"], ["mes", "DESC"]],
    });
  }

  async obtenerDetallePeriodo(cliente_id: number, año: number, mes: number) {
    // Buscar el periodo
    const periodo = await PeriodoFacturacion.findOne({
      where: { cliente_id, año, mes },
      include: [
        {
          model: Cliente,
          as: "cliente",
        },
      ],
    });

    if (!periodo) {
      throw new NotFoundError("Periodo de facturación no encontrado");
    }

    // Obtener peticiones del periodo
    const fechaInicio = new Date(año, mes - 1, 1);
    const fechaFin = new Date(año, mes, 0, 23, 59, 59);

    const peticionesActivas = await Peticion.findAll({
      where: {
        cliente_id,
        fecha_creacion: {
          [Op.between]: [fechaInicio, fechaFin],
        },
      },
      include: [
        { model: Categoria, as: "categoria", attributes: ["nombre", "area_tipo"] },
      ],
    });

    const peticionesHistorico = await PeticionHistorico.findAll({
      where: {
        cliente_id,
        fecha_creacion: {
          [Op.between]: [fechaInicio, fechaFin],
        },
      },
      include: [
        { model: Categoria, as: "categoria", attributes: ["nombre", "area_tipo"] },
      ],
    });

    const todasPeticiones = [...peticionesActivas, ...peticionesHistorico];

    // Agrupar por categoría
    const porCategoria: any = {};

    todasPeticiones.forEach((pet) => {
      const categoriaNombre = (pet as any).categoria.nombre;

      if (!porCategoria[categoriaNombre]) {
        porCategoria[categoriaNombre] = {
          categoria: categoriaNombre,
          area_tipo: (pet as any).categoria.area_tipo,
          cantidad: 0,
          costo_total: 0,
        };
      }

      porCategoria[categoriaNombre].cantidad++;
      porCategoria[categoriaNombre].costo_total += Number(pet.costo);
    });

    return {
      periodo,
      detalle_peticiones: todasPeticiones,
      resumen_categorias: Object.values(porCategoria),
      totales: {
        total_peticiones: todasPeticiones.length,
        costo_total: todasPeticiones.reduce((sum, p) => sum + Number(p.costo), 0),
      },
    };
  }

  async cerrarPeriodo(id: number) {
    const periodo = await PeriodoFacturacion.findByPk(id);

    if (!periodo) {
      throw new NotFoundError("Periodo de facturación no encontrado");
    }

    await periodo.update({ estado: "Cerrado" });

    return periodo;
  }

  async facturarPeriodo(id: number) {
    const periodo = await PeriodoFacturacion.findByPk(id);

    if (!periodo) {
      throw new NotFoundError("Periodo de facturación no encontrado");
    }

    if (periodo.estado !== "Cerrado") {
      await periodo.update({ estado: "Cerrado" });
    }

    await periodo.update({ estado: "Facturado" });

    return periodo;
  }

  async obtenerResumenFacturacionMensual(año: number, mes: number) {
    const periodos = await PeriodoFacturacion.findAll({
      where: { año, mes },
      include: [
        {
          model: Cliente,
          as: "cliente",
          attributes: ["id", "nombre", "pais"],
        },
      ],
      order: [["costo_total", "DESC"]],
    });

    const totales = {
      total_clientes: periodos.length,
      total_peticiones: periodos.reduce((sum, p) => sum + p.total_peticiones, 0),
      costo_total: periodos.reduce((sum, p) => sum + Number(p.costo_total), 0),
      por_estado: {
        abiertos: periodos.filter((p) => p.estado === "Abierto").length,
        cerrados: periodos.filter((p) => p.estado === "Cerrado").length,
        facturados: periodos.filter((p) => p.estado === "Facturado").length,
      },
    };

    return {
      periodos,
      totales,
    };
  }

  async generarPeriodosParaTodosLosClientes(año: number, mes: number) {
    const clientes = await Cliente.findAll({
      where: { status: true },
      attributes: ["id"],
    });

    const resultados = [];

    for (const cliente of clientes) {
      try {
        const periodo = await this.generarPeriodoFacturacion(cliente.id, año, mes);
        resultados.push(periodo);
      } catch (error) {
        console.error(`Error generando periodo para cliente ${cliente.id}:`, error);
      }
    }

    console.log(`✅ Generados ${resultados.length} periodos de facturación para ${año}-${mes}`);

    return resultados;
  }
}