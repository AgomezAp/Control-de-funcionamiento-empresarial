import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../database/connection";

interface NotificacionAttributes {
  id: number;
  usuario_id: number;
  tipo: "asignacion" | "cambio_estado" | "comentario" | "mencion" | "sistema";
  titulo: string;
  mensaje: string;
  peticion_id?: number;
  leida: boolean;
  fecha_creacion: Date;
  fecha_lectura?: Date;
}

interface NotificacionCreationAttributes
  extends Optional<NotificacionAttributes, "id" | "leida" | "fecha_creacion" | "fecha_lectura" | "peticion_id"> {}

class Notificacion
  extends Model<NotificacionAttributes, NotificacionCreationAttributes>
  implements NotificacionAttributes
{
  public id!: number;
  public usuario_id!: number;
  public tipo!: "asignacion" | "cambio_estado" | "comentario" | "mencion" | "sistema";
  public titulo!: string;
  public mensaje!: string;
  public peticion_id?: number;
  public leida!: boolean;
  public fecha_creacion!: Date;
  public fecha_lectura?: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Notificacion.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Usuario que recibe la notificación",
    },
    tipo: {
      type: DataTypes.ENUM("asignacion", "cambio_estado", "comentario", "mencion", "sistema"),
      allowNull: false,
      comment: "Tipo de notificación",
    },
    titulo: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "Título breve de la notificación",
    },
    mensaje: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "Mensaje detallado de la notificación",
    },
    peticion_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "ID de la petición relacionada (si aplica)",
    },
    leida: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: "Indica si la notificación fue leída",
    },
    fecha_creacion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    fecha_lectura: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Fecha en que se marcó como leída",
    },
  },
  {
    sequelize,
    tableName: "notificaciones",
    timestamps: false,
    indexes: [
      {
        name: "idx_usuario_leida",
        fields: ["usuario_id", "leida"],
      },
      {
        name: "idx_fecha_creacion",
        fields: ["fecha_creacion"],
      },
    ],
  }
);

export default Notificacion;
