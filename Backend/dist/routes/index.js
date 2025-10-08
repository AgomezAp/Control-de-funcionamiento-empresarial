"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const usuario_routes_1 = __importDefault(require("./usuario.routes"));
const cliente_routes_1 = __importDefault(require("./cliente.routes"));
const peticion_routes_1 = __importDefault(require("./peticion.routes"));
const estadistica_routes_1 = __importDefault(require("./estadistica.routes"));
const facturacion_routes_1 = __importDefault(require("./facturacion.routes"));
const router = (0, express_1.Router)();
// Definir todas las rutas
router.use("/auth", auth_routes_1.default);
router.use("/usuarios", usuario_routes_1.default);
router.use("/clientes", cliente_routes_1.default);
router.use("/peticiones", peticion_routes_1.default);
router.use("/estadisticas", estadistica_routes_1.default);
router.use("/facturacion", facturacion_routes_1.default);
exports.default = router;
