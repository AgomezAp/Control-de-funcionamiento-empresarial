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
exports.PeticionController = void 0;
const peticion_service_1 = require("../services/peticion.service");
const response_util_1 = require("../utils/response.util");
const peticionService = new peticion_service_1.PeticionService();
class PeticionController {
    crear(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { cliente_id, categoria_id, area, descripcion, descripcion_extra, costo, tiempo_limite_horas, } = req.body;
                const peticion = yield peticionService.crear({
                    cliente_id,
                    categoria_id,
                    area,
                    descripcion,
                    descripcion_extra,
                    costo,
                    tiempo_limite_horas,
                }, req.usuario);
                return response_util_1.ApiResponse.created(res, peticion, "Petición creada exitosamente");
            }
            catch (error) {
                return response_util_1.ApiResponse.error(res, error.message || "Error al crear petición", error.statusCode || 500);
            }
        });
    }
    obtenerTodos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { estado, cliente_id, area } = req.query;
                const filtros = {};
                if (estado)
                    filtros.estado = estado;
                if (cliente_id)
                    filtros.cliente_id = Number(cliente_id);
                if (area)
                    filtros.area = area;
                const peticiones = yield peticionService.obtenerTodos(req.usuario, filtros);
                return response_util_1.ApiResponse.success(res, peticiones, "Peticiones obtenidas exitosamente");
            }
            catch (error) {
                return response_util_1.ApiResponse.error(res, error.message || "Error al obtener peticiones", error.statusCode || 500);
            }
        });
    }
    obtenerPorId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const peticion = yield peticionService.obtenerPorId(Number(id));
                return response_util_1.ApiResponse.success(res, peticion, "Petición obtenida exitosamente");
            }
            catch (error) {
                return response_util_1.ApiResponse.error(res, error.message || "Error al obtener petición", error.statusCode || 500);
            }
        });
    }
    obtenerPendientes(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { area } = req.query;
                const peticiones = yield peticionService.obtenerPendientes(area);
                return response_util_1.ApiResponse.success(res, peticiones, "Peticiones pendientes obtenidas exitosamente");
            }
            catch (error) {
                return response_util_1.ApiResponse.error(res, error.message || "Error al obtener peticiones pendientes", error.statusCode || 500);
            }
        });
    }
    aceptarPeticion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const peticion = yield peticionService.aceptarPeticion(Number(id), req.usuario);
                return response_util_1.ApiResponse.success(res, peticion, "Petición aceptada exitosamente");
            }
            catch (error) {
                return response_util_1.ApiResponse.error(res, error.message || "Error al aceptar petición", error.statusCode || 500);
            }
        });
    }
    cambiarEstado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const { estado } = req.body;
                const peticion = yield peticionService.cambiarEstado(Number(id), estado, req.usuario);
                return response_util_1.ApiResponse.success(res, peticion, `Estado cambiado a ${estado} exitosamente`);
            }
            catch (error) {
                return response_util_1.ApiResponse.error(res, error.message || "Error al cambiar estado", error.statusCode || 500);
            }
        });
    }
    actualizar(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const peticion = yield peticionService.actualizar(Number(id), req.body, req.usuario);
                return response_util_1.ApiResponse.success(res, peticion, "Petición actualizada exitosamente");
            }
            catch (error) {
                return response_util_1.ApiResponse.error(res, error.message || "Error al actualizar petición", error.statusCode || 500);
            }
        });
    }
    obtenerPorClienteYMes(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { cliente_id, año, mes } = req.query;
                const resultado = yield peticionService.obtenerPorClienteYMes(Number(cliente_id), Number(año), Number(mes));
                return response_util_1.ApiResponse.success(res, resultado, "Peticiones del cliente obtenidas exitosamente");
            }
            catch (error) {
                return response_util_1.ApiResponse.error(res, error.message || "Error al obtener peticiones por cliente y mes", error.statusCode || 500);
            }
        });
    }
    obtenerHistorico(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { cliente_id, estado, año, mes } = req.query;
                const filtros = {};
                if (cliente_id)
                    filtros.cliente_id = Number(cliente_id);
                if (estado)
                    filtros.estado = estado;
                if (año)
                    filtros.año = Number(año);
                if (mes)
                    filtros.mes = Number(mes);
                const historico = yield peticionService.obtenerHistorico(filtros, req.usuario);
                return response_util_1.ApiResponse.success(res, historico, "Histórico de peticiones obtenido exitosamente");
            }
            catch (error) {
                return response_util_1.ApiResponse.error(res, error.message || "Error al obtener histórico", error.statusCode || 500);
            }
        });
    }
    obtenerResumenGlobal(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const resumen = yield peticionService.obtenerResumenGlobal();
                return response_util_1.ApiResponse.success(res, resumen, "Resumen global de peticiones obtenido exitosamente");
            }
            catch (error) {
                return response_util_1.ApiResponse.error(res, error.message || "Error al obtener resumen global", error.statusCode || 500);
            }
        });
    }
    // ====== CONTROL DE TEMPORIZADOR ======
    pausarTemporizador(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const peticion = yield peticionService.pausarTemporizador(Number(id), req.usuario);
                return response_util_1.ApiResponse.success(res, peticion, "Temporizador pausado exitosamente");
            }
            catch (error) {
                return response_util_1.ApiResponse.error(res, error.message || "Error al pausar temporizador", error.statusCode || 500);
            }
        });
    }
    reanudarTemporizador(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const peticion = yield peticionService.reanudarTemporizador(Number(id), req.usuario);
                return response_util_1.ApiResponse.success(res, peticion, "Temporizador reanudado exitosamente");
            }
            catch (error) {
                return response_util_1.ApiResponse.error(res, error.message || "Error al reanudar temporizador", error.statusCode || 500);
            }
        });
    }
    obtenerTiempoEmpleado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const tiempoEmpleado = yield peticionService.obtenerTiempoEmpleado(Number(id));
                return response_util_1.ApiResponse.success(res, tiempoEmpleado, "Tiempo empleado obtenido exitosamente");
            }
            catch (error) {
                return response_util_1.ApiResponse.error(res, error.message || "Error al obtener tiempo empleado", error.statusCode || 500);
            }
        });
    }
}
exports.PeticionController = PeticionController;
