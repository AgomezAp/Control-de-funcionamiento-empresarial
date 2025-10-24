import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ReporteCliente,
  CrearReporteDTO,
  ActualizarEstadoDTO,
  VincularPeticionDTO,
  FiltrosReporte,
  EstadisticasReporte
} from '../models/reporte-cliente.model';

@Injectable({
  providedIn: 'root'
})
export class ReporteClienteService {
  private readonly API_URL = `${environment.apiUrl}/reportes-clientes`;

  constructor(private http: HttpClient) {}

  /**
   * Crear un nuevo reporte de cliente
   */
  crearReporte(data: CrearReporteDTO): Observable<{ ok: boolean; msg: string; reporte: ReporteCliente }> {
    return this.http.post<{ ok: boolean; msg: string; reporte: ReporteCliente }>(
      this.API_URL,
      data
    );
  }

  /**
   * Obtener todos los reportes con filtros opcionales
   */
  obtenerReportes(filtros?: FiltrosReporte): Observable<{ ok: boolean; reportes: ReporteCliente[]; total: number }> {
    let params = new HttpParams();

    if (filtros) {
      if (filtros.estado) params = params.set('estado', filtros.estado);
      if (filtros.prioridad) params = params.set('prioridad', filtros.prioridad);
      if (filtros.tipo_problema) params = params.set('tipo_problema', filtros.tipo_problema);
      if (filtros.creado_por) params = params.set('creado_por', filtros.creado_por.toString());
      if (filtros.atendido_por) params = params.set('atendido_por', filtros.atendido_por.toString());
      if (filtros.cliente_id) params = params.set('cliente_id', filtros.cliente_id.toString());
    }

    return this.http.get<{ ok: boolean; reportes: ReporteCliente[]; total: number }>(
      this.API_URL,
      { params }
    );
  }

  /**
   * Obtener mis reportes creados
   */
  obtenerMisReportes(): Observable<{ ok: boolean; reportes: ReporteCliente[]; total: number }> {
    return this.http.get<{ ok: boolean; reportes: ReporteCliente[]; total: number }>(
      `${this.API_URL}/mis-reportes`
    );
  }

  /**
   * Obtener reportes pendientes (para técnicos)
   */
  obtenerReportesPendientes(): Observable<{ ok: boolean; reportes: ReporteCliente[]; total: number }> {
    return this.http.get<{ ok: boolean; reportes: ReporteCliente[]; total: number }>(
      `${this.API_URL}/pendientes`
    );
  }

  /**
   * Obtener un reporte por ID
   */
  obtenerReportePorId(id: number): Observable<{ ok: boolean; reporte: ReporteCliente }> {
    return this.http.get<{ ok: boolean; reporte: ReporteCliente }>(
      `${this.API_URL}/${id}`
    );
  }

  /**
   * Asignar técnico a reporte (auto-asignación)
   */
  asignarTecnico(reporteId: number): Observable<{ ok: boolean; msg: string; reporte: ReporteCliente }> {
    return this.http.patch<{ ok: boolean; msg: string; reporte: ReporteCliente }>(
      `${this.API_URL}/${reporteId}/asignar`,
      {}
    );
  }

  /**
   * Vincular petición a reporte
   */
  vincularPeticion(reporteId: number, data: VincularPeticionDTO): Observable<{ ok: boolean; msg: string; reporte: ReporteCliente }> {
    return this.http.patch<{ ok: boolean; msg: string; reporte: ReporteCliente }>(
      `${this.API_URL}/${reporteId}/vincular`,
      data
    );
  }

  /**
   * Actualizar estado del reporte
   */
  actualizarEstado(reporteId: number, data: ActualizarEstadoDTO): Observable<{ ok: boolean; msg: string; reporte: ReporteCliente }> {
    return this.http.patch<{ ok: boolean; msg: string; reporte: ReporteCliente }>(
      `${this.API_URL}/${reporteId}/estado`,
      data
    );
  }

  /**
   * Obtener estadísticas de reportes
   */
  obtenerEstadisticas(usuarioId?: number): Observable<{ ok: boolean; estadisticas: EstadisticasReporte }> {
    let params = new HttpParams();
    if (usuarioId) {
      params = params.set('usuario_id', usuarioId.toString());
    }

    return this.http.get<{ ok: boolean; estadisticas: EstadisticasReporte }>(
      `${this.API_URL}/estadisticas`,
      { params }
    );
  }

  /**
   * Obtener color de badge según prioridad
   */
  getPrioridadColor(prioridad: string): string {
    switch (prioridad) {
      case 'Urgente':
        return 'danger';
      case 'Alta':
        return 'warning';
      case 'Media':
        return 'info';
      case 'Baja':
        return 'success';
      default:
        return 'secondary';
    }
  }

  /**
   * Obtener color de badge según estado
   */
  getEstadoColor(estado: string): string {
    switch (estado) {
      case 'Pendiente':
        return 'warning';
      case 'En Atención':
        return 'info';
      case 'Resuelto':
        return 'success';
      case 'Cancelado':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  /**
   * Obtener icono según tipo de problema
   */
  getTipoProblemaIcon(tipo: string): string {
    switch (tipo) {
      case 'Campaña':
        return 'pi pi-megaphone';
      case 'Diseño Web':
        return 'pi pi-palette';
      case 'Soporte Técnico':
        return 'pi pi-wrench';
      case 'Consulta General':
        return 'pi pi-question-circle';
      case 'Escalamiento':
        return 'pi pi-exclamation-triangle';
      case 'Seguimiento':
        return 'pi pi-eye';
      case 'Otro':
        return 'pi pi-ellipsis-h';
      default:
        return 'pi pi-file';
    }
  }
}
