import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LayoutComponent } from '../../../shared/layout/layout.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { User } from '../../../models/user.model';
import { Activity } from '../../../models/activity.model';
import { Cargo } from '../../../models/charge.model';
import { switchMap, of } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-profile-home',
  imports: [CommonModule, RouterLink, LayoutComponent, HttpClientModule],
  templateUrl: './profile-home.component.html',
})
export class ProfileHomeComponent implements OnInit {
  user: User | undefined;

  recent: Activity[] = [];
  activitiesCount = 0;
  cargoDescripcion: string[] = [];
  notificationLabel = 'Urgente';
  lastSession = '2025-10-16 14:22';

  showDetails = false;

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
          this.activitiesCount = this.recent.length;
        }
      },
      error: (err) => console.error('Error cargando actividades:', err),
    });
  }

  loadCargos() {
    this.http.get<Cargo[]>('/assets/data/charges.json').subscribe((cargos) => {
      const cargo = cargos.find((c) => c.role === this.user?.role);
      this.cargoDescripcion = cargo ? cargo.descripcion : [];
    });
  }

  openDetails() {
    this.showDetails = true;
  }
  closeDetails() {
    this.showDetails = false;
  }

  onAvatarError(e: Event) {
    (e.target as HTMLImageElement).src = '/avatar.png';
  }
}
