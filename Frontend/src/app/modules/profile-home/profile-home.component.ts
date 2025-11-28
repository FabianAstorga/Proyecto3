// src/app/modules/profile-home/profile-home.component.ts
import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";

import { LayoutComponent } from "../../components/layout/layout.component";
import { User } from "../../models/user.model";
import { Activity } from "../../models/activity.model";
import { Cargo } from "../../models/charge.model";
import { DataService } from "../../services/data.service";
import { AuthService } from "../../services/auth.service";

type RoleMode = "Funcionario" | "Secretaria" | "Administrador";

@Component({
  standalone: true,
  selector: "app-profile-home",
  imports: [CommonModule, LayoutComponent, RouterLink],
  templateUrl: "./profile-home.component.html",
})
export class ProfileHomeComponent implements OnInit {
  user: User | undefined;

  // ---- MODO / ROL ----
  mode: RoleMode | null = null;

  // ---- FUNCIONARIO ----
  recent: Activity[] = [];
  activitiesCount = 0;
  monthActivitiesCount = 0;
  pendingCount = 0;
  approvedCount = 0;

  lastActivity: Activity | undefined;
  mostFrequentTitle = "";
  daysSinceLastActivity: number | null = null;

  // ---- SECRETARÍA ----
  secretaryTotalActivities = 0;
  secretaryPendingCount = 0;
  secretaryApprovedCount = 0;
  secretaryUpcomingEventsCount = 0; // calculado desde tipo de actividad
  secretaryPendingActivities: Activity[] = [];

  // ---- ADMINISTRADOR ----
  adminTotalActivities = 0;
  adminMonthActivities = 0;
  adminPendingCount = 0;
  adminApprovedCount = 0;
  adminCargosCount = 0;
  adminRecentActivities: Activity[] = [];

  // ---- COMÚN ----
  cargoDescripcion: string[] = [];
  notificationLabel = "";
  lastSession = "";
  showDetails = false;

  constructor(
    private dataService: DataService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // 1) Próxima fecha de entrega (común)
    this.notificationLabel = this.computeNextDeliveryLabel();

    // 2) Última sesión guardada (común)
    const lastIso = this.authService.getLastSessionISO?.();
    this.lastSession = lastIso
      ? this.formatDateTime(new Date(lastIso))
      : "Sin registro de sesión";

    // 3) Siempre cargo mi perfil y, según rol, armo el dashboard
    this.dataService.getMyProfile().subscribe({
      next: (user) => {
        this.user = user;
        this.mode = this.mapRole(user.role);

        // Descripción de cargos (modal) para cualquier rol
        this.loadCargos(user.id);

        if (this.mode === "Funcionario") {
          this.loadFuncionarioDashboard(user.id);
        } else if (this.mode === "Secretaria") {
          this.loadSecretariaDashboard();
        } else if (this.mode === "Administrador") {
          this.loadAdminDashboard();
        }
      },
      error: (err) => {
        console.error("Error cargando mi perfil:", err);
      },
    });
  }

  // --------- Helpers de rol ---------

  private mapRole(role: string | undefined): RoleMode | null {
    if (!role) return null;
    if (role === "Funcionario") return "Funcionario";
    if (role === "Secretaria") return "Secretaria";
    if (role === "Administrador") return "Administrador";
    return null;
  }

