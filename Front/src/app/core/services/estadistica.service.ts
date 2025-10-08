import { Injectable } from '@angular/core';
import { ApiResponse } from '../models/api-response.model';
import { API_ENDPOINTS } from '../constants/api.constants';
import { Observable } from 'rxjs';
import { EstadisticaGlobal, EstadisticaUsuario } from '../models/estadistica.model';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class EstadisticaService {
  constructor(private http: HttpClient) {}

  // Obtener mis estadísticas
  getMisEstadisticas(año?: number, mes?: number): Observable<ApiResponse<EstadisticaUsuario[]>> {
    let params = new HttpParams();

    if (año) params = params.set('año', año.toString());
    if (mes) params = params.set('mes', mes.toString());

    return this.http.get<ApiResponse<EstadisticaUsuario[]>>(
      API_ENDPOINTS.ESTADISTICAS.MIS_ESTADISTICAS,
      { params }
    );
  }

  // Obtener estadísticas globales
  getGlobales(año: number, mes: number): Observable<ApiResponse<EstadisticaGlobal>> {
    const params = new HttpParams()
      .set('año', año.toString())
      .set('mes', mes.toString());

    return this.http.get<ApiResponse<EstadisticaGlobal>>(
      API_ENDPOINTS.ESTADISTICAS.GLOBALES,
      { params }
    );
  }

  // Obtener estadísticas por área
  getPorArea(area: string, año: number, mes: number): Observable<ApiResponse<EstadisticaUsuario[]>> {
    const params = new HttpParams()
      .set('año', año.toString())
      .set('mes', mes.toString());

    return this.http.get<ApiResponse<EstadisticaUsuario[]>>(
      API_ENDPOINTS.ESTADISTICAS.POR_AREA(area),
      { params }
    );
  }

  // Obtener estadísticas de un usuario
  getPorUsuario(usuarioId: number, año?: number, mes?: number): Observable<ApiResponse<EstadisticaUsuario[]>> {
    let params = new HttpParams();

    if (año) params = params.set('año', año.toString());
    if (mes) params = params.set('mes', mes.toString());

    return this.http.get<ApiResponse<EstadisticaUsuario[]>>(
      API_ENDPOINTS.ESTADISTICAS.POR_USUARIO(usuarioId),
      { params }
    );
  }

  // Calcular estadísticas
  calcular(usuarioId: number, año: number, mes: number): Observable<ApiResponse<EstadisticaUsuario>> {
    return this.http.post<ApiResponse<EstadisticaUsuario>>(
      API_ENDPOINTS.ESTADISTICAS.CALCULAR,
      { usuario_id: usuarioId, año, mes }
    );
  }

  // Recalcular todas las estadísticas
  recalcularTodas(año: number, mes: number): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      API_ENDPOINTS.ESTADISTICAS.RECALCULAR,
      { año, mes }
    );
  }
}