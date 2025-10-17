import { DataTypes, Model } from "sequelize";
import sequelize from "../database/connection";

export enum TipoCliente {
  META_ADS = "Meta Ads",
  GOOGLE_ADS = "Google Ads",
  EXTERNO = "Externo",
  OTRO = "Otro",
}

export class Cliente extends Model {
  public id!: number;
  public nombre!: string;
  public cedula!: string; // ✅ Nuevo campo
  public pais!: string;
  public tipo_cliente!: TipoCliente;
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
    cedula: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true,
      comment: "Cédula o documento de identidad del cliente",
    },
    pais: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    tipo_cliente: {
      type: DataTypes.ENUM("Meta Ads", "Google Ads", "Externo", "Otro"),
      allowNull: false,
      defaultValue: "Otro",
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