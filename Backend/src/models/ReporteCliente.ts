import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../database/connection";
import Usuario from "./Usuario";
import Cliente from "./Cliente";

// Enums
export enum TipoProblema {
  CAMPANA = "Campaña",
  DISENO_WEB = "Diseño Web",
  SOPORTE_TECNICO = "Soporte Técnico",
  CONSULTA_GENERAL = "Consulta General",
  ESCALAMIENTO = "Escalamiento",
  SEGUIMIENTO = "Seguimiento",
  OTRO = "Otro",
}

export enum PrioridadReporte {
  BAJA = "Baja",
  MEDIA = "Media",
  ALTA = "Alta",
  URGENTE = "Urgente",
}

export enum EstadoReporte {
  PENDIENTE = "Pendiente",
  EN_ATENCION = "En Atención",
  RESUELTO = "Resuelto",
  CANCELADO = "Cancelado",
}

// Interfaces
interface ReporteClienteAttributes {
  id: number;
  cliente_id: number;
  tipo_problema: TipoProblema;
  descripcion_problema: string;
  prioridad: PrioridadReporte;
  estado: EstadoReporte;
  creado_por: number; // Usuario de Gestión Admin que creó el reporte
  atendido_por?: number; // Pautador/Diseñador que atiende
  peticiones_relacionadas?: number[]; // IDs de peticiones creadas
  notas_internas?: string;
  fecha_creacion: Date;
  fecha_atencion?: Date;
  fecha_resolucion?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ReporteClienteCreationAttributes
  extends Optional<
    ReporteClienteAttributes,
    | "id"
    | "atendido_por"
    | "peticiones_relacionadas"
    | "notas_internas"
    | "fecha_atencion"
    | "fecha_resolucion"
    | "createdAt"
    | "updatedAt"
  > {}

class ReporteCliente
  extends Model<ReporteClienteAttributes, ReporteClienteCreationAttributes>
  implements ReporteClienteAttributes
{
  public id!: number;
  public cliente_id!: number;
  public tipo_problema!: TipoProblema;
  public descripcion_problema!: string;
  public prioridad!: PrioridadReporte;
  public estado!: EstadoReporte;
  public creado_por!: number;
  public atendido_por?: number;
  public peticiones_relacionadas?: number[];
  public notas_internas?: string;
  public fecha_creacion!: Date;
  public fecha_atencion?: Date;
  public fecha_resolucion?: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Relaciones
  public readonly creador?: Usuario;
  public readonly tecnico?: Usuario;
  public readonly cliente?: Cliente;
}

ReporteCliente.init(
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
    tipo_problema: {
      type: DataTypes.ENUM(...Object.values(TipoProblema)),
      allowNull: false,
      defaultValue: TipoProblema.CONSULTA_GENERAL,
    },
    descripcion_problema: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    prioridad: {
      type: DataTypes.ENUM(...Object.values(PrioridadReporte)),
      allowNull: false,
      defaultValue: PrioridadReporte.MEDIA,
    },
    estado: {
      type: DataTypes.ENUM(...Object.values(EstadoReporte)),
      allowNull: false,
      defaultValue: EstadoReporte.PENDIENTE,
    },
    creado_por: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "usuarios",
        key: "uid",
      },
    },
    atendido_por: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "usuarios",
        key: "uid",
      },
    },
    peticiones_relacionadas: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      comment: "Array de IDs de peticiones creadas para resolver este reporte",
    },
    notas_internas: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Notas internas para el equipo técnico",
    },
    fecha_creacion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    fecha_atencion: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    fecha_resolucion: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "reportes_clientes",
    timestamps: true,
  }
);

export default ReporteCliente;
