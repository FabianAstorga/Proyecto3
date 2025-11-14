import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LayoutComponent } from '../../components/layout/layout.component';
import { User } from '../../models/user.model';
import { Activity } from '../../models/activity.model';
import { Cargo } from '../../models/charge.model';
import { DataService } from '../../services/data.service';

@Component({
  standalone: true,
  selector: 'app-profile-home',
  imports: [CommonModule, RouterLink, LayoutComponent],
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

  constructor(
    private route: ActivatedRoute,
    private dataService: DataService
  ) {}

  ngOnInit() {
    // Tomamos el :id de la ruta y cargamos el usuario desde DataService
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : NaN;

    if (!Number.isFinite(id)) {
      console.error('ID de usuario inválido en la ruta');
      return;
    }

    this.dataService.getUserById(id).subscribe(user => {
      this.user = user;
      if (!this.user) {
        console.error('Usuario no encontrado para id =', id);
        return;
      }

      // Una vez que tenemos usuario, cargamos actividades y descripción del cargo
      this.loadActivities();
      this.loadCargos();
    });
  }

  loadActivities() {
    if (!this.user) return;

    this.dataService.getActivitiesByUser(this.user.id).subscribe({
      next: (activities) => {
        this.recent = activities;
        this.activitiesCount = activities.length;
      },
      error: (err) =>
        console.error('Error cargando actividades desde DataService:', err),
    });
  }

  loadCargos() {
    if (!this.user) return;

    this.dataService.getCargoByRole(this.user.role as any).subscribe({
      next: (cargo: Cargo | undefined) => {
        this.cargoDescripcion = cargo ? cargo.descripcion : [];
      },
      error: (err) =>
        console.error('Error cargando cargos desde DataService:', err),
    });
  }

  openDetails() { this.showDetails = true; }
  closeDetails() { this.showDetails = false; }
  onAvatarError(e: Event) { (e.target as HTMLImageElement).src = '/avatar.png'; }
}
