import { DataTypes, Model } from "sequelize";
import sequelize from "../database/connection";

export class Cliente extends Model {
  public id!: number;
  public nombre!: string;
  public pais!: string;
  public pautador_id!: number;
  public disenador_id!: number | null;
  public fecha_creacion!: Date;
  public fecha_inicio!: Date;
  public status!: boolean;
}

Cliente.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    pais: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    pautador_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "usuarios",
        key: "uid",
      },
    },
    disenador_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "usuarios",
        key: "uid",
      },
    },
    fecha_creacion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    fecha_inicio: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: "clientes",
    timestamps: false,
  }
);

export default Cliente;