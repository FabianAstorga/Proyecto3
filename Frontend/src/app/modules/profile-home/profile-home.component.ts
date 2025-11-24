// src/app/modules/profile-home/profile-home.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { LayoutComponent } from '../../components/layout/layout.component';
import { User } from '../../models/user.model';
import { Activity } from '../../models/activity.model';
import { Cargo } from '../../models/charge.model';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-profile-home',
  imports: [CommonModule, LayoutComponent, RouterLink],
  templateUrl: './profile-home.component.html',
})
export class ProfileHomeComponent implements OnInit {
  user: User | undefined;

  recent: Activity[] = [];
  activitiesCount = 0;
  cargoDescripcion: string[] = [];

  // KPIs adicionales
  monthActivitiesCount = 0;
  pendingCount = 0;
  approvedCount = 0;
  monthHours = 0;

  // Resúmenes
  lastActivity: Activity | undefined;
  mostFrequentTitle = '';

  // Dinámicos
  notificationLabel = '';
  lastSession = '';
  daysSinceLastActivity: number | null = null;

  showDetails = false;

  constructor(
    private route: ActivatedRoute,
    private dataService: DataService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // 1) Próxima fecha de entrega
    this.notificationLabel = this.computeNextDeliveryLabel();

    // 2) Última sesión guardada (desde AuthService)
    const lastIso = this.authService.getLastSessionISO?.();
    if (lastIso) {
      const d = new Date(lastIso);
      this.lastSession = this.formatDateTime(d);
    } else {
      this.lastSession = 'Sin registro de sesión';
    }

    // 3) Resolver fuente de usuario: por ruta o perfil propio
    const idFromRoute = this.route.snapshot.paramMap.get('id');

    const source$ = idFromRoute && !Number.isNaN(Number(idFromRoute))
      ? this.dataService.getUser(Number(idFromRoute))
      : this.dataService.getMyProfile();

    source$.subscribe({
      next: user => {
        this.user = user;
        // Cargar actividades y cargos del usuario real
        this.loadActivities(user.id);
        this.loadCargos(user.id);
      },
      error: err => {
        console.error('Error cargando usuario en profile-home:', err);
      },
    });
  }

  /** Calcula la próxima fecha de entrega (5 días antes del fin de mes) */
  private computeNextDeliveryLabel(): string {
    const today = new Date();
    const nextDue = this.getNextDueDate(today);
    const formatted = this.formatDate(nextDue);
    return `La entrega es el ${formatted}`;
  }

  private getNextDueDate(from: Date): Date {
    let year = from.getFullYear();
    let month = from.getMonth();

    let lastDayOfMonth = new Date(year, month + 1, 0);
    let due = new Date(lastDayOfMonth);
    due.setDate(lastDayOfMonth.getDate() - 5);

    if (from > due) {
      month += 1;
      if (month > 11) {
        month = 0;
        year += 1;
      }
      lastDayOfMonth = new Date(year, month + 1, 0);
      due = new Date(lastDayOfMonth);
      due.setDate(lastDayOfMonth.getDate() - 5);
    }

    return due;
  }

  private formatDate(d: Date): string {
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const day = d.getDate();
    const dd = String(day).padStart(2, '0');
    const mm = String(m).padStart(2, '0');
    return `${dd}/${mm}/${y}`;
  }

  private formatDateTime(d: Date): string {
    const datePart = this.formatDate(d);
    const hh = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');
    return `${datePart} ${hh}:${mi}`;
  }

  // --------- Actividades ---------

  private loadActivities(userId: number): void {
    this.dataService.getActivitiesByUser(userId).subscribe({
      next: activities => {
        this.activitiesCount = activities.length;

        const sorted = [...activities].sort((a, b) =>
          a.fecha < b.fecha ? 1 : a.fecha > b.fecha ? -1 : 0
        );
        this.recent = sorted.slice(0, 10);
        this.lastActivity = sorted[0];

        this.computeActivityMetrics(activities);
      },
      error: err => {
        console.error('Error cargando actividades desde DataService:', err);
        this.activitiesCount = 0;
        this.recent = [];
      },
    });
  }

  private computeActivityMetrics(activities: Activity[]): void {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    let monthCount = 0;
    let pending = 0;
    let approved = 0;
    let monthHours = 0;
    const titleCount: Record<string, number> = {};

    for (const a of activities) {
      if (a.estado === 'Pendiente') pending++;
      if (a.estado === 'Aprobada') approved++;

      if (a.fecha) {
        const [yStr, mStr, dStr] = a.fecha.split('-');
        const y = Number(yStr);
        const m = Number(mStr) - 1;
        const d = Number(dStr);

        if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
          if (y === currentYear && m === currentMonth) {
            monthCount++;
            const horasNum = Number(a.horas) || 0;
            monthHours += horasNum;

            if (a.titulo) {
              titleCount[a.titulo] = (titleCount[a.titulo] ?? 0) + 1;
            }
          }
        }
      }
    }

    this.monthActivitiesCount = monthCount;
    this.pendingCount = pending;
    this.approvedCount = approved;
    this.monthHours = monthHours;

    let maxTitle = '';
    let maxCount = 0;
    for (const [title, count] of Object.entries(titleCount)) {
      if (count > maxCount) {
        maxCount = count;
        maxTitle = title;
      }
    }
    this.mostFrequentTitle = maxTitle;

    if (this.lastActivity?.fecha) {
      const lastDate = new Date(this.lastActivity.fecha + 'T00:00:00');
      const diffMs = today.getTime() - lastDate.getTime();
      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      this.daysSinceLastActivity = days >= 0 ? days : null;
    } else {
      this.daysSinceLastActivity = null;
    }
  }

  // --------- Cargos ---------

  private loadCargos(userId: number): void {
    this.dataService.getCargosByUsuario(userId).subscribe({
      next: (cargos: Cargo[]) => {
        this.cargoDescripcion = cargos
          .map(c => c.descripcion ?? '')
          .filter(d => d.trim() !== '');
      },
      error: err => {
        console.error('Error cargando cargos desde DataService:', err);
        this.cargoDescripcion = [];
      },
    });
  }

  // Utilidad para mostrar fecha en dd/mm/aaaa (para las actividades)
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
    (e.target as HTMLImageElement).src = '/avatar-de-usuario.png';
  }
}