  /** Próxima fecha de entrega (5 días antes del fin de mes) */
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
    const dd = String(day).padStart(2, "0");
    const mm = String(m).padStart(2, "0");
    return `${dd}/${mm}/${y}`;
  }

  private formatDateTime(d: Date): string {
    const datePart = this.formatDate(d);
    const hh = String(d.getHours()).padStart(2, "0");
    const mi = String(d.getMinutes()).padStart(2, "0");
    return `${datePart} ${hh}:${mi}`;
  }

  // ==========================================================
  // DASHBOARD FUNCIONARIO (igual al tuyo, sin "horas del mes")
  // ==========================================================

  private loadFuncionarioDashboard(userId: number): void {
    this.dataService.getActivitiesByUser(userId).subscribe({
      next: (activities) => {
        this.activitiesCount = activities.length;

        const sorted = [...activities].sort((a, b) =>
          a.fecha < b.fecha ? 1 : a.fecha > b.fecha ? -1 : 0
        );
        this.recent = sorted.slice(0, 10);
        this.lastActivity = sorted[0];

        this.computeFuncionarioMetrics(activities);
      },
      error: (err) => {
        console.error("Error cargando actividades (Funcionario):", err);
        this.activitiesCount = 0;
        this.recent = [];
      },
    });
  }

  private computeFuncionarioMetrics(activities: Activity[]): void {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    let monthCount = 0;
    let pending = 0;
    let approved = 0;
    const titleCount: Record<string, number> = {};

    for (const a of activities) {
      if (a.estado === "Pendiente") pending++;
      if (a.estado === "Aprobada") approved++;

      if (a.fecha) {
        const [yStr, mStr, dStr] = a.fecha.split("-");
        const y = Number(yStr);
        const m = Number(mStr) - 1;
        const d = Number(dStr);

        if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
          if (y === currentYear && m === currentMonth) {
            monthCount++;

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

    let maxTitle = "";
    let maxCount = 0;
    for (const [title, count] of Object.entries(titleCount)) {
      if (count > maxCount) {
        maxCount = count;
        maxTitle = title;
      }
    }
    this.mostFrequentTitle = maxTitle;

    if (this.lastActivity?.fecha) {
      const lastDate = new Date(this.lastActivity.fecha + "T00:00:00");
      const diffMs = today.getTime() - lastDate.getTime();
      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      this.daysSinceLastActivity = days >= 0 ? days : null;
    } else {
      this.daysSinceLastActivity = null;
    }
  }

  // ==========================================================
  // DASHBOARD SECRETARÍA (usa getAllActivities)
  // ==========================================================

  private loadSecretariaDashboard(): void {
    this.dataService.getAllActivities().subscribe({
      next: (activities: Activity[]) => {
        // Total actividades (por ahora globales; si después tienes "área"
        // se filtra acá).
        this.secretaryTotalActivities = activities.length;

        const pending = activities.filter((a) => a.estado === "Pendiente");
        const approved = activities.filter((a) => a.estado === "Aprobada");

        this.secretaryPendingCount = pending.length;
        this.secretaryApprovedCount = approved.length;

        // KPI de eventos: aproximación usando tipo === 'Evento'
        this.secretaryUpcomingEventsCount = activities.filter(
          (a) => a.tipo && a.tipo.toLowerCase() === "evento"
        ).length;

        // Lista de pendientes por funcionario, ordenadas por fecha desc
        this.secretaryPendingActivities = pending.sort((a, b) =>
          a.fecha < b.fecha ? 1 : a.fecha > b.fecha ? -1 : 0
        );
      },
      error: (err) => {
        console.error("Error cargando actividades (Secretaría):", err);
        this.secretaryTotalActivities = 0;
        this.secretaryPendingCount = 0;
        this.secretaryApprovedCount = 0;
        this.secretaryUpcomingEventsCount = 0;
        this.secretaryPendingActivities = [];
      },
    });
  }

  // ==========================================================
  // DASHBOARD ADMINISTRADOR (usa getAllActivities + getCargos)
  // ==========================================================

  private loadAdminDashboard(): void {
    this.dataService.getAllActivities().subscribe({
      next: (activities: Activity[]) => {
        this.adminTotalActivities = activities.length;

        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        let monthCount = 0;
        let pending = 0;
        let approved = 0;

        for (const a of activities) {
          if (a.estado === "Pendiente") pending++;
          if (a.estado === "Aprobada") approved++;

          if (a.fecha) {
            const [yStr, mStr, dStr] = a.fecha.split("-");
            const y = Number(yStr);
            const m = Number(mStr) - 1;
            const d = Number(dStr);
            if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
              if (y === currentYear && m === currentMonth) {
                monthCount++;
              }
            }
          }
        }

        this.adminMonthActivities = monthCount;
        this.adminPendingCount = pending;
        this.adminApprovedCount = approved;

        // Lista global de actividades recientes
        const sorted = [...activities].sort((a, b) =>
          a.fecha < b.fecha ? 1 : a.fecha > b.fecha ? -1 : 0
        );
        this.adminRecentActivities = sorted.slice(0, 10);
      },
      error: (err) => {
        console.error("Error cargando actividades (Admin):", err);
        this.adminTotalActivities = 0;
        this.adminMonthActivities = 0;
        this.adminPendingCount = 0;
        this.adminApprovedCount = 0;
        this.adminRecentActivities = [];
      },
    });

    // Conteo de cargos
    this.dataService.getCargos().subscribe({
      next: (cargos: Cargo[]) => {
        this.adminCargosCount = cargos.length;
      },
      error: (err) => {
        console.error("Error cargando cargos (Admin):", err);
        this.adminCargosCount = 0;
      },
    });
  }

  // --------- Cargos para descripción de rol (modal) ---------

  private loadCargos(userId: number): void {
    this.dataService.getCargosByUsuario(userId).subscribe({
      next: (cargos: Cargo[]) => {
        this.cargoDescripcion = cargos
          .map((c) => c.descripcion ?? "")
          .filter((d) => d.trim() !== "");
      },
      error: (err) => {
        console.error("Error cargando cargos desde DataService:", err);
        this.cargoDescripcion = [];
      },
    });
  }

  // --------- Utilidades ---------

  formatDMY(iso: string): string {
    if (!iso) return "";
    const [y, m, d] = iso.split("-").map(Number);
    if (!y || !m || !d) return iso;
    const dd = String(d).padStart(2, "0");
    const mm = String(m).padStart(2, "0");
    return `${dd}/${mm}/${y}`;
  }

  openDetails(): void {
    this.showDetails = true;
  }

  closeDetails(): void {
    this.showDetails = false;
  }

  onAvatarError(e: Event): void {
    (e.target as HTMLImageElement).src = "/avatar-de-usuario.png";
  }
}
