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
const connection_1 = __importDefault(require("../database/connection"));
const Categoria_1 = __importDefault(require("../models/Categoria"));
require("../models/Relaciones");
/**
 * Script para actualizar SOLO las categorías de Gestión Administrativa
 * estableciendo su costo en 0
 */
function actualizarCategoriasGA() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log("🔄 Actualizando categorías de Gestión Administrativa...");
            yield connection_1.default.authenticate();
            console.log("✅ Conectado a la base de datos");
            // Actualizar TODAS las categorías de Gestión Administrativa para que tengan costo 0
            const [affectedCount] = yield Categoria_1.default.update({ costo: 0 }, {
                where: {
                    area_tipo: "Gestión Administrativa",
                },
            });
            console.log(`✅ Se actualizaron ${affectedCount} categorías de Gestión Administrativa`);
            console.log("   Todas las categorías de GA ahora tienen costo: $0");
            // Mostrar las categorías actualizadas
            const categoriasGA = yield Categoria_1.default.findAll({
                where: { area_tipo: "Gestión Administrativa" },
                attributes: ["id", "nombre", "costo", "area_tipo"],
                order: [["nombre", "ASC"]],
            });
            console.log("\n📋 Categorías de Gestión Administrativa:");
            categoriasGA.forEach((cat) => {
                console.log(`   • ${cat.nombre} - Costo: $${cat.costo}`);
            });
            yield connection_1.default.close();
            console.log("\n✅ Actualización completada exitosamente");
            process.exit(0);
        }
        catch (error) {
            console.error("❌ Error al actualizar categorías:", error);
            yield connection_1.default.close();
            process.exit(1);
        }
    });
}
// Ejecutar el script
actualizarCategoriasGA();
