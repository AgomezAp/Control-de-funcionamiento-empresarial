import sequelize from "../database/connection";
import Role from "../models/Role";
import Area from "../models/Area";
import Categoria from "../models/Categoria";
import "../models/Relaciones"; // Importar relaciones

async function initData() {
  try {
    await sequelize.authenticate();
    console.log("✅ Conectado a la base de datos");

    // Sincronizar modelos
    await sequelize.sync({ force: false }); // force: true elimina tablas existentes
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
      await Role.findOrCreate({
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
      await Area.findOrCreate({
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
      await Categoria.findOrCreate({
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
      await Categoria.findOrCreate({
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
  } catch (error) {
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.error("❌ Error al inicializar datos:");
    console.error(error);
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    process.exit(1);
  }
}

// Ejecutar función
initData();
