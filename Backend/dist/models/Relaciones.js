"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notificacion = exports.EstadisticaUsuario = exports.AuditoriaCambios = exports.PeriodoFacturacion = exports.PeticionHistorico = exports.Peticion = exports.Categoria = exports.Cliente = exports.Area = exports.Role = exports.Usuario = void 0;
const Usuario_1 = __importDefault(require("./Usuario"));
exports.Usuario = Usuario_1.default;
const Role_1 = __importDefault(require("./Role"));
exports.Role = Role_1.default;
const Area_1 = __importDefault(require("./Area"));
exports.Area = Area_1.default;
const Cliente_1 = __importDefault(require("./Cliente"));
exports.Cliente = Cliente_1.default;
const Categoria_1 = __importDefault(require("./Categoria"));
exports.Categoria = Categoria_1.default;
const Peticion_1 = __importDefault(require("./Peticion"));
exports.Peticion = Peticion_1.default;
const PeticionHistorico_1 = __importDefault(require("./PeticionHistorico"));
exports.PeticionHistorico = PeticionHistorico_1.default;
const PeriodoFacturacion_1 = __importDefault(require("./PeriodoFacturacion"));
exports.PeriodoFacturacion = PeriodoFacturacion_1.default;
const AuditoriaCambio_1 = __importDefault(require("./AuditoriaCambio"));
exports.AuditoriaCambios = AuditoriaCambio_1.default;
const EstadisticasUsuario_1 = __importDefault(require("./EstadisticasUsuario"));
exports.EstadisticaUsuario = EstadisticasUsuario_1.default;
const Notificacion_1 = __importDefault(require("./Notificacion"));
exports.Notificacion = Notificacion_1.default;
// ========================================
// RELACIONES DE USUARIO
// ========================================
Usuario_1.default.belongsTo(Role_1.default, { foreignKey: "rol_id", as: "rol" });
Role_1.default.hasMany(Usuario_1.default, { foreignKey: "rol_id", as: "usuarios" });
Usuario_1.default.belongsTo(Area_1.default, { foreignKey: "area_id", as: "area" });
Area_1.default.hasMany(Usuario_1.default, { foreignKey: "area_id", as: "usuarios" });
// ========================================
// RELACIONES DE CLIENTE
// ========================================
Cliente_1.default.belongsTo(Usuario_1.default, {
    foreignKey: "pautador_id",
    as: "pautador",
});
Cliente_1.default.belongsTo(Usuario_1.default, {
    foreignKey: "disenador_id",
    as: "disenador",
});
Usuario_1.default.hasMany(Cliente_1.default, {
    foreignKey: "pautador_id",
    as: "clientes_como_pautador",
});
Usuario_1.default.hasMany(Cliente_1.default, {
    foreignKey: "disenador_id",
    as: "clientes_como_disenador",
});
// ========================================
// RELACIONES DE PETICION
// ========================================
Peticion_1.default.belongsTo(Cliente_1.default, {
    foreignKey: "cliente_id",
    as: "cliente",
});
Peticion_1.default.belongsTo(Categoria_1.default, {
    foreignKey: "categoria_id",
    as: "categoria",
});
Peticion_1.default.belongsTo(Usuario_1.default, {
    foreignKey: "creador_id",
    as: "creador",
});
Peticion_1.default.belongsTo(Usuario_1.default, {
    foreignKey: "asignado_a",
    as: "asignado",
});
Cliente_1.default.hasMany(Peticion_1.default, {
    foreignKey: "cliente_id",
    as: "peticiones",
});
Categoria_1.default.hasMany(Peticion_1.default, {
    foreignKey: "categoria_id",
    as: "peticiones",
});
Usuario_1.default.hasMany(Peticion_1.default, {
    foreignKey: "creador_id",
    as: "peticiones_creadas",
});
Usuario_1.default.hasMany(Peticion_1.default, {
    foreignKey: "asignado_a",
    as: "peticiones_asignadas",
});
// ========================================
// RELACIONES DE PETICION HISTORICO
// ========================================
PeticionHistorico_1.default.belongsTo(Cliente_1.default, {
    foreignKey: "cliente_id",
    as: "cliente",
});
PeticionHistorico_1.default.belongsTo(Categoria_1.default, {
    foreignKey: "categoria_id",
    as: "categoria",
});
PeticionHistorico_1.default.belongsTo(Usuario_1.default, {
    foreignKey: "creador_id",
    as: "creador",
});
PeticionHistorico_1.default.belongsTo(Usuario_1.default, {
    foreignKey: "asignado_a",
    as: "asignado",
});
Cliente_1.default.hasMany(PeticionHistorico_1.default, {
    foreignKey: "cliente_id",
    as: "peticiones_historico",
});
Usuario_1.default.hasMany(PeticionHistorico_1.default, {
    foreignKey: "creador_id",
    as: "peticiones_historico_creadas",
});
Usuario_1.default.hasMany(PeticionHistorico_1.default, {
    foreignKey: "asignado_a",
    as: "peticiones_historico_asignadas",
});
// ========================================
// RELACIONES DE PERIODO FACTURACION
// ========================================
PeriodoFacturacion_1.default.belongsTo(Cliente_1.default, {
    foreignKey: "cliente_id",
    as: "cliente",
});
Cliente_1.default.hasMany(PeriodoFacturacion_1.default, {
    foreignKey: "cliente_id",
    as: "periodos_facturacion",
});
// ========================================
// RELACIONES DE AUDITORIA CAMBIOS
// ========================================
AuditoriaCambio_1.default.belongsTo(Usuario_1.default, {
    foreignKey: "usuario_id",
    as: "usuario",
});
Usuario_1.default.hasMany(AuditoriaCambio_1.default, {
    foreignKey: "usuario_id",
    as: "auditorias",
});
// ========================================
// RELACIONES DE ESTADISTICA USUARIO
// ========================================
EstadisticasUsuario_1.default.belongsTo(Usuario_1.default, {
    foreignKey: "usuario_id",
    as: "usuario",
});
Usuario_1.default.hasMany(EstadisticasUsuario_1.default, {
    foreignKey: "usuario_id",
    as: "estadisticas",
});
// ========================================
// RELACIONES DE NOTIFICACIONES
// ========================================
Notificacion_1.default.belongsTo(Usuario_1.default, {
    foreignKey: "usuario_id",
    as: "usuario",
});
Notificacion_1.default.belongsTo(Peticion_1.default, {
    foreignKey: "peticion_id",
    as: "peticion",
});
Usuario_1.default.hasMany(Notificacion_1.default, {
    foreignKey: "usuario_id",
    as: "notificaciones",
});
Peticion_1.default.hasMany(Notificacion_1.default, {
    foreignKey: "peticion_id",
    as: "notificaciones",
});
