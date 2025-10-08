import { DataTypes, Model } from "sequelize";
import sequelize from "../database/connection";

export class PeriodoFacturacion extends Model {
  public id!: number;
  public cliente_id!: number;
  public año!: number;
  public mes!: number;
  public total_peticiones!: number;
  public costo_total!: number;
  public fecha_generacion!: Date;
  public estado!: "Abierto" | "Cerrado" | "Facturado";
}

PeriodoFacturacion.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    cliente_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "clientes",
        key: "id",
      },
    },
    año: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    mes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 12,
      },
    },
    total_peticiones: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    costo_total: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    fecha_generacion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    estado: {
      type: DataTypes.ENUM("Abierto", "Cerrado", "Facturado"),
      allowNull: false,
      defaultValue: "Abierto",
    },
  },
  {
    sequelize,
    tableName: "periodos_facturacion",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["cliente_id", "año", "mes"],
      },
    ],
  }
);

export default PeriodoFacturacion;