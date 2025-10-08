"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FacturacionController = void 0;
const facturacion_service_1 = require("../services/facturacion.service");
const response_util_1 = require("../utils/response.util");
const facturacionService = new facturacion_service_1.FacturacionService();
class FacturacionController {
    generarPeriodoFacturacion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { cliente_id, año, mes } = req.body;
                const periodo = yield facturacionService.generarPeriodoFacturacion(Number(cliente_id), Number(año), Number(mes));
                return response_util_1.ApiResponse.created(res, periodo, "Periodo de facturación generado exitosamente");
            }
            catch (error) {
                return response_util_1.ApiResponse.error(res, error.message || "Error al generar periodo de facturación", error.statusCode || 500);
            }
        });
    }
    obtenerPeriodoPorId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const periodo = yield facturacionService.obtenerPeriodoPorId(Number(id));
                return response_util_1.ApiResponse.success(res, periodo, "Periodo de facturación obtenido exitosamente");
            }
            catch (error) {
                return response_util_1.ApiResponse.error(res, error.message || "Error al obtener periodo de facturación", error.statusCode || 500);
            }
        });
    }
    obtenerPeriodosPorCliente(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { cliente_id } = req.params;
                const { año } = req.query;
                const periodos = yield facturacionService.obtenerPeriodosPorCliente(Number(cliente_id), año ? Number(año) : undefined);
                return response_util_1.ApiResponse.success(res, periodos, "Periodos de facturación obtenidos exitosamente");
            }
            catch (error) {
                return response_util_1.ApiResponse.error(res, error.message || "Error al obtener periodos de facturación", error.statusCode || 500);
            }
        });
    }
    obtenerDetallePeriodo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { cliente_id, año, mes } = req.query;
                const detalle = yield facturacionService.obtenerDetallePeriodo(Number(cliente_id), Number(año), Number(mes));
                return response_util_1.ApiResponse.success(res, detalle, "Detalle del periodo obtenido exitosamente");
            }
            catch (error) {
                return response_util_1.ApiResponse.error(res, error.message || "Error al obtener detalle del periodo", error.statusCode || 500);
            }
        });
    }
    cerrarPeriodo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const periodo = yield facturacionService.cerrarPeriodo(Number(id));
                return response_util_1.ApiResponse.success(res, periodo, "Periodo cerrado exitosamente");
            }
            catch (error) {
                return response_util_1.ApiResponse.error(res, error.message || "Error al cerrar periodo", error.statusCode || 500);
            }
        });
    }
    facturarPeriodo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const periodo = yield facturacionService.facturarPeriodo(Number(id));
                return response_util_1.ApiResponse.success(res, periodo, "Periodo facturado exitosamente");
            }
            catch (error) {
                return response_util_1.ApiResponse.error(res, error.message || "Error al facturar periodo", error.statusCode || 500);
            }
        });
    }
    obtenerResumenFacturacionMensual(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { año, mes } = req.query;
                const resumen = yield facturacionService.obtenerResumenFacturacionMensual(Number(año), Number(mes));
                return response_util_1.ApiResponse.success(res, resumen, "Resumen de facturación obtenido exitosamente");
            }
            catch (error) {
                return response_util_1.ApiResponse.error(res, error.message || "Error al obtener resumen de facturación", error.statusCode || 500);
            }
        });
    }
    generarPeriodosParaTodosLosClientes(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { año, mes } = req.body;
                const periodos = yield facturacionService.generarPeriodosParaTodosLosClientes(Number(año), Number(mes));
                return response_util_1.ApiResponse.success(res, { total_generados: periodos.length }, "Periodos generados para todos los clientes exitosamente");
            }
            catch (error) {
                return response_util_1.ApiResponse.error(res, error.message || "Error al generar periodos para todos los clientes", error.statusCode || 500);
            }
        });
    }
}
exports.FacturacionController = FacturacionController;
