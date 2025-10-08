import { DataTypes, Model } from "sequelize";
import sequelize from "../database/connection";

export class Categoria extends Model {
  public id!: number;
  public nombre!: string;
  public area_tipo!: "Diseño" | "Pautas";
  public costo!: number;
  public es_variable!: boolean;
  public requiere_descripcion_extra!: boolean;
}

Categoria.init(
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
    area_tipo: {
      type: DataTypes.ENUM("Diseño", "Pautas"),
      allowNull: false,
    },
    costo: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    es_variable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: "True para casos como Modelado 3D donde el costo varía",
    },
    requiere_descripcion_extra: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: "True para casos como Estrategias de seguimiento",
    },
  },
  {
    sequelize,
    tableName: "categorias",
    timestamps: false,
  }
);

export default Categoria;