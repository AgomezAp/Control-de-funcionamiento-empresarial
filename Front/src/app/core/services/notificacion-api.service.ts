import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { Notificacion, NotificacionFiltros } from '../models/notificacion.model';
import { environment } from '../../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class NotificacionApiService {
  private readonly baseUrl = `${environment.apiUrl}/notificaciones`;

  constructor(private http: HttpClient) {}

  // Obtener todas las notificaciones del usuario con filtros opcionales
  getAll(filtros?: NotificacionFiltros): Observable<ApiResponse<Notificacion[]>> {
    let params = new HttpParams();

    if (filtros?.leida !== undefined) {
      params = params.set('leida', filtros.leida.toString());
    }
    if (filtros?.limit) {
      params = params.set('limit', filtros.limit.toString());
    }

    return this.http.get<ApiResponse<Notificacion[]>>(this.baseUrl, { params });
  }

  // Obtener el contador de notificaciones no leídas
  getUnreadCount(): Observable<ApiResponse<{ count: number }>> {
    return this.http.get<ApiResponse<{ count: number }>>(
      `${this.baseUrl}/no-leidas/count`
    );
  }

  // Marcar una notificación como leída
  markAsRead(id: number): Observable<ApiResponse<Notificacion>> {
    return this.http.patch<ApiResponse<Notificacion>>(
      `${this.baseUrl}/${id}/leida`,
      {}
    );
  }

  // Marcar todas las notificaciones como leídas
  markAllAsRead(): Observable<ApiResponse<{ count: number }>> {
    return this.http.patch<ApiResponse<{ count: number }>>(
      `${this.baseUrl}/todas/leidas`,
      {}
    );
  }

  // Eliminar una notificación
  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`);
  }

  // Eliminar todas las notificaciones del usuario
  deleteAll(): Observable<ApiResponse<{ count: number }>> {
    return this.http.delete<ApiResponse<{ count: number }>>(this.baseUrl);
  }
}
