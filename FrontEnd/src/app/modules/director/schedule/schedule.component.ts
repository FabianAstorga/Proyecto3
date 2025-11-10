import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { LayoutComponent } from '../../../components/layout/layout.component';
import { DIRECTOR_NAV_ITEMS } from '../profile-home/director.nav';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  password: string;
  photoUrl: string;
  horarioUrl: string;
}

@Component({
  standalone: true,
  selector: 'app-schedule',
  imports: [CommonModule, LayoutComponent, HttpClientModule],
  templateUrl: './schedule.component.html',
})
export class ScheduleComponent implements OnInit {
  // === NAV ===
  readonly DIRECTOR_NAV_ITEMS = DIRECTOR_NAV_ITEMS;

  // === Datos de pantalla ===
  titulo = 'Horario';
  nombreParaTitulo = 'Cargando…';
  horarioUrl = '/horario_secretaria.png';

  constructor(private http: HttpClient, private route: ActivatedRoute) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');

    this.http.get<User[]>('/assets/data/users.json').subscribe({
      next: (users) => {
        let user: User | undefined;

        if (idParam) {
          user = users.find((u) => u.id === +idParam);
        }

        // Si no hay id, toma al primer usuario con rol Director
        if (!user) {
          user =
            users.find((u) => u.role.toLowerCase() === 'director') ??
            users[0];
        }

        if (user) {
          const primerNombre = user.firstName.split(' ')[0] ?? user.firstName;
          const primerApellido = user.lastName.split(' ')[0] ?? user.lastName;

          this.nombreParaTitulo = `${primerNombre} ${primerApellido}`;
          this.horarioUrl = user.horarioUrl || '/horario_secretaria.png';
        } else {
          this.nombreParaTitulo = 'Usuario no encontrado';
        }
      },
      error: (err) => {
        console.error('Error cargando users.json:', err);
        this.nombreParaTitulo = 'Error cargando usuario';
      },
    });
  }
}
