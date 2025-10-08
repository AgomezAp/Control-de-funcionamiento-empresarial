import { Injectable } from '@angular/core';
import { StorageUtil } from '../utils/storage.util';
import { LoginRequest, LoginResponse, RegisterRequest, UsuarioAuth } from '../models/auth.model';
import { ApiResponse } from '../models/api-response.model';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api.constants';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<UsuarioAuth | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.checkAuthStatus();
  }

  // Login
  login(credentials: LoginRequest): Observable<ApiResponse<LoginResponse>> {
    return this.http.post<ApiResponse<LoginResponse>>(
      API_ENDPOINTS.AUTH.LOGIN, 
      credentials
    ).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.setSession(response.data);
        }
      })
    );
  }

  // Registro
  register(data: RegisterRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      API_ENDPOINTS.AUTH.REGISTRO, 
      data
    );
  }

  // Obtener perfil
  getPerfil(): Observable<ApiResponse<UsuarioAuth>> {
    return this.http.get<ApiResponse<UsuarioAuth>>(API_ENDPOINTS.AUTH.PERFIL);
  }

  // Logout
  logout(): void {
    StorageUtil.removeToken();
    StorageUtil.removeUser();
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/auth/login']);
  }

  // Establecer sesión
  private setSession(authResult: LoginResponse): void {
    StorageUtil.setToken(authResult.token);
    StorageUtil.setUser(authResult.usuario);
    this.currentUserSubject.next(authResult.usuario);
    this.isAuthenticatedSubject.next(true);
  }

  // Verificar estado de autenticación
  private checkAuthStatus(): void {
    const token = StorageUtil.getToken();
    const user = StorageUtil.getUser<UsuarioAuth>();

    if (token && user) {
      this.currentUserSubject.next(user);
      this.isAuthenticatedSubject.next(true);
    }
  }

  // Obtener usuario actual
  getCurrentUser(): UsuarioAuth | null {
    return this.currentUserSubject.value;
  }

  // Verificar si está autenticado
  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  // Obtener token
  getToken(): string | null {
    return StorageUtil.getToken();
  }

  // Verificar si el token ha expirado (básico)
  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000; // Convertir a milisegundos
      return Date.now() >= exp;
    } catch {
      return true;
    }
  }

  // Refrescar usuario actual
  refreshCurrentUser(): void {
    this.getPerfil().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          StorageUtil.setUser(response.data);
          this.currentUserSubject.next(response.data);
        }
      },
      error: () => {
        this.logout();
      }
    });
  }
}
