import { Cliente } from './cliente.model';

export enum EstadoFacturacion {
  ABIERTO = 'Abierto',
  CERRADO = 'Cerrado',
  FACTURADO = 'Facturado'
}

export interface PeriodoFacturacion {
  id: number;
  cliente_id: number;
  año: number;
  mes: number;
  total_peticiones: number;
  costo_total: number;
  fecha_generacion: Date;
  estado: EstadoFacturacion;
  cliente?: Cliente;
}

export interface PeriodoFacturacionCreate {
  cliente_id: number;
  año: number;
  mes: number;
}

export interface DetalleFacturacion {
  periodo: PeriodoFacturacion;
  detalle_peticiones: any[];
  resumen_categorias: ResumenCategoria[];
  totales: {
    total_peticiones: number;
    costo_total: number;
  };
}

export interface ResumenCategoria {
  categoria: string;
  area_tipo: string;
  cantidad: number;
  costo_total: number;
}

export interface ResumenFacturacionMensual {
  periodos: PeriodoFacturacion[];
  totales: {
    total_clientes: number;
    total_peticiones: number;
    costo_total: number;
    por_estado: {
      abiertos: number;
      cerrados: number;
      facturados: number;
    };
  };
}