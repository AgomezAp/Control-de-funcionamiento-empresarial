import PeriodoFacturacion from "../models/PeriodoFacturacion";
import Cliente from "../models/Cliente";
import Peticion from "../models/Peticion";
import PeticionHistorico from "../models/PeticionHistorico";
import Categoria from "../models/Categoria";
import Usuario from "../models/Usuario";
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
          attributes: ["id", "nombre", "cedula", "telefono", "correo", "ciudad", "direccion", "pais", "tipo_cliente"],
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
          attributes: ["id", "nombre", "cedula", "telefono", "correo", "ciudad", "direccion", "pais", "tipo_cliente"],
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
        { 
          model: Usuario, 
          as: "asignado", 
          attributes: ["uid", "nombre_completo", "correo"] 
        },
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
        { 
          model: Usuario, 
          as: "asignado", 
          attributes: ["uid", "nombre_completo", "correo"] 
        },
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
          attributes: ["id", "nombre", "cedula", "telefono", "correo", "ciudad", "direccion", "pais", "tipo_cliente"],
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

  /**
   * Genera facturación automática para TODAS las peticiones resueltas del periodo
   * que no tengan un periodo de facturación asociado
   */
  async generarFacturacionAutomatica(año: number, mes: number) {
    const fechaInicio = new Date(año, mes - 1, 1);
    const fechaFin = new Date(año, mes, 0, 23, 59, 59);

    // 1. Buscar TODAS las peticiones resueltas del periodo en el histórico
    const peticionesResueltas = await PeticionHistorico.findAll({
      where: {
        estado: "Resuelta",
        fecha_resolucion: {
          [Op.between]: [fechaInicio, fechaFin],
        },
      },
      include: [
        {
          model: Cliente,
          as: "cliente",
          attributes: ["id", "nombre", "cedula", "telefono", "correo", "ciudad", "direccion", "pais", "tipo_cliente"],
        },
        {
          model: Categoria,
          as: "categoria",
          attributes: ["nombre", "area_tipo"],
        },
      ],
    });

    if (peticionesResueltas.length === 0) {
      return {
        mensaje: "No hay peticiones resueltas para este periodo",
        periodos_generados: 0,
        total_peticiones: 0,
        costo_total: 0,
      };
    }

    // 2. Agrupar por cliente_id
    const peticionesPorCliente: any = {};

    peticionesResueltas.forEach((peticion) => {
      const clienteId = peticion.cliente_id;

      if (!peticionesPorCliente[clienteId]) {
        peticionesPorCliente[clienteId] = {
          cliente: (peticion as any).cliente,
          peticiones: [],
          costo_total: 0,
        };
      }

      peticionesPorCliente[clienteId].peticiones.push(peticion);
      peticionesPorCliente[clienteId].costo_total += Number(peticion.costo);
    });

    // 3. Crear/actualizar periodo de facturación para cada cliente
    const periodosGenerados = [];
    let totalPeticiones = 0;
    let costoTotal = 0;

    for (const clienteId in peticionesPorCliente) {
      const data = peticionesPorCliente[clienteId];

      // Buscar si ya existe un periodo
      const [periodo, created] = await PeriodoFacturacion.findOrCreate({
        where: {
          cliente_id: Number(clienteId),
          año,
          mes,
        },
        defaults: {
          cliente_id: Number(clienteId),
          año,
          mes,
          total_peticiones: data.peticiones.length,
          costo_total: data.costo_total,
          estado: "Abierto",
        },
      });

      if (!created) {
        // Si ya existía, actualizar con los nuevos totales
        await periodo.update({
          total_peticiones: data.peticiones.length,
          costo_total: data.costo_total,
        });
      }

      periodosGenerados.push({
        periodo_id: periodo.id,
        cliente: data.cliente.nombre,
        peticiones: data.peticiones.length,
        costo: data.costo_total,
        estado: created ? "Creado" : "Actualizado",
      });

      totalPeticiones += data.peticiones.length;
      costoTotal += data.costo_total;
    }

    console.log(
      `✅ Facturación automática generada: ${periodosGenerados.length} clientes, ${totalPeticiones} peticiones, $${costoTotal}`
    );

    return {
      mensaje: "Facturación automática generada exitosamente",
      periodos_generados: periodosGenerados.length,
      total_peticiones: totalPeticiones,
      costo_total: costoTotal,
      detalle: periodosGenerados,
    };
  }
}