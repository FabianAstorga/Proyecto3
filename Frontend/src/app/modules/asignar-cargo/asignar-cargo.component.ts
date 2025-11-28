// src/app/modules/asignar-cargo/asignar-cargo.component.ts
import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
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

  // Selección actual
  selectedUser: User | null = null;
  selectedUserAssignments: {
    id: number;
    cargoId: number;
    ocupacion: string;
    descripcion?: string;
  }[] = [];

  // Cargo seleccionado en el panel derecho para agregar / cambiar
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

  cargarAsignaciones() {
    this.dataService.getEmpleadoCargos().subscribe({
      next: (list) => {
        this.asignaciones = list;
        this.actualizarCargosUsuarioSeleccionado();
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

    if (!cargosUsuario.length) return "Sin cargo asignado";
    return cargosUsuario.join(", ");
  }

  // ------------------ Selección de usuario ------------------
  onSelectUser(usuario: User) {
    this.selectedUser = usuario;
    this.actualizarCargosUsuarioSeleccionado();
  }

  private actualizarCargosUsuarioSeleccionado() {
    if (!this.selectedUser) {
      this.selectedUserAssignments = [];
      return;
    }

    this.selectedUserAssignments = this.asignaciones
      .filter((a) => a.usuario?.id === this.selectedUser!.id)
      .map((a) => ({
        id: a.id!,
        cargoId: a.cargo!.id_cargo,
        ocupacion: a.cargo!.ocupacion,
        descripcion: a.cargo!.descripcion,
      }));
  }
  cerrarModalUsuario() {
  this.selectedUser = null;
  this.selectedUserAssignments = [];
  this.selectedCargoId = null;
  }

  // ------------------ Gestión de cargos del usuario ------------------
  agregarCargoAUsuario() {
    if (!this.selectedUser) {
      this.showAlert("Primero selecciona un usuario.", "warning");
      return;
    }

    if (!this.selectedCargoId) {
      this.showAlert("Selecciona un cargo para asignar.", "warning");
      return;
    }

    const yaTiene = this.asignaciones.some(
      (a) =>
        a.usuario?.id === this.selectedUser!.id &&
        a.cargo?.id_cargo === this.selectedCargoId
    );

    if (yaTiene) {
      this.showAlert(
        "Este usuario ya tiene asignado ese cargo.",
        "warning"
      );
      return;
    }

    this.cargando = true;

    this.dataService
      .createEmpleadoCargo({
        usuarioId: this.selectedUser.id!,
        cargoId: this.selectedCargoId,
      })
      .subscribe({
        next: () => {
          this.cargando = false;
          this.showAlert("Cargo asignado correctamente.", "success");
          this.cargarAsignaciones();
        },
        error: (err) => {
          this.cargando = false;
          console.error("Error asignando cargo:", err);
          this.showAlert("Ocurrió un error al asignar el cargo.", "danger");
        },
      });
  }

  cambiarCargoAsignacion(asignacionId: number) {
    if (!this.selectedCargoId) {
      this.showAlert(
        "Selecciona un cargo en el selector para cambiar esta asignación.",
        "warning"
      );
      return;
    }

    this.cargando = true;

    this.dataService
      .updateEmpleadoCargo(asignacionId, {
        cargoId: this.selectedCargoId,
      })
      .subscribe({
        next: () => {
          this.cargando = false;
          this.showAlert("Cargo actualizado correctamente.", "success");
          this.cargarAsignaciones();
        },
        error: (err) => {
          this.cargando = false;
          console.error("Error actualizando cargo:", err);
          this.showAlert("Ocurrió un error al actualizar el cargo.", "danger");
        },
      });
  }

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
        this.actualizarCargosUsuarioSeleccionado();
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
