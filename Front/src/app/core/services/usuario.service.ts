import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { API_ENDPOINTS } from '../constants/api.constants';
import { ApiResponse } from '../models/api-response.model';
import { Usuario } from '../models/usuario.model';
import { EstadoPresencia } from '../models/estado-presencia.model';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  constructor(private http: HttpClient) {}

  /**
   * Obtener todos los usuarios
   */
  getAll(): Observable<ApiResponse<Usuario[]>> {
    return this.http.get<ApiResponse<Usuario[]>>(API_ENDPOINTS.USUARIOS.BASE);
  }

  /**
   * Obtener usuario por ID
   */
  getById(id: number): Observable<ApiResponse<Usuario>> {
    return this.http.get<ApiResponse<Usuario>>(API_ENDPOINTS.USUARIOS.BY_ID(id));
  }

  /**
   * Crear nuevo usuario
   */
  create(usuario: Partial<Usuario>): Observable<ApiResponse<Usuario>> {
    return this.http.post<ApiResponse<Usuario>>( API_ENDPOINTS.AUTH.REGISTRO, usuario);
  }

  /**
   * Actualizar usuario
   */
  update(id: number, usuario: Partial<Usuario>): Observable<ApiResponse<Usuario>> {
    return this.http.put<ApiResponse<Usuario>>(API_ENDPOINTS.USUARIOS.BY_ID(id), usuario);
  }

  /**
   * Eliminar usuario
   */
  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(API_ENDPOINTS.USUARIOS.BY_ID(id));
  }

  /**
   * Cambiar estado activo/inactivo
   */
  toggleActive(id: number): Observable<ApiResponse<Usuario>> {
    return this.http.patch<ApiResponse<Usuario>>(API_ENDPOINTS.USUARIOS.CAMBIAR_STATUS(id), {});
  }

  /**
   * Cambiar contraseña
   */
  changePassword(id: number, oldPassword: string, newPassword: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${API_ENDPOINTS.USUARIOS.BY_ID(id)}/change-password`, {
      oldPassword,
      newPassword
    });
  }

  /**
   * Restablecer contraseña (Admin)
   */
  resetPassword(id: number): Observable<ApiResponse<{ temporaryPassword: string }>> {
    return this.http.post<ApiResponse<{ temporaryPassword: string }>>(`${API_ENDPOINTS.USUARIOS.BY_ID(id)}/reset-password`, {});
  }

  /**
   * Obtener usuarios por área
   */
  getByArea(areaId: number): Observable<ApiResponse<Usuario[]>> {
    return this.http.get<ApiResponse<Usuario[]>>(API_ENDPOINTS.USUARIOS.BY_AREA(areaId.toString()));
  }

  /**
   * Obtener usuarios por rol
   */
  getByRole(roleId: number): Observable<ApiResponse<Usuario[]>> {
    return this.http.get<ApiResponse<Usuario[]>>(`${API_ENDPOINTS.USUARIOS.BASE}/role/${roleId}`);
  }

  /**
   * Cambiar estado de presencia del usuario actual
   */
  cambiarEstadoPresencia(estadoPresencia: EstadoPresencia): Observable<ApiResponse<Usuario>> {
    return this.http.put<ApiResponse<Usuario>>(`${environment.apiUrl}/usuarios/mi-presencia`, {
      estadoPresencia
    });
  }

  /**
   * Actualizar última actividad del usuario actual
   */
  actualizarActividad(): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${environment.apiUrl}/usuarios/mi-actividad`, {});
  }

  /**
   * Obtener lista de usuarios conectados
   */
  getUsuariosConectados(): Observable<ApiResponse<{ usuarios: number[], total: number }>> {
    return this.http.get<ApiResponse<{ usuarios: number[], total: number }>>(`${environment.apiUrl}/usuarios/conectados/lista`);
  }
}
