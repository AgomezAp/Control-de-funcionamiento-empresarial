import { Injectable } from '@angular/core';
import { API_ENDPOINTS } from '../constants/api.constants';
import { ApiResponse } from '../models/api-response.model';
import { DetalleFacturacion, PeriodoFacturacion, PeriodoFacturacionCreate, ResumenFacturacionMensual } from '../models/periodo-facturacion.model';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class FacturacionService {
  constructor(private http: HttpClient) {}

  // Generar periodo de facturación
  generar(data: PeriodoFacturacionCreate): Observable<ApiResponse<PeriodoFacturacion>> {
    return this.http.post<ApiResponse<PeriodoFacturacion>>(
      API_ENDPOINTS.FACTURACION.GENERAR,
      data
    );
  }

  // Generar periodos para todos los clientes
  generarTodos(año: number, mes: number): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      API_ENDPOINTS.FACTURACION.GENERAR_TODOS,
      { año, mes }
    );
  }

  // Obtener resumen mensual
  getResumen(año: number, mes: number): Observable<ApiResponse<ResumenFacturacionMensual>> {
    const params = new HttpParams()
      .set('año', año.toString())
      .set('mes', mes.toString());

    return this.http.get<ApiResponse<ResumenFacturacionMensual>>(
      API_ENDPOINTS.FACTURACION.RESUMEN,
      { params }
    );
  }

  // Obtener detalle de facturación
  getDetalle(clienteId: number, año: number, mes: number): Observable<ApiResponse<DetalleFacturacion>> {
    const params = new HttpParams()
      .set('cliente_id', clienteId.toString())
      .set('año', año.toString())
      .set('mes', mes.toString());

    return this.http.get<ApiResponse<DetalleFacturacion>>(
      API_ENDPOINTS.FACTURACION.DETALLE,
      { params }
    );
  }

  // Obtener periodo por ID
  getById(id: number): Observable<ApiResponse<PeriodoFacturacion>> {
    return this.http.get<ApiResponse<PeriodoFacturacion>>(
      API_ENDPOINTS.FACTURACION.BY_ID(id)
    );
  }

  // Obtener periodos por cliente
  getPorCliente(clienteId: number, año?: number): Observable<ApiResponse<PeriodoFacturacion[]>> {
    let params = new HttpParams();
    if (año) params = params.set('año', año.toString());

    return this.http.get<ApiResponse<PeriodoFacturacion[]>>(
      API_ENDPOINTS.FACTURACION.POR_CLIENTE(clienteId),
      { params }
    );
  }

  // Cerrar periodo
  cerrar(id: number): Observable<ApiResponse<PeriodoFacturacion>> {
    return this.http.patch<ApiResponse<PeriodoFacturacion>>(
      API_ENDPOINTS.FACTURACION.CERRAR(id),
      {}
    );
  }

  // Facturar periodo
  facturar(id: number): Observable<ApiResponse<PeriodoFacturacion>> {
    return this.http.patch<ApiResponse<PeriodoFacturacion>>(
      API_ENDPOINTS.FACTURACION.FACTURAR(id),
      {}
    );
  }
}