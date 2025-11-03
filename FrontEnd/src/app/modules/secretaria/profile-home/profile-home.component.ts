import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { switchMap, of } from 'rxjs';

import { User } from '../../../models/user.model';
import { Activity } from '../../../models/activity.model';
import { Cargo } from '../../../models/charge.model';

import {
  LayoutComponent,
  NavItem,
} from '../../../components/layout/layout.component';
import { SECRETARIA_NAV_ITEMS } from './secretaria.nav';

type Gestion = {
  fecha: string;
  titulo: string;
  detalle: string;
  estado: 'Completada' | 'Pendiente' | 'Rechazada';
  duracion: number;
};

@Component({
  standalone: true,
  selector: 'app-profile-home',
  imports: [CommonModule, RouterLink, LayoutComponent, HttpClientModule],
  templateUrl: './profile-home.component.html',
})
export class ProfileHomeComponent implements OnInit {
  user: User | undefined;

  // KPIs (calculados desde activities.json)
  tasksCount = 0;
  notificationLabel = '—';
  lastSession = '—';

  recent: Activity[] = [];
  cargoDescripcion: string[] = [];

  // Modal
  showDetails = false;

  get secretariaNavItems(): NavItem[] {
    const userId = this.user?.id || 0;
    const items = [...SECRETARIA_NAV_ITEMS];
    const perfilItem = items.find((item) => item.label === 'Inicio perfil');
    if (perfilItem) perfilItem.link = `/secretaria/perfil/${userId}`;
    return items;
  }

  constructor(private http: HttpClient, private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const id = params.get('id');
          if (!id) return of(undefined);

          // 1) Cargar usuario desde users.json
          return this.http.get<User[]>('/assets/data/users.json').pipe(
            switchMap((users) => {
              this.user = users.find((u) => u.id === +id);
              return of(this.user);
            })
          );
        })
      )
      .subscribe(() => {
        if (this.user) {
          // 2) Cargar actividades y KPIs desde activities.json
          this.loadActivities();

          // 3) Cargar descripción del cargo desde charges.json
          this.loadCargos();
        }
      });
  }

  private loadActivities() {
    this.http.get<Activity[]>('/assets/data/activities.json').subscribe({
      next: (activities) => {
        if (!this.user) return;

        // Del JSON: todas las actividades del usuario
        this.recent = activities
          .filter((a) => a.userId === this.user!.id)
          .sort((a, b) => (a.fecha < b.fecha ? 1 : a.fecha > b.fecha ? -1 : 0));

        // KPIs calculados desde el JSON
        this.tasksCount = this.recent.length;

        const pendientes = this.recent.filter((a) => a.estado === 'Pendiente').length;
        this.notificationLabel = pendientes > 0 ? `${pendientes} pendientes` : 'Sin pendientes';

        // “Última sesión” = fecha más reciente encontrada en sus actividades
        this.lastSession = this.recent.length > 0 ? this.recent[0].fecha : '—';
      },
      error: (err) => console.error('Error cargando actividades:', err),
    });
  }

  private loadCargos() {
    this.http.get<Cargo[]>('/assets/data/charges.json').subscribe({
      next: (cargos) => {
        if (!this.user) return;
        const cargo = cargos.find((c) => c.role === this.user!.role);
        this.cargoDescripcion = cargo ? cargo.descripcion : [];
      },
      error: (err) => console.error('Error cargando cargos:', err),
    });
  }

  getGestionState(estado: Activity['estado']): Gestion['estado'] {
    const map: Record<Activity['estado'], Gestion['estado']> = {
      Aprobada: 'Completada',
      Pendiente: 'Pendiente',
      Rechazada: 'Rechazada',
    };
    return map[estado];
  }

  // Modal
  openDetails() { this.showDetails = true; }
  closeDetails() { this.showDetails = false; }

  onAvatarError(e: Event) {
    (e.target as HTMLImageElement).src = '/avatar.png';
  }
}
