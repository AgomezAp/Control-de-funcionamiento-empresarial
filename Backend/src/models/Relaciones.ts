import Usuario from "./Usuario";
import Role from "./Role";
import Area from "./Area";
import Cliente from "./Cliente";
import Categoria from "./Categoria";
import Peticion from "./Peticion";
import PeticionHistorico from "./PeticionHistorico";
import PeriodoFacturacion from "./PeriodoFacturacion";
import AuditoriaCambios from "./AuditoriaCambio";
import EstadisticaUsuario from "./EstadisticasUsuario";
import Notificacion from "./Notificacion";

// ========================================
// RELACIONES DE USUARIO
// ========================================
Usuario.belongsTo(Role, { foreignKey: "rol_id", as: "rol" });
Role.hasMany(Usuario, { foreignKey: "rol_id", as: "usuarios" });

Usuario.belongsTo(Area, { foreignKey: "area_id", as: "area" });
Area.hasMany(Usuario, { foreignKey: "area_id", as: "usuarios" });

// ========================================
// RELACIONES DE CLIENTE
// ========================================
Cliente.belongsTo(Usuario, {
  foreignKey: "pautador_id",
  as: "pautador",
});

Cliente.belongsTo(Usuario, {
  foreignKey: "disenador_id",
  as: "disenador",
});

Usuario.hasMany(Cliente, {
  foreignKey: "pautador_id",
  as: "clientes_como_pautador",
});

Usuario.hasMany(Cliente, {
  foreignKey: "disenador_id",
  as: "clientes_como_disenador",
});

// ========================================
// RELACIONES DE PETICION
// ========================================
Peticion.belongsTo(Cliente, {
  foreignKey: "cliente_id",
  as: "cliente",
});

Peticion.belongsTo(Categoria, {
  foreignKey: "categoria_id",
  as: "categoria",
});

Peticion.belongsTo(Usuario, {
  foreignKey: "creador_id",
  as: "creador",
});

Peticion.belongsTo(Usuario, {
  foreignKey: "asignado_a",
  as: "asignado",
});

Cliente.hasMany(Peticion, {
  foreignKey: "cliente_id",
  as: "peticiones",
});

Categoria.hasMany(Peticion, {
  foreignKey: "categoria_id",
  as: "peticiones",
});

Usuario.hasMany(Peticion, {
  foreignKey: "creador_id",
  as: "peticiones_creadas",
});

Usuario.hasMany(Peticion, {
  foreignKey: "asignado_a",
  as: "peticiones_asignadas",
});

// ========================================
// RELACIONES DE PETICION HISTORICO
// ========================================
PeticionHistorico.belongsTo(Cliente, {
  foreignKey: "cliente_id",
  as: "cliente",
});

PeticionHistorico.belongsTo(Categoria, {
  foreignKey: "categoria_id",
  as: "categoria",
});

PeticionHistorico.belongsTo(Usuario, {
  foreignKey: "creador_id",
  as: "creador",
});

PeticionHistorico.belongsTo(Usuario, {
  foreignKey: "asignado_a",
  as: "asignado",
});

Cliente.hasMany(PeticionHistorico, {
  foreignKey: "cliente_id",
  as: "peticiones_historico",
});

Usuario.hasMany(PeticionHistorico, {
  foreignKey: "creador_id",
  as: "peticiones_historico_creadas",
});

Usuario.hasMany(PeticionHistorico, {
  foreignKey: "asignado_a",
  as: "peticiones_historico_asignadas",
});

// ========================================
// RELACIONES DE PERIODO FACTURACION
// ========================================
PeriodoFacturacion.belongsTo(Cliente, {
  foreignKey: "cliente_id",
  as: "cliente",
});

Cliente.hasMany(PeriodoFacturacion, {
  foreignKey: "cliente_id",
  as: "periodos_facturacion",
});

// ========================================
// RELACIONES DE AUDITORIA CAMBIOS
// ========================================
AuditoriaCambios.belongsTo(Usuario, {
  foreignKey: "usuario_id",
  as: "usuario",
});

Usuario.hasMany(AuditoriaCambios, {
  foreignKey: "usuario_id",
  as: "auditorias",
});

// ========================================
// RELACIONES DE ESTADISTICA USUARIO
// ========================================
EstadisticaUsuario.belongsTo(Usuario, {
  foreignKey: "usuario_id",
  as: "usuario",
});

Usuario.hasMany(EstadisticaUsuario, {
  foreignKey: "usuario_id",
  as: "estadisticas",
});

// ========================================
// RELACIONES DE NOTIFICACIONES
// ========================================
Notificacion.belongsTo(Usuario, {
  foreignKey: "usuario_id",
  as: "usuario",
});

Notificacion.belongsTo(Peticion, {
  foreignKey: "peticion_id",
  as: "peticion",
});

Usuario.hasMany(Notificacion, {
  foreignKey: "usuario_id",
  as: "notificaciones",
});

Peticion.hasMany(Notificacion, {
  foreignKey: "peticion_id",
  as: "notificaciones",
});

// ========================================
// EXPORTAR TODOS LOS MODELOS
// ========================================
export {
  Usuario,
  Role,
  Area,
  Cliente,
  Categoria,
  Peticion,
  PeticionHistorico,
  PeriodoFacturacion,
  AuditoriaCambios,
  EstadisticaUsuario,
  Notificacion,
};