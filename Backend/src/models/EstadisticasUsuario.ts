import { DataTypes, Model } from "sequelize";
import sequelize from "../database/connection";

export class EstadisticaUsuario extends Model {
  public id!: number;
  public usuario_id!: number;
  public año!: number;
  public mes!: number;
  public peticiones_creadas!: number;
  public peticiones_resueltas!: number;
  public peticiones_canceladas!: number;
  public tiempo_promedio_resolucion_horas!: number | null;
  public costo_total_generado!: number;
  public fecha_calculo!: Date;
}

EstadisticaUsuario.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "usuarios",
        key: "uid",
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
    peticiones_creadas: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    peticiones_resueltas: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    peticiones_canceladas: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    tiempo_promedio_resolucion_horas: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    costo_total_generado: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    fecha_calculo: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "estadisticas_usuarios",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["usuario_id", "año", "mes"],
      },
    ],
  }
);

export default EstadisticaUsuario;