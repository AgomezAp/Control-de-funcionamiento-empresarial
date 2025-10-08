import { DataTypes, Model } from "sequelize";
import sequelize from "../database/connection";

export class PeticionHistorico extends Model {
  public id!: number;
  public peticion_id_original!: number;
  public cliente_id!: number;
  public categoria_id!: number;
  public descripcion!: string;
  public descripcion_extra!: string | null;
  public costo!: number;
  public estado!: "Resuelta" | "Cancelada";
  public creador_id!: number;
  public asignado_a!: number | null;
  public fecha_creacion!: Date;
  public fecha_aceptacion!: Date | null;
  public fecha_limite!: Date | null;
  public fecha_resolucion!: Date;
  public fecha_movido_historico!: Date;
  public tiempo_limite_horas!: number | null;
}

PeticionHistorico.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    peticion_id_original: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "ID de la petición original antes de mover al histórico",
    },
    cliente_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    categoria_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    descripcion_extra: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    costo: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    estado: {
      type: DataTypes.ENUM("Resuelta", "Cancelada"),
      allowNull: false,
    },
    creador_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    asignado_a: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    fecha_creacion: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    fecha_aceptacion: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    fecha_limite: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    fecha_resolucion: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    fecha_movido_historico: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    tiempo_limite_horas: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "peticiones_historico",
    timestamps: false,
  }
);

export default PeticionHistorico;