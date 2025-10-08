import { DataTypes, Model } from "sequelize";
import sequelize from "../database/connection";

export class AuditoriaCambios extends Model {
  public id!: number;
  public tabla_afectada!: string;
  public registro_id!: number;
  public tipo_cambio!: "INSERT" | "UPDATE" | "DELETE" | "ASIGNACION" | "CAMBIO_ESTADO";
  public campo_modificado!: string | null;
  public valor_anterior!: string | null;
  public valor_nuevo!: string | null;
  public usuario_id!: number;
  public fecha_cambio!: Date;
  public descripcion!: string | null;
}

AuditoriaCambios.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    tabla_afectada: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "Nombre de la tabla que sufrió el cambio",
    },
    registro_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "ID del registro afectado",
    },
    tipo_cambio: {
      type: DataTypes.ENUM("INSERT", "UPDATE", "DELETE", "ASIGNACION", "CAMBIO_ESTADO"),
      allowNull: false,
    },
    campo_modificado: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "Campo específico que cambió (para UPDATE)",
    },
    valor_anterior: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    valor_nuevo: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "usuarios",
        key: "uid",
      },
      comment: "Usuario que realizó el cambio",
    },
    fecha_cambio: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Descripción adicional del cambio",
    },
  },
  {
    sequelize,
    tableName: "auditoria_cambios",
    timestamps: false,
  }
);

export default AuditoriaCambios;