import { DataTypes, Model } from "sequelize";
import sequelize from "../database/connection";

export class Peticion extends Model {
  public id!: number;
  public cliente_id!: number;
  public categoria_id!: number;
  public descripcion!: string;
  public descripcion_extra!: string | null;
  public costo!: number;
  public area!: "Pautas" | "Diseño" | "Gestión Administrativa";
  public estado!: "Pendiente" | "En Progreso" | "Pausada" | "Resuelta" | "Cancelada";
  public creador_id!: number;
  public asignado_a!: number | null;
  public fecha_creacion!: Date;
  public fecha_aceptacion!: Date | null;
  public fecha_resolucion!: Date | null;
  // Campos del temporizador
  public tiempo_empleado_segundos!: number;
  public temporizador_activo!: boolean;
  public fecha_inicio_temporizador!: Date | null;
  public fecha_pausa_temporizador!: Date | null;
}

Peticion.init(
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
    categoria_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "categorias",
        key: "id",
      },
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    descripcion_extra: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Campo extra para categorías como Estrategias de seguimiento",
    },
    costo: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: "Se toma de la categoría o se ingresa manual si es variable",
    },
    area: {
      type: DataTypes.ENUM("Pautas", "Diseño", "Gestión Administrativa"),
      allowNull: false,
      comment: "Área a la que pertenece la petición: Pautas, Diseño o Gestión Administrativa",
    },
    estado: {
      type: DataTypes.ENUM("Pendiente", "En Progreso", "Pausada", "Resuelta", "Cancelada"),
      allowNull: false,
      defaultValue: "Pendiente",
    },
    creador_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "usuarios",
        key: "uid",
      },
      comment: "Usuario que creó la petición",
    },
    asignado_a: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "usuarios",
        key: "uid",
      },
      comment: "Diseñador/Usuario que aceptó la petición",
    },
    fecha_creacion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    fecha_aceptacion: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Cuando el diseñador acepta la petición",
    },
    fecha_resolucion: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    tiempo_empleado_segundos: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "Tiempo total empleado en segundos",
    },
    temporizador_activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: "Indica si el temporizador está corriendo actualmente",
    },
    fecha_inicio_temporizador: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Última vez que se inició o reanudó el temporizador",
    },
    fecha_pausa_temporizador: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Última vez que se pausó el temporizador",
    },
  },
  {
    sequelize,
    tableName: "peticiones",
    timestamps: false,
  }
);

export default Peticion;