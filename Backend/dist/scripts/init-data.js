"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const Usuario_1 = __importDefault(require("../models/Usuario"));
const Cliente_1 = __importDefault(require("../models/Cliente"));
const Peticion_1 = __importDefault(require("../models/Peticion"));
const ReporteCliente_1 = __importStar(require("../models/ReporteCliente"));
require("../models/Relaciones"); // Importar relaciones
const bcrypt_1 = __importDefault(require("bcrypt"));
function initData() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield connection_1.default.authenticate();
            console.log("✅ Conectado a la base de datos");
            // Sincronizar modelos
            yield connection_1.default.sync({ force: true }); // force: true para empezar desde cero
            console.log("✅ Tablas sincronizadas");
            // Crear roles
            console.log("📝 Creando roles...");
            const roles = [
                { nombre: "Admin", descripcion: "Acceso total al sistema" },
                { nombre: "Directivo", descripcion: "Gestión de su área" },
                { nombre: "Líder", descripcion: "Supervisión de equipo" },
                { nombre: "Usuario", descripcion: "Usuario estándar" },
            ];
            const rolesCreados = {};
            for (const rol of roles) {
                const [roleCreado] = yield Role_1.default.findOrCreate({
                    where: { nombre: rol.nombre },
                    defaults: rol,
                });
                rolesCreados[rol.nombre] = roleCreado;
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
            const areasCreadas = {};
            for (const area of areas) {
                const [areaCreada] = yield Area_1.default.findOrCreate({
                    where: { nombre: area.nombre },
                    defaults: area,
                });
                areasCreadas[area.nombre] = areaCreada;
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
            // Crear categorías de Gestión Administrativa
            console.log("📝 Creando categorías de Gestión Administrativa...");
            const categoriasGestionAdmin = [
                {
                    nombre: "Reporte de problema - Cliente",
                    area_tipo: "Gestión Administrativa",
                    costo: 0,
                    es_variable: false,
                    requiere_descripcion_extra: true,
                },
                {
                    nombre: "Solicitud de soporte técnico",
                    area_tipo: "Gestión Administrativa",
                    costo: 0,
                    es_variable: false,
                    requiere_descripcion_extra: true,
                },
                {
                    nombre: "Incidencia con campaña",
                    area_tipo: "Gestión Administrativa",
                    costo: 0,
                    es_variable: false,
                    requiere_descripcion_extra: true,
                },
                {
                    nombre: "Problema con diseño web",
                    area_tipo: "Gestión Administrativa",
                    costo: 0,
                    es_variable: false,
                    requiere_descripcion_extra: true,
                },
                {
                    nombre: "Consulta general del cliente",
                    area_tipo: "Gestión Administrativa",
                    costo: 0,
                    es_variable: false,
                    requiere_descripcion_extra: true,
                },
                {
                    nombre: "Seguimiento de solicitud",
                    area_tipo: "Gestión Administrativa",
                    costo: 0,
                    es_variable: false,
                    requiere_descripcion_extra: true,
                },
                {
                    nombre: "Escalamiento de caso",
                    area_tipo: "Gestión Administrativa",
                    costo: 0,
                    es_variable: false,
                    requiere_descripcion_extra: true,
                },
                {
                    nombre: "Otro - Especificar",
                    area_tipo: "Gestión Administrativa",
                    costo: 0,
                    es_variable: false,
                    requiere_descripcion_extra: true,
                },
            ];
            for (const cat of categoriasGestionAdmin) {
                yield Categoria_1.default.findOrCreate({
                    where: { nombre: cat.nombre },
                    defaults: cat,
                });
            }
            console.log("✅ Categorías de Gestión Administrativa creadas");
            // Crear usuarios de prueba
            console.log("📝 Creando usuarios de prueba...");
            const passwordHash = yield bcrypt_1.default.hash("123456", 10);
            const usuarios = [
                {
                    nombre_completo: "Admin Principal",
                    correo: "admin@empresa.com",
                    contrasena: passwordHash,
                    rol_id: rolesCreados.Admin.id,
                    area_id: areasCreadas["Diseño"].id,
                    status: true,
                    estado_presencia: "Activo",
                    ultima_actividad: new Date(),
                },
                {
                    nombre_completo: "Juan Pérez - Pautador",
                    correo: "juan.pautas@empresa.com",
                    contrasena: passwordHash,
                    rol_id: rolesCreados.Usuario.id,
                    area_id: areasCreadas.Pautas.id,
                    status: true,
                    estado_presencia: "Activo",
                    ultima_actividad: new Date(),
                },
                {
                    nombre_completo: "María García - Pautadora",
                    correo: "maria.pautas@empresa.com",
                    contrasena: passwordHash,
                    rol_id: rolesCreados.Usuario.id,
                    area_id: areasCreadas.Pautas.id,
                    status: true,
                    estado_presencia: "Activo",
                    ultima_actividad: new Date(),
                },
                {
                    nombre_completo: "Carlos López - Diseñador",
                    correo: "carlos.diseno@empresa.com",
                    contrasena: passwordHash,
                    rol_id: rolesCreados.Usuario.id,
                    area_id: areasCreadas.Diseño.id,
                    status: true,
                    estado_presencia: "Activo",
                    ultima_actividad: new Date(),
                },
                {
                    nombre_completo: "Ana Martínez - Diseñadora",
                    correo: "ana.diseno@empresa.com",
                    contrasena: passwordHash,
                    rol_id: rolesCreados.Usuario.id,
                    area_id: areasCreadas.Diseño.id,
                    status: true,
                    estado_presencia: "Activo",
                    ultima_actividad: new Date(),
                },
                {
                    nombre_completo: "Luis Rodríguez - Líder Pautas",
                    correo: "luis.lider@empresa.com",
                    contrasena: passwordHash,
                    rol_id: rolesCreados.Líder.id,
                    area_id: areasCreadas.Pautas.id,
                    status: true,
                    estado_presencia: "Activo",
                    ultima_actividad: new Date(),
                },
                {
                    nombre_completo: "Roberto Fernández - Directivo",
                    correo: "roberto.directivo@empresa.com",
                    contrasena: passwordHash,
                    rol_id: rolesCreados.Directivo.id,
                    area_id: areasCreadas["Pautas"].id,
                    status: true,
                    estado_presencia: "Activo",
                    ultima_actividad: new Date(),
                },
                {
                    nombre_completo: "Laura Gómez - Gestión Administrativa",
                    correo: "laura.admin@empresa.com",
                    contrasena: passwordHash,
                    rol_id: rolesCreados.Usuario.id,
                    area_id: areasCreadas["Gestión Administrativa"].id,
                    status: true,
                    estado_presencia: "Activo",
                    ultima_actividad: new Date(),
                },
            ];
            const usuariosCreados = [];
            for (const usuario of usuarios) {
                const usuarioCreado = yield Usuario_1.default.create(usuario);
                usuariosCreados.push(usuarioCreado);
            }
            console.log("✅ Usuarios creados");
            // Obtener usuarios específicos para asignación
            const pautador1 = usuariosCreados[1]; // Juan Pérez
            const pautador2 = usuariosCreados[2]; // María García
            const disenador1 = usuariosCreados[3]; // Carlos López
            const disenador2 = usuariosCreados[4]; // Ana Martínez
            const lider = usuariosCreados[5]; // Luis Rodríguez
            const directivo = usuariosCreados[6]; // Roberto Fernández
            const admin = usuariosCreados[0];
            const gestionAdmin = usuariosCreados[7]; // Laura Gómez
            // Crear clientes de prueba
            console.log("📝 Creando clientes de prueba...");
            const clientes = [
                {
                    nombre: "Empresa Tech Solutions",
                    cedula: "900123456-7",
                    tipo_persona: "Jurídica",
                    telefono: "+57 301-1234567",
                    correo: "info@techsolutions.com.co",
                    ciudad: "Medellín",
                    direccion: "Carrera 43A #14-87, Edificio Centro Empresarial",
                    pais: "Colombia",
                    tipo_cliente: "Meta Ads",
                    pautador_id: pautador1.uid,
                    disenador_id: disenador1.uid,
                    fecha_inicio: new Date("2024-01-15"),
                    status: true,
                },
                {
                    nombre: "Comercial El Progreso",
                    cedula: "MEX987654321",
                    tipo_persona: "Jurídica",
                    telefono: "+52 55-1234-5678",
                    correo: "ventas@elprogreso.mx",
                    ciudad: "Ciudad de México",
                    direccion: "Av. Insurgentes Sur 1234, Col. Del Valle",
                    pais: "México",
                    tipo_cliente: "Google Ads",
                    pautador_id: pautador2.uid,
                    disenador_id: disenador2.uid,
                    fecha_inicio: new Date("2024-02-20"),
                    status: true,
                },
                {
                    nombre: "Restaurante La Buena Mesa",
                    cedula: "900234567-8",
                    tipo_persona: "Jurídica",
                    telefono: "+57 310-7654321",
                    correo: "contacto@labuenamesa.co",
                    ciudad: "Bogotá",
                    direccion: "Calle 85 #15-20, Zona Rosa",
                    pais: "Colombia",
                    tipo_cliente: "Meta Ads",
                    pautador_id: pautador1.uid,
                    disenador_id: disenador1.uid,
                    fecha_inicio: new Date("2024-03-10"),
                    status: true,
                },
                {
                    nombre: "Tienda Fashion Style",
                    cedula: "B12345678",
                    tipo_persona: "Jurídica",
                    telefono: "+34 612-987654",
                    correo: "tienda@fashionstyle.es",
                    ciudad: "Madrid",
                    direccion: "Gran Vía 28, 2º piso",
                    pais: "España",
                    tipo_cliente: "Google Ads",
                    pautador_id: pautador2.uid,
                    disenador_id: disenador2.uid,
                    fecha_inicio: new Date("2024-04-05"),
                    status: true,
                },
                {
                    nombre: "Consultora Legal Asociados",
                    cedula: "20-30567891-4",
                    tipo_persona: "Jurídica",
                    telefono: "+54 11-5678-9012",
                    correo: "info@legalasociados.com.ar",
                    ciudad: "Buenos Aires",
                    direccion: "Av. Corrientes 1500, Piso 10",
                    pais: "Argentina",
                    tipo_cliente: "Externo",
                    pautador_id: pautador1.uid,
                    disenador_id: disenador1.uid,
                    fecha_inicio: new Date("2024-05-12"),
                    status: true,
                },
            ];
            const clientesCreados = [];
            for (const cliente of clientes) {
                const clienteCreado = yield Cliente_1.default.create(cliente);
                clientesCreados.push(clienteCreado);
            }
            console.log("✅ Clientes creados");
            // Obtener categorías para crear peticiones
            const categoriaPautas1 = yield Categoria_1.default.findOne({ where: { nombre: "Creación de campaña" } });
            const categoriaPautas2 = yield Categoria_1.default.findOne({ where: { nombre: "Ajuste de campaña" } });
            const categoriaPautas3 = yield Categoria_1.default.findOne({ where: { nombre: "Barrido Ads (revisión)" } });
            const categoriaDiseño1 = yield Categoria_1.default.findOne({ where: { nombre: "Creación de pieza publicitaria" } });
            const categoriaDiseño2 = yield Categoria_1.default.findOne({ where: { nombre: "Ajuste de diseño" } });
            const categoriaDiseño3 = yield Categoria_1.default.findOne({ where: { nombre: "Fase 1 (color y tipografía)" } });
            // Crear peticiones de prueba
            console.log("📝 Creando peticiones de prueba...");
            const ahora = new Date();
            const hace2Horas = new Date(ahora.getTime() - 2 * 60 * 60 * 1000);
            const hace5Horas = new Date(ahora.getTime() - 5 * 60 * 60 * 1000);
            const ayer = new Date(ahora.getTime() - 24 * 60 * 60 * 1000);
            const peticiones = [
                // Peticiones de Pautas (auto-asignadas y en progreso)
                {
                    cliente_id: clientesCreados[0].id,
                    categoria_id: categoriaPautas1.id,
                    area: "Pautas",
                    descripcion: "Crear campaña de lanzamiento para nuevo producto de tecnología",
                    costo: categoriaPautas1.costo,
                    estado: "En Progreso",
                    creador_id: admin.uid,
                    asignado_a: pautador1.uid,
                    fecha_aceptacion: hace5Horas,
                    tiempo_empleado_segundos: 18000, // 5 horas
                    temporizador_activo: true,
                    fecha_inicio_temporizador: hace5Horas,
                },
                {
                    cliente_id: clientesCreados[1].id,
                    categoria_id: categoriaPautas2.id,
                    area: "Pautas",
                    descripcion: "Ajustar campaña existente para mejorar CTR en anuncios de Google",
                    costo: categoriaPautas2.costo,
                    estado: "En Progreso",
                    creador_id: admin.uid,
                    asignado_a: pautador2.uid,
                    fecha_aceptacion: hace2Horas,
                    tiempo_empleado_segundos: 7200, // 2 horas
                    temporizador_activo: true,
                    fecha_inicio_temporizador: hace2Horas,
                },
                {
                    cliente_id: clientesCreados[2].id,
                    categoria_id: categoriaPautas3.id,
                    area: "Pautas",
                    descripcion: "Realizar barrido de anuncios para verificar rendimiento semanal",
                    costo: categoriaPautas3.costo,
                    estado: "Resuelta",
                    creador_id: admin.uid,
                    asignado_a: pautador1.uid,
                    fecha_aceptacion: ayer,
                    fecha_resolucion: new Date(ayer.getTime() + 1 * 60 * 60 * 1000),
                    tiempo_empleado_segundos: 3600, // 1 hora
                    temporizador_activo: false,
                },
                // Peticiones de Diseño (pendientes y en progreso)
                {
                    cliente_id: clientesCreados[0].id,
                    categoria_id: categoriaDiseño1.id,
                    area: "Diseño",
                    descripcion: "Diseñar pieza publicitaria para campaña de redes sociales - Incluir logo y colores corporativos",
                    costo: categoriaDiseño1.costo,
                    estado: "Pendiente",
                    creador_id: admin.uid,
                    tiempo_empleado_segundos: 0,
                    temporizador_activo: false,
                },
                {
                    cliente_id: clientesCreados[3].id,
                    categoria_id: categoriaDiseño2.id,
                    area: "Diseño",
                    descripcion: "Ajustar diseño de landing page según feedback del cliente - Cambiar paleta de colores",
                    costo: categoriaDiseño2.costo,
                    estado: "En Progreso",
                    creador_id: admin.uid,
                    asignado_a: disenador2.uid,
                    fecha_aceptacion: hace2Horas,
                    tiempo_empleado_segundos: 7200, // 2 horas
                    temporizador_activo: true,
                    fecha_inicio_temporizador: hace2Horas,
                },
                {
                    cliente_id: clientesCreados[4].id,
                    categoria_id: categoriaDiseño3.id,
                    area: "Diseño",
                    descripcion: "Desarrollar identidad visual para consultora legal - Primera fase con colores y tipografía",
                    costo: categoriaDiseño3.costo,
                    estado: "Pendiente",
                    creador_id: admin.uid,
                    tiempo_empleado_segundos: 0,
                    temporizador_activo: false,
                },
                {
                    cliente_id: clientesCreados[1].id,
                    categoria_id: categoriaDiseño1.id,
                    area: "Diseño",
                    descripcion: "Crear banners para promoción de temporada - 3 tamaños diferentes",
                    costo: categoriaDiseño1.costo,
                    estado: "Resuelta",
                    creador_id: admin.uid,
                    asignado_a: disenador1.uid,
                    fecha_aceptacion: ayer,
                    fecha_resolucion: new Date(ayer.getTime() + 4 * 60 * 60 * 1000),
                    tiempo_empleado_segundos: 14400, // 4 horas
                    temporizador_activo: false,
                },
                {
                    cliente_id: clientesCreados[2].id,
                    categoria_id: categoriaPautas1.id,
                    area: "Pautas",
                    descripcion: "Configurar nueva campaña para restaurante con segmentación por ubicación geográfica",
                    costo: categoriaPautas1.costo,
                    estado: "Resuelta",
                    creador_id: admin.uid,
                    asignado_a: pautador1.uid,
                    fecha_aceptacion: new Date(ahora.getTime() - 3 * 24 * 60 * 60 * 1000),
                    fecha_resolucion: new Date(ahora.getTime() - 3 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000),
                    tiempo_empleado_segundos: 21600, // 6 horas
                    temporizador_activo: false,
                },
                // ✅ Peticiones PAUSADAS para probar KPI de Dashboard Admin
                {
                    cliente_id: clientesCreados[0].id,
                    categoria_id: categoriaPautas2.id,
                    area: "Pautas",
                    descripcion: "Optimización de palabras clave - Esperando feedback del cliente",
                    costo: categoriaPautas2.costo,
                    estado: "Pausada",
                    creador_id: admin.uid,
                    asignado_a: pautador2.uid,
                    fecha_aceptacion: new Date(ahora.getTime() - 2 * 24 * 60 * 60 * 1000),
                    tiempo_empleado_segundos: 5400, // 1.5 horas antes de pausar
                    temporizador_activo: false,
                },
                {
                    cliente_id: clientesCreados[3].id,
                    categoria_id: categoriaDiseño1.id,
                    area: "Diseño",
                    descripcion: "Diseño de catálogo digital - Cliente no ha enviado contenido",
                    costo: categoriaDiseño1.costo,
                    estado: "Pausada",
                    creador_id: admin.uid,
                    asignado_a: disenador1.uid,
                    fecha_aceptacion: new Date(ahora.getTime() - 4 * 24 * 60 * 60 * 1000),
                    tiempo_empleado_segundos: 3600, // 1 hora antes de pausar
                    temporizador_activo: false,
                },
                // ✅ Petición CANCELADA para pruebas
                {
                    cliente_id: clientesCreados[4].id,
                    categoria_id: categoriaPautas1.id,
                    area: "Pautas",
                    descripcion: "Campaña de Black Friday - Cliente canceló evento",
                    costo: categoriaPautas1.costo,
                    estado: "Cancelada",
                    creador_id: admin.uid,
                    asignado_a: pautador1.uid,
                    fecha_aceptacion: new Date(ahora.getTime() - 5 * 24 * 60 * 60 * 1000),
                    fecha_resolucion: new Date(ahora.getTime() - 4 * 24 * 60 * 60 * 1000),
                    tiempo_empleado_segundos: 1800, // 30 minutos antes de cancelar
                    temporizador_activo: false,
                },
            ];
            for (const peticion of peticiones) {
                yield Peticion_1.default.create(peticion);
            }
            console.log("✅ Peticiones creadas");
            // Crear reportes de clientes de prueba
            console.log("📝 Creando reportes de clientes de prueba...");
            const reportes = [
                // Reporte pendiente - Problema con campaña
                {
                    cliente_id: clientesCreados[0].id,
                    tipo_problema: ReporteCliente_1.TipoProblema.CAMPANA,
                    descripcion_problema: "Cliente reporta que los anuncios de Facebook no están apareciendo desde hace 2 días. Urgente revisar configuración de la campaña.",
                    prioridad: ReporteCliente_1.PrioridadReporte.URGENTE,
                    estado: ReporteCliente_1.EstadoReporte.PENDIENTE,
                    creado_por: gestionAdmin.uid,
                    fecha_creacion: new Date(ahora.getTime() - 2 * 60 * 60 * 1000), // Hace 2 horas
                    notas_internas: "Cliente llamó 3 veces. Muy molesto.",
                },
                // Reporte en atención - Problema diseño web
                {
                    cliente_id: clientesCreados[1].id,
                    tipo_problema: ReporteCliente_1.TipoProblema.DISENO_WEB,
                    descripcion_problema: "El logo en la página principal se ve pixelado en dispositivos móviles. Cliente solicita ajuste urgente.",
                    prioridad: ReporteCliente_1.PrioridadReporte.ALTA,
                    estado: ReporteCliente_1.EstadoReporte.EN_ATENCION,
                    creado_por: gestionAdmin.uid,
                    atendido_por: disenador1.uid,
                    fecha_creacion: new Date(ahora.getTime() - 5 * 60 * 60 * 1000), // Hace 5 horas
                    fecha_atencion: new Date(ahora.getTime() - 4 * 60 * 60 * 1000), // Hace 4 horas
                    peticiones_relacionadas: [], // Se vinculará después cuando se cree la petición
                    notas_internas: "Carlos ya está trabajando en el ajuste.",
                },
                // Reporte pendiente - Consulta general
                {
                    cliente_id: clientesCreados[2].id,
                    tipo_problema: ReporteCliente_1.TipoProblema.CONSULTA_GENERAL,
                    descripcion_problema: "Cliente pregunta sobre el estado de su última petición de diseño y cuándo estará lista.",
                    prioridad: ReporteCliente_1.PrioridadReporte.MEDIA,
                    estado: ReporteCliente_1.EstadoReporte.PENDIENTE,
                    creado_por: gestionAdmin.uid,
                    fecha_creacion: new Date(ahora.getTime() - 1 * 60 * 60 * 1000), // Hace 1 hora
                },
                // Reporte resuelto - Soporte técnico
                {
                    cliente_id: clientesCreados[3].id,
                    tipo_problema: ReporteCliente_1.TipoProblema.SOPORTE_TECNICO,
                    descripcion_problema: "Cliente reportó error 404 en varias páginas de su sitio web. Se resolvió actualizando enlaces rotos.",
                    prioridad: ReporteCliente_1.PrioridadReporte.ALTA,
                    estado: ReporteCliente_1.EstadoReporte.RESUELTO,
                    creado_por: gestionAdmin.uid,
                    atendido_por: disenador2.uid,
                    fecha_creacion: new Date(ahora.getTime() - 24 * 60 * 60 * 1000), // Hace 1 día
                    fecha_atencion: new Date(ahora.getTime() - 23 * 60 * 60 * 1000), // Hace 23 horas
                    fecha_resolucion: new Date(ahora.getTime() - 20 * 60 * 60 * 1000), // Hace 20 horas
                    peticiones_relacionadas: [],
                    notas_internas: "Ana identificó 5 enlaces rotos y los corrigió. Cliente confirmó que todo funciona.",
                },
                // Reporte en atención - Escalamiento
                {
                    cliente_id: clientesCreados[4].id,
                    tipo_problema: ReporteCliente_1.TipoProblema.ESCALAMIENTO,
                    descripcion_problema: "Cliente muy insatisfecho con tiempo de respuesta en su última solicitud. Requiere atención inmediata del líder o directivo.",
                    prioridad: ReporteCliente_1.PrioridadReporte.URGENTE,
                    estado: ReporteCliente_1.EstadoReporte.EN_ATENCION,
                    creado_por: gestionAdmin.uid,
                    atendido_por: pautador1.uid,
                    fecha_creacion: new Date(ahora.getTime() - 3 * 60 * 60 * 1000), // Hace 3 horas
                    fecha_atencion: new Date(ahora.getTime() - 2 * 60 * 60 * 1000), // Hace 2 horas
                    notas_internas: "Escalado a Juan Pérez para seguimiento personalizado.",
                },
            ];
            for (const reporte of reportes) {
                yield ReporteCliente_1.default.create(reporte);
            }
            console.log("✅ Reportes de clientes creados");
            console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            console.log("✅ Datos iniciales cargados correctamente");
            console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            console.log("");
            console.log("📊 Resumen:");
            console.log(`   - ${roles.length} Roles`);
            console.log(`   - ${areas.length} Áreas`);
            console.log(`   - ${categoriasDiseño.length} Categorías de Diseño`);
            console.log(`   - ${categoriasPautas.length} Categorías de Pautas`);
            console.log(`   - 8 Categorías de Gestión Administrativa`);
            console.log(`   - ${usuarios.length} Usuarios`);
            console.log(`   - ${clientes.length} Clientes`);
            console.log(`   - ${peticiones.length} Peticiones`);
            console.log(`   - ${reportes.length} Reportes de Clientes`);
            console.log("");
            console.log("👥 Usuarios creados:");
            console.log("   📧 admin@empresa.com (Admin) - Password: 123456");
            console.log("   📧 juan.pautas@empresa.com (Pautador) - Password: 123456");
            console.log("   📧 maria.pautas@empresa.com (Pautadora) - Password: 123456");
            console.log("   📧 carlos.diseno@empresa.com (Diseñador) - Password: 123456");
            console.log("   📧 ana.diseno@empresa.com (Diseñadora) - Password: 123456");
            console.log("   📧 luis.lider@empresa.com (Líder) - Password: 123456");
            console.log("   📧 roberto.directivo@empresa.com (Directivo) - Password: 123456");
            console.log("   📧 laura.admin@empresa.com (Gestión Administrativa) - Password: 123456");
            console.log("");
            console.log("📊 Estados de peticiones:");
            console.log("   ✅ Resueltas: 3");
            console.log("   🔄 En Progreso: 3");
            console.log("   ⏸️ Pausadas: 2");
            console.log("   ⏳ Pendientes: 2");
            console.log("   ❌ Canceladas: 1");
            console.log("");
            console.log("📋 Estados de reportes:");
            console.log("   ⏳ Pendientes: 2");
            console.log("   🔄 En Atención: 2");
            console.log("   ✅ Resueltos: 1");
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
