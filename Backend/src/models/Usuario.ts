import { DataTypes, Model } from "sequelize";
import sequelize from "../database/connection";

export class Usuario extends Model {
  public uid!: number;
  public nombre_completo!: string;
  public correo!: string;
  public contrasena!: string;
  public status!: boolean;
  public rol_id!: number;
  public area_id!: number;
  public fecha_creacion!: Date;
  public fecha_actualizacion!: Date;
}

Usuario.init(
  {
    uid: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre_completo: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    correo: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    contrasena: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    rol_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "roles",
        key: "id",
      },
    },
    area_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "areas",
        key: "id",
      },
    },
    fecha_creacion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    fecha_actualizacion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "usuarios",
    timestamps: true,
    createdAt: "fecha_creacion",
    updatedAt: "fecha_actualizacion",
  } );

export default Usuario;