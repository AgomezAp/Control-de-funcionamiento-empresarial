import sequelize from "../database/connection";
import { QueryInterface, DataTypes } from "sequelize";

/**
 * Migración: Agregar columna 'area' a tabla peticiones_historico
 * 
 * Esta migración agrega el campo 'area' que faltaba en la tabla
 * peticiones_historico para soportar peticiones de Gestión Administrativa
 */

export async function agregarAreaHistorico() {
  const queryInterface: QueryInterface = sequelize.getQueryInterface();

  try {
    console.log("🔄 Iniciando migración: Agregar columna 'area' a peticiones_historico");

    // Verificar si la columna ya existe
    const tableDescription = await queryInterface.describeTable("peticiones_historico");
    
    if (tableDescription.area) {
      console.log("✅ La columna 'area' ya existe en peticiones_historico");
      return;
    }

    // Agregar columna 'area' con valor por defecto
    await queryInterface.addColumn("peticiones_historico", "area", {
      type: DataTypes.ENUM("Pautas", "Diseño", "Gestión Administrativa"),
      allowNull: false,
      defaultValue: "Diseño",
    });

    console.log("✅ Columna 'area' agregada exitosamente a peticiones_historico");

    // Actualizar registros existentes basándose en la categoría
    const result = await sequelize.query(`
      UPDATE peticiones_historico ph
      INNER JOIN categorias c ON ph.categoria_id = c.id
      SET ph.area = c.area_tipo
      WHERE ph.area = 'Diseño'
    `);

    console.log(`✅ Se actualizaron ${(result[0] as any).affectedRows || 0} registros con el área correcta`);
    
    console.log("🎉 Migración completada exitosamente");
  } catch (error) {
    console.error("❌ Error en migración agregar-area-historico:", error);
    throw error;
  }
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
