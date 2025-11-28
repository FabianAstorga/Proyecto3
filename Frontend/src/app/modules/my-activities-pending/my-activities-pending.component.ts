// src/app/modules/my-activities-pending/my-activities-pending.component.ts
import { Component, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";

import { LayoutComponent } from "../../components/layout/layout.component";
import { DataService } from "../../services/data.service";
import { AuthService } from "../../services/auth.service";
import { Activity } from "../../models/activity.model";

type Estado = Activity["estado"];

@Component({
  selector: "app-my-activities-pending",
  standalone: true,
  imports: [CommonModule, RouterLink, LayoutComponent],
  templateUrl: "./my-activities-pending.component.html",
  styleUrls: ["./my-activities-pending.component.scss"],
})
export class MyActivitiesPendingComponent implements OnInit {
  private dataService = inject(DataService);
  private authService = inject(AuthService);

  loading = false;
  errorMessage = "";
  actividadesPendientes: Activity[] = [];

  ngOnInit(): void {
    this.cargarPendientes();
  }

  private cargarPendientes(): void {
    const userId = this.authService.getUserId();
    if (userId == null) {
      this.errorMessage = "No se pudo identificar al usuario logueado.";
      return;
    }

    this.loading = true;
    this.errorMessage = "";

    this.dataService.getActivitiesByUser(userId).subscribe({
      next: (acts) => {
        // Solo actividades con estado Pendiente
        this.actividadesPendientes = (acts ?? [])
          .filter((a) => a.estado === "Pendiente")
          .sort((a, b) => (a.fecha < b.fecha ? 1 : a.fecha > b.fecha ? -1 : 0));

        this.loading = false;
      },
      error: (err) => {
        console.error("Error cargando actividades del usuario:", err);
        this.errorMessage =
          "No se pudieron cargar tus actividades. Intenta nuevamente.";
        this.loading = false;
      },
    });
  }

  formatDMY(iso: string): string {
    const [y, m, d] = iso.split("-").map(Number);
    return `${String(d).padStart(2, "0")}/${String(m).padStart(
      2,
      "0"
    )}/${y}`;
  }

  statusPillClass(estado: Estado): string {
    switch (estado) {
      case "Pendiente":
        return "bg-amber-100 text-amber-800 border border-amber-200";
      case "Aprobada":
        return "bg-emerald-100 text-emerald-800 border border-emerald-200";
      case "Rechazada":
        return "bg-rose-100 text-rose-800 border border-rose-200";
      default:
        return "bg-slate-100 text-slate-700 border border-slate-200";
    }
  }

  // ========= Acciones =========

  marcarComoRealizada(act: Activity): void {
    if (!act || act.id == null) return;

    const ok = confirm(
      `¿Confirmas marcar esta actividad como REALIZADA?\n\n${act.titulo}`
    );
    if (!ok) return;

    // Ojo: aquí usamos el DTO del backend -> estado "Realizada"
    this.dataService.updateActividad(act.id, { estado: "Realizada" as any }).subscribe({
      next: () => {
        // La sacamos de la lista local de pendientes
        this.actividadesPendientes = this.actividadesPendientes.filter(
          (a) => a.id !== act.id
        );
      },
      error: (err) => {
        console.error("Error al actualizar actividad:", err);
        alert("No se pudo actualizar la actividad.");
      },
    });
  }

  eliminarActividad(act: Activity): void {
    if (!act || act.id == null) return;

    const ok = confirm(
      `¿Seguro que quieres ELIMINAR esta actividad?\n\n${act.titulo}`
    );
    if (!ok) return;

    this.dataService.deleteActividad(act.id).subscribe({
      next: () => {
        this.actividadesPendientes = this.actividadesPendientes.filter(
          (a) => a.id !== act.id
        );
      },
      error: (err) => {
        console.error("Error al eliminar actividad:", err);
        alert("No se pudo eliminar la actividad.");
      },
    });
  }
}
