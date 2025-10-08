import { DataTypes, Model } from "sequelize";
import sequelize from "../database/connection";

export class Role extends Model {
  public id!: number;
  public nombre!: "Admin" | "Directivo" | "Líder" | "Usuario";
  public descripcion!: string;
}

Role.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.ENUM("Admin", "Directivo", "Líder", "Usuario"),
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
    tableName: "roles",
    timestamps: false,
  }
);

export default Role;