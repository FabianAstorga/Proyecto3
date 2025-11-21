// src/app/services/data.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { User } from '../models/user.model';
import { Activity } from '../models/activity.model';
import { Cargo } from '../models/charge.model';
import { AuthService } from './auth.service';

export type UserRole = User['role'];

// ====== Interfaces que representan lo que manda el BACKEND ======

interface BackendUser {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  rol: string;        // 'funcionario' | 'secretaria' | 'administrador'
  telefono: string;
  foto_url?: string | null;
}

interface LoginResponse {
  message: string;
  user: BackendUser;
  access_token: string;
}

interface BackendActividad {
  id_actividad: number;
  titulo: string;
  descripcion: string;
  fecha: string;       // 'YYYY-MM-DD'
  tipo: string;
  estado: boolean;     // true / false
  esRepetitiva: boolean;
  usuario: BackendUser | null; // puede venir null si no hay usuario
  informe: any | null;
}

// payload ejemplo para crear actividad
export interface CreateActividadPayload {
  titulo: string;
  descripcion: string;
  fecha: string;      // 'YYYY-MM-DD'
  tipo: string;
  estado: boolean;    // o number, según tu DTO
  esRepetitiva: boolean;
}

// ================================================================
@Injectable({ providedIn: 'root' })
export class DataService {
  private readonly apiUrl = 'http://localhost:3000';

  private readonly usuariosEndpoint = `${this.apiUrl}/users/getAll`;
  private readonly actividadesEndpoint = `${this.apiUrl}/actividades`;
  private readonly cargosEndpoint = `${this.apiUrl}/cargos`;
  private readonly loginEndpoint = `${this.apiUrl}/auth/login`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
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
      // pasa de 'funcionario' -> 'Funcionario', etc.
      role: u.rol.charAt(0).toUpperCase() + u.rol.slice(1),
      password: undefined,
      photoUrl: u.foto_url ?? '/usuario(1).png',
    };
  }

  // ------- mapeo actividad backend -> front -------
  private mapBackendActividad(a: BackendActividad): Activity {
    // 1) estado boolean -> string para el front
    const estado: Activity['estado'] =
      a.estado === true ? 'Aprobada' : 'Pendiente'; // ajusta si quieres otro texto

    // 2) nombre del usuario
    const userId = a.usuario ? a.usuario.id : null;
    const userName = a.usuario
      ? `${a.usuario.nombre} ${a.usuario.apellido}`
      : 'Usuario sin asignar';

    return {
      // estos campos deben existir en tu Activity model
      id: a.id_actividad,
      titulo: a.titulo,
      detalle: a.descripcion ?? '',
      fecha: a.fecha,
      tipo: a.tipo,
      horas: 0, // si aún no manejan horas reales, deja 0
      estado,
      userId,
      userName,
    };
  }

  // ================= USUARIOS =================

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

  // ================= LOGIN REAL =================

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

  // ================= ACTIVIDADES =================

  getAllActivities(): Observable<Activity[]> {
    return this.http
      .get<BackendActividad[]>(this.actividadesEndpoint, this.getAuthOptions())
      .pipe(map((list) => list.map((a) => this.mapBackendActividad(a))));
  }



  getActivitiesByUser(userId: number): Observable<Activity[]> {
    return this.http
      .get<BackendActividad[]>(
        `${this.actividadesEndpoint}/usuario/${userId}`,
        this.getAuthOptions()
      )
      .pipe(map((list) => list.map((a) => this.mapBackendActividad(a))));
  }

  crearActividad(payload: CreateActividadPayload): Observable<any> {
    return this.http.post(
      this.actividadesEndpoint,
      payload,
      this.getAuthOptions()
    );
  }

  // ================= CARGOS =================

  getCargos(): Observable<Cargo[]> {
    return this.http.get<Cargo[]>(
      this.cargosEndpoint,
      this.getAuthOptions()
    );
  }

  getCargoByRole(role: UserRole): Observable<Cargo | undefined> {
    return this.getCargos().pipe(
      map((cargos) => cargos.find((c) => c.role === role))
    );
  }
}
