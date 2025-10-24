import sequelize from "../database/connection";
import Categoria from "../models/Categoria";
import "../models/Relaciones";

/**
 * Script para actualizar SOLO las categorías de Gestión Administrativa
 * estableciendo su costo en 0
 */
async function actualizarCategoriasGA() {
  try {
    console.log("🔄 Actualizando categorías de Gestión Administrativa...");

    await sequelize.authenticate();
    console.log("✅ Conectado a la base de datos");

    // Actualizar TODAS las categorías de Gestión Administrativa para que tengan costo 0
    const [affectedCount] = await Categoria.update(
      { costo: 0 },
      {
        where: {
          area_tipo: "Gestión Administrativa",
        },
      }
    );

    console.log(`✅ Se actualizaron ${affectedCount} categorías de Gestión Administrativa`);
    console.log("   Todas las categorías de GA ahora tienen costo: $0");

    // Mostrar las categorías actualizadas
    const categoriasGA = await Categoria.findAll({
      where: { area_tipo: "Gestión Administrativa" },
      attributes: ["id", "nombre", "costo", "area_tipo"],
      order: [["nombre", "ASC"]],
    });

    console.log("\n📋 Categorías de Gestión Administrativa:");
    categoriasGA.forEach((cat) => {
      console.log(`   • ${cat.nombre} - Costo: $${cat.costo}`);
    });

    await sequelize.close();
    console.log("\n✅ Actualización completada exitosamente");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error al actualizar categorías:", error);
    await sequelize.close();
    process.exit(1);
  }
}

// Ejecutar el script
actualizarCategoriasGA();
