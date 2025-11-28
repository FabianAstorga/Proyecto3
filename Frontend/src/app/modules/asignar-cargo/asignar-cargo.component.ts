// src/app/modules/asignar-cargo/asignar-cargo.component.ts
import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { forkJoin } from "rxjs";

import { DataService } from "../../services/data.service";
import { User } from "../../models/user.model";
import { Cargo } from "../../models/charge.model";
import { EmpleadoCargo } from "../../services/backend/charge-backend.model";
import { LayoutComponent } from "../../components/layout/layout.component";

@Component({
  selector: "app-asignar-cargo",
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LayoutComponent],
  templateUrl: "./asignar-cargo.component.html",
  styleUrls: ["./asignar-cargo.component.scss"],
})
export class AsignarCargoComponent implements OnInit {
  // Datos base
  usuarios: User[] = [];
  usuariosFiltrados: User[] = [];
  cargos: Cargo[] = [];
  asignaciones: EmpleadoCargo[] = [];

  // Filtros
  filtroNombre: string = "";
  filtroRol: string | null = null;
  filtroCargo: number | null = null;

  // Selección múltiple
  selectedUserIds = new Set<number>();
  selectedCargoId: number | null = null;

  // Estado UI
  cargando: boolean = false;
  alertMessage = "";
  alertType: "success" | "danger" | "warning" = "success";

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.cargarCargos();
    this.cargarUsuarios();
    this.cargarAsignaciones();
  }

  // ------------------ Alertas ------------------
  private showAlert(
    message: string,
    type: "success" | "danger" | "warning" = "success"
  ) {
    this.alertMessage = message;
    this.alertType = type;
    setTimeout(() => (this.alertMessage = ""), 3500);
  }

  // ------------------ Carga inicial ------------------
  cargarCargos() {
    this.dataService.getCargos().subscribe({
      next: (list) => (this.cargos = list),
      error: () => this.showAlert("Error cargando cargos", "danger"),
    });
  }

  cargarUsuarios() {
    this.dataService.getUsers().subscribe({
      next: (list) => {
        this.usuarios = list;
        this.aplicarFiltros();
      },
      error: () => this.showAlert("Error cargando usuarios", "danger"),
    });
  }

  getAsignacionesPorUsuario(usuarioId: number) {
    return this.asignaciones.filter((a) => a.usuario?.id === usuarioId);
  }

  cargarAsignaciones() {
    this.dataService.getEmpleadoCargos().subscribe({
      next: (list) => {
        this.asignaciones = list;
        // no hace falta recalcular nada más acá,
        // la tabla usa getCargosResumen()
      },
      error: () => this.showAlert("Error cargando asignaciones", "danger"),
    });
  }

  // ------------------ Filtros ------------------
  aplicarFiltros() {
    this.usuariosFiltrados = this.usuarios.filter((u) => {
      const coincideNombre =
        u.firstName.toLowerCase().includes(this.filtroNombre.toLowerCase()) ||
        u.lastName.toLowerCase().includes(this.filtroNombre.toLowerCase());

      const coincideRol = this.filtroRol ? u.role === this.filtroRol : true;

      const coincideCargo = this.filtroCargo
        ? this.asignaciones.some(
            (a) =>
              a.usuario?.id === u.id && a.cargo?.id_cargo === this.filtroCargo
          )
        : true;

      return coincideNombre && coincideRol && coincideCargo;
    });
  }

  limpiarFiltros() {
    this.filtroNombre = "";
    this.filtroRol = null;
    this.filtroCargo = null;
    this.aplicarFiltros();
  }

  // Resumen para la tabla (texto de cargos del usuario)
  getCargosResumen(usuarioId: number): string {
    const cargosUsuario = this.asignaciones
      .filter((a) => a.usuario?.id === usuarioId)
      .map((a) => a.cargo?.ocupacion)
      .filter((x): x is string => !!x);

    if (!cargosUsuario.length) return "N/A";
    return cargosUsuario.join(", ");
  }

  // ------------------ Selección múltiple ------------------
  isUserSelected(id: number): boolean {
    return this.selectedUserIds.has(id);
  }

  onUserCheckboxChange(id: number, checked: boolean) {
    if (checked) {
      this.selectedUserIds.add(id);
    } else {
      this.selectedUserIds.delete(id);
    }
  }

  get allVisibleSelected(): boolean {
    return (
      this.usuariosFiltrados.length > 0 &&
      this.usuariosFiltrados.every((u) =>
        u.id ? this.selectedUserIds.has(u.id) : false
      )
    );
  }

  toggleSelectAllVisible() {
    if (this.allVisibleSelected) {
      // desmarcar todos los visibles
      this.usuariosFiltrados.forEach((u) => {
        if (u.id) this.selectedUserIds.delete(u.id);
      });
    } else {
      // marcar todos los visibles
      this.usuariosFiltrados.forEach((u) => {
        if (u.id) this.selectedUserIds.add(u.id);
      });
    }
  }

  // ------------------ Asignación múltiple ------------------
  asignarCargoMultiple() {
    if (!this.selectedCargoId) {
      this.showAlert("Selecciona un cargo para asignar.", "warning");
      return;
    }

    const usuariosSeleccionados = this.usuarios.filter(
      (u) => u.id && this.selectedUserIds.has(u.id)
    );

    if (!usuariosSeleccionados.length) {
      this.showAlert("Selecciona al menos un usuario.", "warning");
      return;
    }

    const peticiones = [];
    const omitidosPorDuplicado: string[] = [];

    for (const u of usuariosSeleccionados) {
      const yaTiene = this.asignaciones.some(
        (a) =>
          a.usuario?.id === u.id && a.cargo?.id_cargo === this.selectedCargoId
      );

      if (yaTiene) {
        omitidosPorDuplicado.push(`${u.firstName} ${u.lastName}`);
        continue;
      }

      peticiones.push(
        this.dataService.createEmpleadoCargo({
          usuarioId: u.id!,
          cargoId: this.selectedCargoId!,
        })
      );
    }

    if (!peticiones.length) {
      this.showAlert(
        "Todos los usuarios seleccionados ya tienen asignado ese cargo.",
        "warning"
      );
      return;
    }

    this.cargando = true;

    forkJoin(peticiones).subscribe({
      next: () => {
        this.cargando = false;
        this.showAlert(
          "Cargo asignado correctamente a los usuarios.",
          "success"
        );
        this.cargarAsignaciones();
        // opcional: limpiar selección
        this.selectedUserIds.clear();

        if (omitidosPorDuplicado.length) {
          console.log(
            "Usuarios omitidos por tener ya el cargo:",
            omitidosPorDuplicado
          );
        }
      },
      error: (err) => {
        this.cargando = false;
        console.error("Error en asignación múltiple:", err);
        this.showAlert(
          "Ocurrió un error al asignar el cargo a los usuarios.",
          "danger"
        );
      },
    });
  }

  // ------------------ (opcional) eliminación individual ------------------
  eliminarAsignacion(asignacionId: number) {
    if (!confirm("¿Seguro que quieres quitar este cargo del usuario?")) {
      return;
    }

    this.cargando = true;

    this.dataService.deleteEmpleadoCargo(asignacionId).subscribe({
      next: () => {
        this.cargando = false;
        this.showAlert("Cargo quitado correctamente.", "success");
        this.asignaciones = this.asignaciones.filter(
          (a) => a.id !== asignacionId
        );
        this.aplicarFiltros();
      },
      error: (err) => {
        this.cargando = false;
        console.error("Error quitando cargo:", err);
        this.showAlert("Ocurrió un error al quitar el cargo.", "danger");
      },
    });
  }
}
