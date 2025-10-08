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
exports.EstadisticaController = void 0;
const estadistica_service_1 = require("../services/estadistica.service");
const response_util_1 = require("../utils/response.util");
const estadisticaService = new estadistica_service_1.EstadisticaService();
class EstadisticaController {
    calcularEstadisticasUsuario(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { usuario_id, año, mes } = req.body;
                const estadisticas = yield estadisticaService.calcularEstadisticasUsuario(Number(usuario_id), Number(año), Number(mes));
                return response_util_1.ApiResponse.success(res, estadisticas, "Estadísticas calculadas exitosamente");
            }
            catch (error) {
                return response_util_1.ApiResponse.error(res, error.message || "Error al calcular estadísticas", error.statusCode || 500);
            }
        });
    }
    obtenerEstadisticasUsuario(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { usuario_id } = req.params;
                const { año, mes } = req.query;
                const estadisticas = yield estadisticaService.obtenerEstadisticasUsuario(Number(usuario_id), año ? Number(año) : undefined, mes ? Number(mes) : undefined);
                return response_util_1.ApiResponse.success(res, estadisticas, "Estadísticas obtenidas exitosamente");
            }
            catch (error) {
                return response_util_1.ApiResponse.error(res, error.message || "Error al obtener estadísticas", error.statusCode || 500);
            }
        });
    }
    obtenerEstadisticasPorArea(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { area } = req.params;
                const { año, mes } = req.query;
                const estadisticas = yield estadisticaService.obtenerEstadisticasPorArea(area, Number(año), Number(mes));
                return response_util_1.ApiResponse.success(res, estadisticas, `Estadísticas del área ${area} obtenidas exitosamente`);
            }
            catch (error) {
                return response_util_1.ApiResponse.error(res, error.message || "Error al obtener estadísticas por área", error.statusCode || 500);
            }
        });
    }
    obtenerEstadisticasGlobales(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { año, mes } = req.query;
                const estadisticas = yield estadisticaService.obtenerEstadisticasGlobales(Number(año), Number(mes));
                return response_util_1.ApiResponse.success(res, estadisticas, "Estadísticas globales obtenidas exitosamente");
            }
            catch (error) {
                return response_util_1.ApiResponse.error(res, error.message || "Error al obtener estadísticas globales", error.statusCode || 500);
            }
        });
    }
    recalcularTodasEstadisticas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { año, mes } = req.body;
                const estadisticas = yield estadisticaService.recalcularTodasEstadisticas(Number(año), Number(mes));
                return response_util_1.ApiResponse.success(res, { total_recalculadas: estadisticas.length }, "Estadísticas recalculadas exitosamente");
            }
            catch (error) {
                return response_util_1.ApiResponse.error(res, error.message || "Error al recalcular estadísticas", error.statusCode || 500);
            }
        });
    }
    obtenerMisEstadisticas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { año, mes } = req.query;
                const estadisticas = yield estadisticaService.obtenerEstadisticasUsuario(req.usuario.uid, año ? Number(año) : undefined, mes ? Number(mes) : undefined);
                return response_util_1.ApiResponse.success(res, estadisticas, "Tus estadísticas obtenidas exitosamente");
            }
            catch (error) {
                return response_util_1.ApiResponse.error(res, error.message || "Error al obtener tus estadísticas", error.statusCode || 500);
            }
        });
    }
}
exports.EstadisticaController = EstadisticaController;
