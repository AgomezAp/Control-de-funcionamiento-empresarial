import { Injectable } from '@angular/core';
import { CATEGORIAS_DISENO, CATEGORIAS_PAUTAS, TODAS_CATEGORIAS } from '../constants/categorias.constants';
import { AreaTipo, Categoria } from '../models/categoria.model';
import { BehaviorSubject, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
  private categoriasSubject = new BehaviorSubject<Categoria[]>(TODAS_CATEGORIAS as Categoria[]);
  public categorias$ = this.categoriasSubject.asObservable();

  constructor() {}

  // Obtener todas las categorías
  getAll(): Observable<Categoria[]> {
    return of(TODAS_CATEGORIAS as Categoria[]);
  }

  // Obtener categorías de Diseño
  getDiseno(): Observable<Categoria[]> {
    return of(CATEGORIAS_DISENO as Categoria[]);
  }

  // Obtener categorías de Pautas
  getPautas(): Observable<Categoria[]> {
    return of(CATEGORIAS_PAUTAS as Categoria[]);
  }

  // Obtener categorías por área
  getByArea(area: AreaTipo): Observable<Categoria[]> {
    const filtradas = TODAS_CATEGORIAS.filter(c => c.area_tipo === area);
    return of(filtradas as Categoria[]);
  }

  // Obtener categoría por ID
  getById(id: number): Categoria | undefined {
    return TODAS_CATEGORIAS.find(c => c.id === id) as Categoria | undefined;
  }

  // Obtener categoría por nombre
  getByNombre(nombre: string): Categoria | undefined {
    return TODAS_CATEGORIAS.find(c => c.nombre === nombre) as Categoria | undefined;
  }

  // Verificar si requiere descripción extra
  requiereDescripcionExtra(categoriaId: number): boolean {
    const categoria = this.getById(categoriaId);
    return categoria?.requiere_descripcion_extra || false;
  }

  // Verificar si es variable
  esVariable(categoriaId: number): boolean {
    const categoria = this.getById(categoriaId);
    return categoria?.es_variable || false;
  }
}