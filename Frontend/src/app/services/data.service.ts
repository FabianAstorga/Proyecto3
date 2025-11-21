// src/app/services/data.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'; // 👈 agrega HttpHeaders
import { Observable, map } from 'rxjs';

import { User } from '../models/user.model';
import { Activity } from '../models/activity.model';
import { Cargo } from '../models/charge.model';
import { AuthService } from './auth.service'; // 👈 importante

export type UserRole = User['role'];

interface BackendUser {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  rol: string;
  telefono: string;
  foto_url?: string;
}

interface LoginResponse {
  message: string;
  user: BackendUser;
  access_token: string;
}

// 👉 payload que enviaremos al backend para crear actividad
export interface CreateActividadPayload {
  titulo: string;
  descripcion: string;
  fecha: string;      // 'YYYY-MM-DD'
  tipo: string;
  estado: boolean;    // o number, según tu DTO (ajústalo si es 0/1)
  esRepetitiva: boolean;
}

@Injectable({ providedIn: 'root' })
export class DataService {
  private readonly apiUrl = 'http://localhost:3000';

  private readonly usuariosEndpoint = `${this.apiUrl}/users/getAll`;
  private readonly actividadesEndpoint = `${this.apiUrl}/actividades`;
  private readonly cargosEndpoint = `${this.apiUrl}/cargos`;
  private readonly loginEndpoint = `${this.apiUrl}/auth/login`;

  constructor(
    private http: HttpClient,
    private authService: AuthService   // 👈 para sacar el token
  ) {}

  // ------- helpers auth -------
  private getAuthOptions() {
    const token = this.authService.getToken();
    if (!token) return {};
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
      }),
    };
  }

  // ------- mapeo user backend -> front -------
  private mapBackendUser(u: BackendUser): User {
    return {
      id: u.id,
      firstName: u.nombre,
      lastName: u.apellido,
      email: u.correo,
      role: u.rol.charAt(0).toUpperCase() + u.rol.slice(1),
      password: undefined,
      photoUrl: u.foto_url ?? '/usuario(1).png',
    };
  }

  // ------- usuarios -------
  getUsers(): Observable<User[]> {
    return this.http
      .get<BackendUser[]>(this.usuariosEndpoint, this.getAuthOptions())
      .pipe(map((list) => list.map((u) => this.mapBackendUser(u))));
  }

  getUserById(id: number): Observable<User | undefined> {
    return this.getUsers().pipe(
      map((users) => users.find((u) => u.id === id))
    );
  }

  // ------- login real -------
  login(
    email: string,
    password: string
  ): Observable<{ user: User; token: string }> {
    return this.http
      .post<LoginResponse>(this.loginEndpoint, {
        correo: email,
        contrasena: password,
      })
      .pipe(
        map((res) => ({
          user: this.mapBackendUser(res.user),
          token: res.access_token,
        }))
      );
  }

  // ------- actividades -------
  getAllActivities(): Observable<Activity[]> {
    return this.http.get<Activity[]>(
      this.actividadesEndpoint,
      this.getAuthOptions()
    );
  }

  getActivitiesByUser(userId: number): Observable<Activity[]> {
    return this.http.get<Activity[]>(`${this.actividadesEndpoint}/usuario/${userId}`);
    // o, si tu endpoint es distinto:
    // return this.http.get<Activity[]>(`${this.actividadesEndpoint}/user/${userId}`);
  }

  // ⚠️ esto es ejemplo. Ajusta campos al DTO real de Nest (CreateActividadDto)
  crearActividad(payload: CreateActividadPayload): Observable<any> {
    return this.http.post(
      this.actividadesEndpoint,
      payload,
      this.getAuthOptions()
    );
  }

  // ------- cargos -------
  getCargos(): Observable<Cargo[]> {
    return this.http.get<Cargo[]>(this.cargosEndpoint, this.getAuthOptions());
  }

  getCargoByRole(role: UserRole): Observable<Cargo | undefined> {
    return this.getCargos().pipe(
      map((cargos) => cargos.find((c) => c.role === role))
    );
  }
}
