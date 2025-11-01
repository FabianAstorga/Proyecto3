import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { User } from '../../../models/user.model';
import { Activity } from '../../../models/activity.model';
import { Cargo } from '../../../models/charge.model';
import { switchMap, of } from 'rxjs';
import {
  LayoutComponent,
  NavItem,
} from '../../../shared/layout/layout.component';
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
  // Inicializar vacío para que se llene dinámicamente
  user: User | undefined;

  tasksCount = 27;
  notificationLabel = '2 nuevas';
  lastSession = '2025-10-30 09:48';

  recent: Activity[] = [];
  cargoDescripcion: string[] = [];

  // Modal
  showDetails = false;

  get secretariaNavItems(): NavItem[] {
    const userId = this.user?.id || 0; // Obtiene el ID real o 0 si no está cargado
    const items = [...SECRETARIA_NAV_ITEMS];

    // Busca el ítem del perfil
    const perfilItem = items.find((item) => item.label === 'Inicio perfil');

    if (perfilItem) {
      // Reemplaza el placeholder :id con el valor real
      perfilItem.link = `/secretaria/perfil/${userId}`;
    }

    return items;
  }

  constructor(private http: HttpClient, private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const id = params.get('id');
          if (id) {
            return this.http.get<User[]>('/assets/data/users.json').pipe(
              switchMap((users) => {
                this.user = users.find((u) => u.id === +id);
                return of(this.user);
              })
            );
          }
          return of(undefined);
        })
      )
      .subscribe(() => {
        // Al asignar this.user, el getter se actualizará automáticamente la próxima vez que el DOM lo pida.
        if (this.user) {
          this.loadActivities();
          this.loadCargos();
        }
      });
  }

  loadActivities() {
    this.http.get<Activity[]>('/assets/data/activities.json').subscribe({
      next: (activities) => {
        if (this.user) {
          this.recent = activities.filter((a) => a.userId === this.user?.id);
          this.tasksCount = this.recent.length;
        }
      },
      error: (err) => console.error('Error cargando actividades:', err),
    });
  }

  loadCargos() {
    this.http.get<Cargo[]>('/assets/data/charges.json').subscribe({
      next: (cargos) => {
        if (this.user) {
          const cargo = cargos.find((c) => c.role === this.user?.role);
          this.cargoDescripcion = cargo ? cargo.descripcion : [];
        }
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

  openDetails() {
    this.showDetails = true;
  }
  closeDetails() {
    this.showDetails = false;
  }

  onAvatarError(e: Event) {
    // Si la URL de la foto falla, usa una imagen de avatar predeterminada
    (e.target as HTMLImageElement).src = '/avatar.png';
  }
}
