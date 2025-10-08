import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '../models/api-response.model';
import { Cliente, ClienteCreate, ClienteUpdate } from '../models/cliente.model';
import { API_ENDPOINTS } from '../constants/api.constants';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  constructor(private http: HttpClient) {}

  // Obtener todos los clientes
  getAll(): Observable<ApiResponse<Cliente[]>> {
    return this.http.get<ApiResponse<Cliente[]>>(API_ENDPOINTS.CLIENTES.BASE);
  }

  // Obtener cliente por ID
  getById(id: number): Observable<ApiResponse<Cliente>> {
    return this.http.get<ApiResponse<Cliente>>(
      API_ENDPOINTS.CLIENTES.BY_ID(id)
    );
  }

  // Crear cliente
  create(data: ClienteCreate): Observable<ApiResponse<Cliente>> {
    return this.http.post<ApiResponse<Cliente>>(
      API_ENDPOINTS.CLIENTES.BASE,
      data
    );
  }

  // Actualizar cliente
  update(id: number, data: ClienteUpdate): Observable<ApiResponse<Cliente>> {
    return this.http.put<ApiResponse<Cliente>>(
      API_ENDPOINTS.CLIENTES.BY_ID(id),
      data
    );
  }

  // Desactivar cliente
  delete(id: number): Observable<ApiResponse<Cliente>> {
    return this.http.delete<ApiResponse<Cliente>>(
      API_ENDPOINTS.CLIENTES.BY_ID(id)
    );
  }
}
