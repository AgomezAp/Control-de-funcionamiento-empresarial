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
const Role_1 = __importDefault(require("../models/Role"));
const Area_1 = __importDefault(require("../models/Area"));
const Categoria_1 = __importDefault(require("../models/Categoria"));
require("../models/Relaciones"); // Importar relaciones
function initData() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield connection_1.default.authenticate();
            console.log("✅ Conectado a la base de datos");
            // Sincronizar modelos
            yield connection_1.default.sync({ alter: false }); // force: true elimina tablas existentes
            console.log("✅ Tablas sincronizadas");
            // Crear roles
            console.log("📝 Creando roles...");
            const roles = [
                { nombre: "Admin", descripcion: "Acceso total al sistema" },
                { nombre: "Directivo", descripcion: "Gestión de su área" },
                { nombre: "Líder", descripcion: "Supervisión de equipo" },
                { nombre: "Usuario", descripcion: "Usuario estándar" },
            ];
            for (const rol of roles) {
                yield Role_1.default.findOrCreate({
                    where: { nombre: rol.nombre },
                    defaults: rol,
                });
            }
            console.log("✅ Roles creados");
            // Crear áreas
            console.log("📝 Creando áreas...");
            const areas = [
                { nombre: "Gestión Administrativa", descripcion: "Área administrativa" },
                { nombre: "Pautas", descripcion: "Gestión de pautas publicitarias" },
                { nombre: "Diseño", descripcion: "Diseño gráfico y web" },
                { nombre: "Contabilidad", descripcion: "Gestión contable" },
                { nombre: "Programación", descripcion: "Desarrollo de software" },
            ];
            for (const area of areas) {
                yield Area_1.default.findOrCreate({
                    where: { nombre: area.nombre },
                    defaults: area,
                });
            }
            console.log("✅ Áreas creadas");
            // Crear categorías de Diseño
            console.log("📝 Creando categorías de Diseño...");
            const categoriasDiseño = [
                {
                    nombre: "Creación de subpestaña",
                    area_tipo: "Diseño",
                    costo: 66000,
                    es_variable: false,
                    requiere_descripcion_extra: false,
                },
                {
                    nombre: "Ajuste de copy",
                    area_tipo: "Diseño",
                    costo: 64000,
                    es_variable: false,
                    requiere_descripcion_extra: false,
                },
                {
                    nombre: "Cambio de copy",
                    area_tipo: "Diseño",
                    costo: 128000,
                    es_variable: false,
                    requiere_descripcion_extra: false,
                },
                {
                    nombre: "Fase 1 (color y tipografía)",
                    area_tipo: "Diseño",
                    costo: 104000,
                    es_variable: false,
                    requiere_descripcion_extra: false,
                },
                {
                    nombre: "Fase 2 (diagramación e imágenes)",
                    area_tipo: "Diseño",
                    costo: 144000,
                    es_variable: false,
                    requiere_descripcion_extra: false,
                },
                {
                    nombre: "Fase 3 (Rediseño)",
                    area_tipo: "Diseño",
                    costo: 288000,
                    es_variable: false,
                    requiere_descripcion_extra: false,
                },
                {
                    nombre: "Ajuste de diseño",
                    area_tipo: "Diseño",
                    costo: 80000,
                    es_variable: false,
                    requiere_descripcion_extra: false,
                },
                {
                    nombre: "Migración",
                    area_tipo: "Diseño",
                    costo: 64000,
                    es_variable: false,
                    requiere_descripcion_extra: false,
                },
                {
                    nombre: "Creación de sitio web",
                    area_tipo: "Diseño",
                    costo: 600000,
                    es_variable: false,
                    requiere_descripcion_extra: false,
                },
                {
                    nombre: "Cambio de número",
                    area_tipo: "Diseño",
                    costo: 10000,
                    es_variable: false,
                    requiere_descripcion_extra: false,
                },
                {
                    nombre: "Cambio de nombre",
                    area_tipo: "Diseño",
                    costo: 85000,
                    es_variable: false,
                    requiere_descripcion_extra: false,
                },
                {
                    nombre: "Modelado 3D",
                    area_tipo: "Diseño",
                    costo: 0,
                    es_variable: true,
                    requiere_descripcion_extra: false,
                },
                {
                    nombre: "Creación de pieza publicitaria",
                    area_tipo: "Diseño",
                    costo: 30000,
                    es_variable: false,
                    requiere_descripcion_extra: false,
                },
                {
                    nombre: "Ajuste de pieza publicitaria",
                    area_tipo: "Diseño",
                    costo: 15000,
                    es_variable: false,
                    requiere_descripcion_extra: false,
                },
                {
                    nombre: "Copia de seguridad",
                    area_tipo: "Diseño",
                    costo: 20000,
                    es_variable: false,
                    requiere_descripcion_extra: false,
                },
                {
                    nombre: "Barrido por diseño",
                    area_tipo: "Diseño",
                    costo: 15000,
                    es_variable: false,
                    requiere_descripcion_extra: false,
                },
                {
                    nombre: "Limpieza de caché",
                    area_tipo: "Diseño",
                    costo: 5000,
                    es_variable: false,
                    requiere_descripcion_extra: false,
                },
                {
                    nombre: "Descarga de imágenes",
                    area_tipo: "Diseño",
                    costo: 32000,
                    es_variable: false,
                    requiere_descripcion_extra: false,
                },
            ];
            for (const cat of categoriasDiseño) {
                yield Categoria_1.default.findOrCreate({
                    where: { nombre: cat.nombre },
                    defaults: cat,
                });
            }
            // Crear categorías de Pautas
            console.log("📝 Creando categorías de Pautas...");
            const categoriasPautas = [
                {
                    nombre: "Barrido web (revisión)",
                    area_tipo: "Pautas",
                    costo: 7000,
                    es_variable: false,
                    requiere_descripcion_extra: false,
                },
                {
                    nombre: "Barrido Ads (revisión)",
                    area_tipo: "Pautas",
                    costo: 7000,
                    es_variable: false,
                    requiere_descripcion_extra: false,
                },
                {
                    nombre: "Creación de campaña",
                    area_tipo: "Pautas",
                    costo: 90000,
                    es_variable: false,
                    requiere_descripcion_extra: false,
                },
                {
                    nombre: "Ajuste de campaña",
                    area_tipo: "Pautas",
                    costo: 36000,
                    es_variable: false,
                    requiere_descripcion_extra: false,
                },
                {
                    nombre: "Palabras Clave (ajustes)",
                    area_tipo: "Pautas",
                    costo: 36000,
                    es_variable: false,
                    requiere_descripcion_extra: false,
                },
                {
                    nombre: "Palabras clave (Barrido)",
                    area_tipo: "Pautas",
                    costo: 18000,
                    es_variable: false,
                    requiere_descripcion_extra: false,
                },
                {
                    nombre: "Estrategias de seguimiento",
                    area_tipo: "Pautas",
                    costo: 72000,
                    es_variable: false,
                    requiere_descripcion_extra: true,
                },
                {
                    nombre: "Ajuste de presupuesto",
                    area_tipo: "Pautas",
                    costo: 72000,
                    es_variable: false,
                    requiere_descripcion_extra: false,
                },
                {
                    nombre: "Creación de anuncio",
                    area_tipo: "Pautas",
                    costo: 72000,
                    es_variable: false,
                    requiere_descripcion_extra: false,
                },
                {
                    nombre: "Ajuste de anuncio",
                    area_tipo: "Pautas",
                    costo: 36000,
                    es_variable: false,
                    requiere_descripcion_extra: false,
                },
                {
                    nombre: "Etiquetas de conversión",
                    area_tipo: "Pautas",
                    costo: 18000,
                    es_variable: false,
                    requiere_descripcion_extra: false,
                },
                {
                    nombre: "Verificación de anunciante",
                    area_tipo: "Pautas",
                    costo: 18000,
                    es_variable: false,
                    requiere_descripcion_extra: false,
                },
                {
                    nombre: "Apelación",
                    area_tipo: "Pautas",
                    costo: 18000,
                    es_variable: false,
                    requiere_descripcion_extra: false,
                },
            ];
            for (const cat of categoriasPautas) {
                yield Categoria_1.default.findOrCreate({
                    where: { nombre: cat.nombre },
                    defaults: cat,
                });
            }
            console.log("✅ Categorías creadas");
            console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            console.log("✅ Datos iniciales cargados correctamente");
            console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            console.log("");
            console.log("📊 Resumen:");
            console.log(`   - ${roles.length} Roles`);
            console.log(`   - ${areas.length} Áreas`);
            console.log(`   - ${categoriasDiseño.length} Categorías de Diseño`);
            console.log(`   - ${categoriasPautas.length} Categorías de Pautas`);
            console.log("");
            console.log("🎉 ¡Listo! Ya puedes empezar a usar la aplicación");
            process.exit(0);
        }
        catch (error) {
            console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            console.error("❌ Error al inicializar datos:");
            console.error(error);
            console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            process.exit(1);
        }
    });
}
// Ejecutar función
initData();
