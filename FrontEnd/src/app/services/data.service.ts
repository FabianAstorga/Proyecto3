import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export type UserRole = 'Administrador' | 'Funcionario' | 'Secretaria';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  password: string;
  photoUrl: string;
  horarioUrl: string;
}

export interface Activity {
  fecha: string;   // YYYY-MM-DD
  titulo: string;
  detalle: string;
  estado: string;  // 'Aprobada' | 'Pendiente' | etc.
  horas: number;
  userId: number;
}

export interface Cargo {
  role: UserRole;
  descripcion: string[];
}

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private usersUrl = 'assets/data/users.json';
  private activitiesUrl = 'assets/data/activities.json';
  private cargosUrl = 'assets/data/charges.json';

  constructor(private http: HttpClient) {}

  // 🔹 Usuarios

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.usersUrl);
  }

  getUserById(id: number): Observable<User | undefined> {
    return this.getUsers().pipe(
      map(users => users.find(u => u.id === id))
    );
  }

  // Simulación de login básica (email + password)
  login(email: string, password: string): Observable<User | null> {
    return this.getUsers().pipe(
      map(users => {
        const user = users.find(
          u => u.email.trim().toLowerCase() === email.trim().toLowerCase() &&
               (u.password ?? '').trim() === password.trim()
        );
        return user ?? null;
      })
    );
  }

  // 🔹 Actividades

  getAllActivities(): Observable<Activity[]> {
    return this.http.get<Activity[]>(this.activitiesUrl);
  }

  // Actividades de un usuario específico
  getActivitiesByUser(userId: number): Observable<Activity[]> {
    return this.getAllActivities().pipe(
      map(list => list.filter(a => a.userId === userId))
    );
  }

  // (Opcional) todas las actividades, excluyendo admin si algún día tuviera
  getActivitiesForFuncionarios(): Observable<Activity[]> {
    return this.getAllActivities().pipe(
      map(list => list.filter(a => a.userId !== 1))
    );
  }

  // 🔹 Cargos (descripción por rol)

  getCargos(): Observable<Cargo[]> {
    return this.http.get<Cargo[]>(this.cargosUrl);
  }

  getCargoByRole(role: UserRole): Observable<Cargo | undefined> {
    return this.getCargos().pipe(
      map(cargos => cargos.find(c => c.role === role))
    );
  }
}
