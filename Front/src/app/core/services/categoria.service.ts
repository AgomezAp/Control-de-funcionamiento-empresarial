import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AreaTipo, Categoria } from '../models/categoria.model';
import { BehaviorSubject, Observable, map, tap, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * Servicio para gestionar categorías
 * Ahora consume la API REST del backend en lugar de constantes hardcodeadas
 */
@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
  private apiUrl = `${environment.apiUrl}/categorias`;
  private categoriasSubject = new BehaviorSubject<Categoria[]>([]);
  public categorias$ = this.categoriasSubject.asObservable();

  // Cache local de categorías para evitar múltiples peticiones
  private categoriasCache: Categoria[] | null = null;

  constructor(private http: HttpClient) {
    // Cargar categorías al inicializar el servicio
    this.cargarCategorias();
  }

  /**
   * Carga todas las categorías desde el backend
   */
  private cargarCategorias(): void {
    this.http.get<{ success: boolean; data: Categoria[] }>(`${this.apiUrl}`)
      .pipe(
        map(response => response.data),
        tap(categorias => {
          this.categoriasCache = categorias;
          this.categoriasSubject.next(categorias);
        }),
        catchError(error => {
          console.error('Error al cargar categorías:', error);
          return of([]);
        })
      )
      .subscribe();
  }

  /**
   * Obtiene todas las categorías
   */
  getAll(): Observable<Categoria[]> {
    // Si hay cache, retornar cache
    if (this.categoriasCache) {
      return of(this.categoriasCache);
    }

    // Si no hay cache, hacer petición
    return this.http.get<{ success: boolean; data: Categoria[] }>(`${this.apiUrl}`)
      .pipe(
        map(response => response.data),
        tap(categorias => {
          this.categoriasCache = categorias;
          this.categoriasSubject.next(categorias);
        })
      );
  }

  /**
   * Obtiene categorías de Diseño
   */
  getDiseno(): Observable<Categoria[]> {
    return this.getByArea(AreaTipo.DISENO);
  }

  /**
   * Obtiene categorías de Pautas
   */
  getPautas(): Observable<Categoria[]> {
    return this.getByArea(AreaTipo.PAUTAS);
  }

  /**
   * Obtiene categorías de Gestión Administrativa
   */
  getGestionAdministrativa(): Observable<Categoria[]> {
    return this.getByArea(AreaTipo.GESTION_ADMINISTRATIVA);
  }

  /**
   * Obtiene categorías por área
   * Utiliza el endpoint específico del backend
   */
  getByArea(area: AreaTipo): Observable<Categoria[]> {
    return this.http.get<{ success: boolean; data: Categoria[] }>(`${this.apiUrl}/area/${area}`)
      .pipe(
        map(response => response.data)
      );
  }

  /**
   * Obtiene categoría por ID
   * Primero intenta buscar en cache, si no hace petición al backend
   */
  getById(id: number): Categoria | undefined {
    if (this.categoriasCache) {
      return this.categoriasCache.find(c => c.id === id);
    }
    return undefined;
  }

  /**
   * Obtiene categoría por ID de forma asíncrona
   */
  getByIdAsync(id: number): Observable<Categoria> {
    return this.http.get<{ success: boolean; data: Categoria }>(`${this.apiUrl}/${id}`)
      .pipe(
        map(response => response.data)
      );
  }

  /**
   * Obtiene categoría por nombre
   */
  getByNombre(nombre: string): Categoria | undefined {
    if (this.categoriasCache) {
      return this.categoriasCache.find(c => c.nombre === nombre);
    }
    return undefined;
  }

  /**
   * Verifica si requiere descripción extra
   */
  requiereDescripcionExtra(categoriaId: number): boolean {
    const categoria = this.getById(categoriaId);
    return categoria?.requiere_descripcion_extra || false;
  }

  /**
   * Verifica si es variable
   */
  esVariable(categoriaId: number): boolean {
    const categoria = this.getById(categoriaId);
    return categoria?.es_variable || false;
  }

  /**
   * Fuerza la recarga de categorías desde el backend
   */
  recargarCategorias(): void {
    this.categoriasCache = null;
    this.cargarCategorias();
  }
}