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
exports.ClienteController = void 0;
const cliente_service_1 = require("../services/cliente.service");
const response_util_1 = require("../utils/response.util");
const clienteService = new cliente_service_1.ClienteService();
class ClienteController {
    crear(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nombre, pais, pautador_id, disenador_id, fecha_inicio } = req.body;
                const cliente = yield clienteService.crear({
                    nombre,
                    pais,
                    pautador_id,
                    disenador_id,
                    fecha_inicio: new Date(fecha_inicio),
                }, req.usuario);
                return response_util_1.ApiResponse.created(res, cliente, "Cliente creado exitosamente");
            }
            catch (error) {
                return response_util_1.ApiResponse.error(res, error.message || "Error al crear cliente", error.statusCode || 500);
            }
        });
    }
    obtenerTodos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const clientes = yield clienteService.obtenerTodos(req.usuario);
                return response_util_1.ApiResponse.success(res, clientes, "Clientes obtenidos exitosamente");
            }
            catch (error) {
                return response_util_1.ApiResponse.error(res, error.message || "Error al obtener clientes", error.statusCode || 500);
            }
        });
    }
    obtenerPorId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const cliente = yield clienteService.obtenerPorId(Number(id), req.usuario);
                return response_util_1.ApiResponse.success(res, cliente, "Cliente obtenido exitosamente");
            }
            catch (error) {
                return response_util_1.ApiResponse.error(res, error.message || "Error al obtener cliente", error.statusCode || 500);
            }
        });
    }
    actualizar(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const cliente = yield clienteService.actualizar(Number(id), req.body, req.usuario);
                return response_util_1.ApiResponse.success(res, cliente, "Cliente actualizado exitosamente");
            }
            catch (error) {
                return response_util_1.ApiResponse.error(res, error.message || "Error al actualizar cliente", error.statusCode || 500);
            }
        });
    }
    desactivar(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const cliente = yield clienteService.desactivar(Number(id), req.usuario);
                return response_util_1.ApiResponse.success(res, cliente, "Cliente desactivado exitosamente");
            }
            catch (error) {
                return response_util_1.ApiResponse.error(res, error.message || "Error al desactivar cliente", error.statusCode || 500);
            }
        });
    }
}
exports.ClienteController = ClienteController;
