// src/app/services/data.service.ts
import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, map } from "rxjs";

import { User } from "../models/user.model";
import { Activity } from "../models/activity.model";
import { Cargo } from "../models/charge.model";
import { AuthService } from "./auth.service";
import { CreateActividadPayload } from "./backend/activity-backend.model";
import { LoginResponse } from "./backend/logindata-backend.model";
import { BackendUser } from "./backend/user-backend.model";
import { BackendActividad } from "./backend/activity-backend2.model";
import { EmpleadoCargo } from "./backend/charge-backend.model";

export type UserRole = User["role"];

@Injectable({ providedIn: "root" })
export class DataService {
  private readonly apiUrl = "http://localhost:3000";

  //Estandarizado, solo se llama a la ruta maestra (controlador)
  private readonly usuariosEndpoint = `${this.apiUrl}/users`;
  private readonly empleadoCargoEndpoint = `${this.apiUrl}/employee-charge`;
  private readonly actividadesEndpoint = `${this.apiUrl}/actividades`;
  private readonly cargosEndpoint = `${this.apiUrl}/charges`;
  private readonly loginEndpoint = `${this.apiUrl}/auth/login`;

  constructor(private http: HttpClient, private authService: AuthService) {}

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
      photoUrl: u.foto_url ?? "/usuario(1).png",
    };
  }

  // ------- mapeo actividad backend -> front -------
  private mapBackendActividad(a: BackendActividad): Activity {
    // 1) estado boolean -> string para el front
    const estado: Activity["estado"] =
      a.estado === true ? "Aprobada" : "Pendiente"; // ajusta si quieres otro texto

    // 2) nombre del usuario
    const userId = a.usuario ? a.usuario.id : null;
    const userName = a.usuario
      ? `${a.usuario.nombre} ${a.usuario.apellido}`
      : "Usuario sin asignar";

    return {
      // estos campos deben existir en tu Activity model
      id: a.id_actividad,
      titulo: a.titulo,
      detalle: a.descripcion ?? "",
      fecha: a.fecha,
      tipo: a.tipo,
      horas: 0, // si aún no manejan horas reales, deja 0
      estado,
      userId,
      userName,
    };
  }

  // ================= USUARIO - CRUD =================

  getUsers(): Observable<User[]> {
    return this.http
      .get<BackendUser[]>(`${this.usuariosEndpoint}/get`, this.getAuthOptions())
      .pipe(map((list) => list.map((u) => this.mapBackendUser(u))));
  }

  getUser(id: number): Observable<User> {
    return this.http
      .get<BackendUser>(
        `${this.usuariosEndpoint}/get/${id}`,
        this.getAuthOptions()
      )
      .pipe(map((u) => this.mapBackendUser(u)));
  }

  createUser(payload: any): Observable<any> {
    return this.http.post(
      `${this.usuariosEndpoint}/create`,
      payload,
      this.getAuthOptions()
    );
  }

  updateUser(id: number, payload: any): Observable<any> {
    return this.http.patch(
      `${this.usuariosEndpoint}/update/${id}`,
      payload,
      this.getAuthOptions()
    );
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(
      `${this.usuariosEndpoint}/delete/${id}`,
      this.getAuthOptions()
    );
  }

  getMyProfile(): Observable<User> {
    return this.http
      .get<BackendUser>(
        `${this.usuariosEndpoint}/getProfile`,
        this.getAuthOptions()
      )
      .pipe(map((u) => this.mapBackendUser(u)));
  }

  // Actualizar mi propio perfil
  updateMyProfile(payload: any): Observable<any> {
    return this.http.patch(
      `${this.usuariosEndpoint}/updateProfile`,
      payload,
      this.getAuthOptions()
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

  // ================= CARGOS - CRUD =================
  createCargo(payload: any): Observable<any> {
    // POST /charges/create
    return this.http.post(
      `${this.cargosEndpoint}/create`,
      payload,
      this.getAuthOptions()
    );
  }

  updateCargo(id: number, payload: any): Observable<any> {
    // PATCH /charges/update/:id
    return this.http.patch(
      `${this.cargosEndpoint}/update/${id}`,
      payload,
      this.getAuthOptions()
    );
  }

  deleteCargo(id: number): Observable<any> {
    // DELETE /charges/delete/:id
    return this.http.delete(
      `${this.cargosEndpoint}/delete/${id}`,
      this.getAuthOptions()
    );
  }

  getCargo(id: number): Observable<Cargo> {
    // GET /charges/get/:id
    return this.http.get<Cargo>(
      `${this.cargosEndpoint}/get/${id}`,
      this.getAuthOptions()
    );
  }

  getCargos(): Observable<Cargo[]> {
    // GET /charges/get
    return this.http.get<Cargo[]>(
      `${this.cargosEndpoint}/get`,
      this.getAuthOptions()
    );
  }

  // ================= EMPLEADO-CARGO - CRUD =================

  // Crear asignación (asignar cargo a usuario) -> POST /employee-charge/create
  createEmpleadoCargo(payload: {
    usuarioId: number;
    cargoId: number;
  }): Observable<EmpleadoCargo> {
    return this.http.post<EmpleadoCargo>(
      `${this.empleadoCargoEndpoint}/create`,
      payload,
      this.getAuthOptions()
    );
  }

  // Obtener todas las asignaciones -> GET /employee-charge/get
  getEmpleadoCargos(): Observable<EmpleadoCargo[]> {
    return this.http.get<EmpleadoCargo[]>(
      `${this.empleadoCargoEndpoint}/get`,
      this.getAuthOptions()
    );
  }

  // Obtener asignación por ID -> GET /employee-charge/get/:id
  getEmpleadoCargo(id: number): Observable<EmpleadoCargo> {
    return this.http.get<EmpleadoCargo>(
      `${this.empleadoCargoEndpoint}/get/${id}`,
      this.getAuthOptions()
    );
  }

  // Actualizar asignación (cambiar el cargo de un usuario) -> PUT /employee-charge/update/:id
  updateEmpleadoCargo(
    id: number,
    payload: { usuarioId?: number; cargoId?: number }
  ): Observable<EmpleadoCargo> {
    return this.http.put<EmpleadoCargo>(
      `${this.empleadoCargoEndpoint}/update/${id}`,
      payload,
      this.getAuthOptions()
    );
  }

  // Eliminar asignación -> DELETE /employee-charge/delete/:id
  deleteEmpleadoCargo(id: number): Observable<any> {
    return this.http.delete(
      `${this.empleadoCargoEndpoint}/delete/${id}`,
      this.getAuthOptions()
    );
  }

  // Obtener todos los cargos de un usuario específico
  getCargosByUsuario(usuarioId: number): Observable<Cargo[]> {
    return this.getEmpleadoCargos().pipe(
      map((list) =>
        list.filter((ec) => ec.usuario.id === usuarioId).map((ec) => ec.cargo)
      )
    );
  }
}

export type { CreateActividadPayload };
