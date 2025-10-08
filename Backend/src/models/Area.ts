import { DataTypes, Model } from "sequelize";
import sequelize from "../database/connection";

export class Area extends Model {
  public id!: number;
  public nombre!: "Gestión Administrativa" | "Pautas" | "Diseño" | "Contabilidad" | "Programación";
  public descripcion!: string;
}

Area.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.ENUM(
        "Gestión Administrativa",
        "Pautas",
        "Diseño",
        "Contabilidad",
        "Programación"
      ),
      allowNull: false,
      unique: true,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "areas",
    timestamps: false,
  }
);

export default Area;