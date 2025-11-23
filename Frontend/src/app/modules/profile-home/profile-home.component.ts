import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute } from "@angular/router";

import { LayoutComponent } from "../../components/layout/layout.component";
import { User } from "../../models/user.model";
import { Activity } from "../../models/activity.model";
import { Cargo } from "../../models/charge.model";
import { DataService } from "../../services/data.service";
import { AuthService } from "../../services/auth.service";

@Component({
  standalone: true,
  selector: "app-profile-home",
  imports: [CommonModule, LayoutComponent],
  templateUrl: "./profile-home.component.html",
})
export class ProfileHomeComponent implements OnInit {
  user: User | undefined;

  recent: Activity[] = [];
  activitiesCount = 0;
  cargoDescripcion: string[] = [];

  // Dinámicos
  notificationLabel = "";
  lastSession = "";

  showDetails = false;

  constructor(
    private route: ActivatedRoute,
    private dataService: DataService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // 1) Calcula la próxima fecha de entrega
    this.notificationLabel = this.computeNextDeliveryLabel();

    // 2) Última sesión real registrada en este navegador
    const lastIso = this.authService.getLastSessionISO();
    if (lastIso) {
      const d = new Date(lastIso);
      this.lastSession = this.formatDateTime(d); // dd/mm/aaaa HH:MM
    } else {
      this.lastSession = "Sin registro de sesión";
    }

    // 3) Carga de usuario + datos
    const idParam = this.route.snapshot.paramMap.get("id");
    const id = idParam ? Number(idParam) : NaN;

    if (!Number.isFinite(id)) {
      console.error("ID de usuario inválido en la ruta");
      return;
    }

    this.dataService.getUser(id).subscribe({
      next: (user) => {
        this.user = user;
        if (!this.user) {
          console.error("Usuario no encontrado para id =", id);
          return;
        }

        this.loadActivities();
        this.loadCargos();
      },
      error: (err) => {
        console.error("Error cargando usuario por id:", err);
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

  /**
   * Devuelve la próxima fecha de entrega:
   * - Fijada a 5 días antes del último día del mes.
   * - Si la fecha actual ya pasó la entrega de este mes, usa el mes siguiente.
   */
  private getNextDueDate(from: Date): Date {
    let year = from.getFullYear();
    let month = from.getMonth(); // 0 = enero

    // Último día del mes actual
    let lastDayOfMonth = new Date(year, month + 1, 0);
    let due = new Date(lastDayOfMonth);
    due.setDate(lastDayOfMonth.getDate() - 5);

    // Si ya pasó la fecha de entrega de este mes, se usa el próximo mes
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

  /** Formatea Date a dd/mm/aaaa */
  private formatDate(d: Date): string {
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const day = d.getDate();
    const dd = String(day).padStart(2, "0");
    const mm = String(m).padStart(2, "0");
    return `${dd}/${mm}/${y}`;
  }

  /** Formatea Date a dd/mm/aaaa HH:MM */
  private formatDateTime(d: Date): string {
    const datePart = this.formatDate(d);
    const hh = String(d.getHours()).padStart(2, "0");
    const mi = String(d.getMinutes()).padStart(2, "0");
    return `${datePart} ${hh}:${mi}`;
  }

  private loadActivities(): void {
    if (!this.user) return;

    this.dataService.getActivitiesByUser(this.user.id).subscribe({
      next: (activities) => {
        // total KPIs
        this.activitiesCount = activities.length;

        // últimas 10 actividades ordenadas por fecha descendente
        this.recent = [...activities]
          .sort((a, b) => (a.fecha < b.fecha ? 1 : a.fecha > b.fecha ? -1 : 0))
          .slice(0, 10);
      },
      error: (err) => {
        console.error("Error cargando actividades desde DataService:", err);
      },
    });
  }

  private loadCargos(): void {
    if (!this.user) return;

    this.dataService.getCargosByUsuario(this.user.id).subscribe({
      next: (cargos: Cargo[]) => {
        this.cargoDescripcion = cargos.map((c) => c.descripcion ?? "");
      },
      error: (err) => {
        console.error("Error cargando los cargos del usuario:", err);
        this.cargoDescripcion = [];
      },
    });
  }

  // Utilidad para mostrar fecha en dd/mm/aaaa (para las actividades)
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
