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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.agregarAreaHistorico = agregarAreaHistorico;
const connection_1 = __importDefault(require("../database/connection"));
const sequelize_1 = require("sequelize");
/**
 * Migración: Agregar columna 'area' a tabla peticiones_historico
 *
 * Esta migración agrega el campo 'area' que faltaba en la tabla
 * peticiones_historico para soportar peticiones de Gestión Administrativa
 */
function agregarAreaHistorico() {
    return __awaiter(this, void 0, void 0, function* () {
        const queryInterface = connection_1.default.getQueryInterface();
        try {
            console.log("🔄 Iniciando migración: Agregar columna 'area' a peticiones_historico");
            // Verificar si la columna ya existe
            const tableDescription = yield queryInterface.describeTable("peticiones_historico");
            if (tableDescription.area) {
                console.log("✅ La columna 'area' ya existe en peticiones_historico");
                return;
            }
            // Agregar columna 'area' con valor por defecto
            yield queryInterface.addColumn("peticiones_historico", "area", {
                type: sequelize_1.DataTypes.ENUM("Pautas", "Diseño", "Gestión Administrativa"),
                allowNull: false,
                defaultValue: "Diseño",
            });
            console.log("✅ Columna 'area' agregada exitosamente a peticiones_historico");
            // Actualizar registros existentes basándose en la categoría
            const result = yield connection_1.default.query(`
      UPDATE peticiones_historico ph
      INNER JOIN categorias c ON ph.categoria_id = c.id
      SET ph.area = c.area_tipo
      WHERE ph.area = 'Diseño'
    `);
            console.log(`✅ Se actualizaron ${result[0].affectedRows || 0} registros con el área correcta`);
            console.log("🎉 Migración completada exitosamente");
        }
        catch (error) {
            console.error("❌ Error en migración agregar-area-historico:", error);
            throw error;
        }
    });
}
// Ejecutar si se llama directamente
if (require.main === module) {
    agregarAreaHistorico()
        .then(() => {
        console.log("✅ Migración ejecutada correctamente");
        process.exit(0);
    })
        .catch((error) => {
        console.error("❌ Error al ejecutar migración:", error);
        process.exit(1);
    });
}
