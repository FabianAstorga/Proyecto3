import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { LayoutComponent } from '../../components/layout/layout.component';
import { User } from '../../models/user.model';
import { Activity } from '../../models/activity.model';
import { Cargo } from '../../models/charge.model';
import { DataService } from '../../services/data.service';

@Component({
  standalone: true,
  selector: 'app-profile-home',
  imports: [CommonModule, LayoutComponent],
  templateUrl: './profile-home.component.html',
})
export class ProfileHomeComponent implements OnInit {
  user: User | undefined;

  recent: Activity[] = [];
  activitiesCount = 0;
  cargoDescripcion: string[] = [];

  // Por ahora estático; luego lo puedes alimentar desde backend
  notificationLabel = 'Urgente';
  lastSession = '2025-10-16 14:22';

  showDetails = false;

  constructor(
    private route: ActivatedRoute,
    private dataService: DataService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : NaN;

    if (!Number.isFinite(id)) {
      console.error('ID de usuario inválido en la ruta');
      return;
    }

    this.dataService.getUserById(id).subscribe({
      next: user => {
        this.user = user;
        if (!this.user) {
          console.error('Usuario no encontrado para id =', id);
          return;
        }

        this.loadActivities();
        this.loadCargos();
      },
      error: err => {
        console.error('Error cargando usuario por id:', err);
      },
    });
  }

  private loadActivities(): void {
    if (!this.user) return;

    this.dataService.getActivitiesByUser(this.user.id).subscribe({
      next: activities => {
        // total KPIs
        this.activitiesCount = activities.length;

        // últimas 10 actividades ordenadas por fecha descendente
        this.recent = [...activities]
          .sort((a, b) => (a.fecha < b.fecha ? 1 : a.fecha > b.fecha ? -1 : 0))
          .slice(0, 10);
      },
      error: err => {
        console.error('Error cargando actividades desde DataService:', err);
      },
    });
  }

  private loadCargos(): void {
    if (!this.user) return;

    this.dataService.getCargoByRole(this.user.role as any).subscribe({
      next: (cargo: Cargo | undefined) => {
        this.cargoDescripcion = cargo?.descripcion ?? [];
      },
      error: err => {
        console.error('Error cargando cargos desde DataService:', err);
      },
    });
  }

  // Utilidad para mostrar fecha en dd/mm/aaaa
  formatDMY(iso: string): string {
    if (!iso) return '';
    const [y, m, d] = iso.split('-').map(Number);
    if (!y || !m || !d) return iso;
    const dd = String(d).padStart(2, '0');
    const mm = String(m).padStart(2, '0');
    return `${dd}/${mm}/${y}`;
  }

  openDetails(): void {
    this.showDetails = true;
  }

  closeDetails(): void {
    this.showDetails = false;
  }

  onAvatarError(e: Event): void {
    (e.target as HTMLImageElement).src = '/avatar.png';
  }
}
