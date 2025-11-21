// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

interface DecodedToken {
  exp: number;
  sub: number;      
  correo: string;   
  rol: string;      
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'authToken';
  private readonly LAST_SESSION_KEY = 'lastSession';

  private readonly API_URL = 'http://localhost:3000'; 

  constructor(private router: Router, private http: HttpClient) {}

  // Guarda el token 
  loginUser(credentials: { correo: string; contrasena: string }): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/auth/login`, credentials).pipe(
      tap((response) => {
        // Si el backend devuelve { access_token: '...' }
        if (response && response.access_token) {
          this.saveToken(response.access_token);
        }
      })
    );
  }

  saveToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.LAST_SESSION_KEY, new Date().toISOString());
  }


  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);

    // localStorage.removeItem(this.LAST_SESSION_KEY);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private getDecodedToken(): DecodedToken | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      return jwtDecode<DecodedToken>(token);
    } catch (error) {
      console.error('Error decodificando el token:', error);
      return null;
    }
  }

  // -------- Helpers de sesión --------

  isLoggedIn(): boolean {
    const decodedToken = this.getDecodedToken();
    if (!decodedToken) return false;
    return Date.now() < decodedToken.exp * 1000;
  }

  getUserRole(): string | null {
    const decodedToken = this.getDecodedToken();
    return decodedToken ? decodedToken.rol : null;
  }

  getUserId(): number | null {
    const decodedToken = this.getDecodedToken();
    return decodedToken ? decodedToken.sub : null;
  }

  getUserEmail(): string | null {
    const decodedToken = this.getDecodedToken();
    return decodedToken ? decodedToken.correo : null;
  }

  /** Última sesión guardada en este navegador (ISO string) */
  getLastSessionISO(): string | null {
    return localStorage.getItem(this.LAST_SESSION_KEY);
  }

  // -------- Ruta home según rol --------
  /**
   * Devuelve la ruta "home" según el rol del usuario.
   * Si no hay usuario o rol, vuelve a '/'.
   */
  getHomeRouteForRole(): string {
    const role = this.getUserRole();
    const id = this.getUserId();

    if (!role || !id) {
      return '/';
    }

    switch (role.toLowerCase()) {
      case 'admin':
      case 'administrador':
        return `/admin/${id}/perfil`;
      case 'secretaria':
        return `/secretaria/${id}/perfil`;
      case 'funcionario':
        return `/funcionario/${id}/perfil`;
      case 'director':
        return `/director/${id}/perfil`;
      default:
        return '/';
    }
  }
}
