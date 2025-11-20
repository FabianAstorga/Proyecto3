import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { User } from '../models/user.model';
import { Activity } from '../models/activity.model';
import { Cargo } from '../models/charge.model';

export type UserRole = User['role'];

@Injectable({
  providedIn: 'root'
})
export class DataService {

  // 👉 Aquí va la URL base de tu backend Nest
  private readonly apiUrl = 'http://localhost:3000'; // o la que uses

  // Y ahora las URLs usan esa base:
  private usersUrl = `${this.apiUrl}/users`;
  private activitiesUrl = `${this.apiUrl}/activities`;
  private cargosUrl = `${this.apiUrl}/cargos`;

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

  login(email: string, password: string): Observable<User | null> {
    return this.getUsers().pipe(
      map(users => {
        const user = users.find(
          u =>
            u.email.trim().toLowerCase() === email.trim().toLowerCase() &&
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

  getActivitiesByUser(userId: number): Observable<Activity[]> {
    return this.getAllActivities().pipe(
      map(list => list.filter(a => a.userId === userId))
    );
  }

  getActivitiesForFuncionarios(): Observable<Activity[]> {
    return this.getAllActivities().pipe(
      map(list => list.filter(a => a.userId !== 1))
    );
  }

  // 🔹 Cargos

  getCargos(): Observable<Cargo[]> {
    return this.http.get<Cargo[]>(this.cargosUrl);
  }

  getCargoByRole(role: UserRole): Observable<Cargo | undefined> {
    return this.getCargos().pipe(
      map(cargos => cargos.find(c => c.role === role))
    );
  }
}
