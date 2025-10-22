import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { Peticion, PeticionAceptar, PeticionCambiarEstado, PeticionCreate, PeticionFiltros, PeticionUpdate } from '../models/peticion.model';
import { API_ENDPOINTS } from '../constants/api.constants';
import { HttpClient, HttpParams } from '@angular/common/http';
import { PeticionHistorico } from '../models/peticion-historico';

@Injectable({
  providedIn: 'root'
})
export class PeticionService {
  constructor(private http: HttpClient) {}

  // Obtener todas las peticiones con filtros opcionales
  getAll(filtros?: PeticionFiltros): Observable<ApiResponse<Peticion[]>> {
    let params = new HttpParams();

    if (filtros?.estado) {
      params = params.set('estado', filtros.estado);
    }
    if (filtros?.cliente_id) {
      params = params.set('cliente_id', filtros.cliente_id.toString());
    }
    if (filtros?.area) {
      params = params.set('area', filtros.area);
    }

    return this.http.get<ApiResponse<Peticion[]>>(
      API_ENDPOINTS.PETICIONES.BASE,
      { params }
    );
  }

  // Obtener petición por ID
  getById(id: number): Observable<ApiResponse<Peticion>> {
    return this.http.get<ApiResponse<Peticion>>(
      API_ENDPOINTS.PETICIONES.BY_ID(id)
    );
  }

  // Obtener peticiones pendientes
  getPendientes(area?: string): Observable<ApiResponse<Peticion[]>> {
    let params = new HttpParams();
    if (area) {
      params = params.set('area', area);
    }

    return this.http.get<ApiResponse<Peticion[]>>(
      API_ENDPOINTS.PETICIONES.PENDIENTES,
      { params }
    );
  }

  // Obtener histórico
  getHistorico(filtros?: any): Observable<ApiResponse<PeticionHistorico[]>> {
    let params = new HttpParams();

    if (filtros?.cliente_id) {
      params = params.set('cliente_id', filtros.cliente_id.toString());
    }
    if (filtros?.estado) {
      params = params.set('estado', filtros.estado);
    }
    if (filtros?.año) {
      params = params.set('año', filtros.año.toString());
    }
    if (filtros?.mes) {
      params = params.set('mes', filtros.mes.toString());
    }

    return this.http.get<ApiResponse<PeticionHistorico[]>>(
      API_ENDPOINTS.PETICIONES.HISTORICO,
      { params }
    );
  }

  // Obtener peticiones por cliente y mes
  getPorClienteMes(clienteId: number, año: number, mes: number): Observable<ApiResponse<any>> {
    const params = new HttpParams()
      .set('cliente_id', clienteId.toString())
      .set('año', año.toString())
      .set('mes', mes.toString());

    return this.http.get<ApiResponse<any>>(
      API_ENDPOINTS.PETICIONES.CLIENTE_MES,
      { params }
    );
  }

  // Crear petición
  create(data: PeticionCreate): Observable<ApiResponse<Peticion>> {
    return this.http.post<ApiResponse<Peticion>>(
      API_ENDPOINTS.PETICIONES.BASE,
      data
    );
  }

  // Actualizar petición
  update(id: number, data: PeticionUpdate): Observable<ApiResponse<Peticion>> {
    return this.http.put<ApiResponse<Peticion>>(
      API_ENDPOINTS.PETICIONES.BY_ID(id),
      data
    );
  }

  // Aceptar petición (ya no necesita tiempo_limite_horas)
  accept(id: number): Observable<ApiResponse<Peticion>> {
    return this.http.post<ApiResponse<Peticion>>(
      API_ENDPOINTS.PETICIONES.ACEPTAR(id),
      {}
    );
  }

  // Cambiar estado
  changeStatus(id: number, data: PeticionCambiarEstado): Observable<ApiResponse<Peticion>> {
    return this.http.patch<ApiResponse<Peticion>>(
      API_ENDPOINTS.PETICIONES.CAMBIAR_ESTADO(id),
      data
    );
  }

  // ====== CONTROL DE TEMPORIZADOR ======

  // Pausar temporizador
  pausarTemporizador(id: number): Observable<ApiResponse<Peticion>> {
    return this.http.post<ApiResponse<Peticion>>(
      API_ENDPOINTS.PETICIONES.PAUSAR_TEMPORIZADOR(id),
      {}
    );
  }

  // Reanudar temporizador
  reanudarTemporizador(id: number): Observable<ApiResponse<Peticion>> {
    return this.http.post<ApiResponse<Peticion>>(
      API_ENDPOINTS.PETICIONES.REANUDAR_TEMPORIZADOR(id),
      {}
    );
  }

  // Obtener tiempo empleado
  obtenerTiempoEmpleado(id: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      API_ENDPOINTS.PETICIONES.TIEMPO_EMPLEADO(id)
    );
  }

  // Marcar como resuelta
  markAsResolved(id: number): Observable<ApiResponse<Peticion>> {
    return this.changeStatus(id, { estado: 'Resuelta' as any });
  }

  // Marcar como cancelada
  markAsCancelled(id: number): Observable<ApiResponse<Peticion>> {
    return this.changeStatus(id, { estado: 'Cancelada' as any });
  }

  // Obtener resumen global (activas + históricas)
  getResumenGlobal(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      API_ENDPOINTS.PETICIONES.RESUMEN_GLOBAL
    );
  }

  // Transferir peticiones entre usuarios
  transferirPeticiones(payload: {
    usuario_origen_id: number;
    peticiones_ids: number[];
    usuarios_destino_ids: number[];
    motivo: string;
  }): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${API_ENDPOINTS.PETICIONES.BASE}/transferir`,
      payload
    );
  }
}
