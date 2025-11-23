// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  exp: number;
  role: string;
  id: number;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'authToken';
  private readonly LAST_SESSION_KEY = 'lastSession';

  constructor(private router: Router) {}

  // Guarda el token (cuando el backend te lo entrega)
  login(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    // registra fecha/hora de esta sesión
    localStorage.setItem(this.LAST_SESSION_KEY, new Date().toISOString());
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    // si quieres mantener la última sesión, NO borres LAST_SESSION_KEY
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
    return decodedToken ? decodedToken.role : null;
  }

  getUserId(): number | null {
    const decodedToken = this.getDecodedToken();
    return decodedToken ? decodedToken.id : null;
  }

  getUserEmail(): string | null {
    const decodedToken = this.getDecodedToken();
    return decodedToken ? decodedToken.email : null;
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

    switch (role) {
      case 'Funcionario':
        return `/funcionario/perfil/${id}`;
      case 'Secretaria':
        return `/secretaria/perfil/${id}`;
      case 'Director':
        return `/director/perfil/${id}`;
      case 'Admin':
        return '/admin/dashboard';
      default:
        return '/';
    }
  }
}
