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
  templateUrl: "./asignar-cargo.component.html",
  styleUrls: ["./asignar-cargo.component.scss"],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, LayoutComponent],
})
export class AsignarCargoComponent implements OnInit {
  // Datos
  usuarios: User[] = [];
  cargos: Cargo[] = [];
  asignaciones: EmpleadoCargo[] = [];

  // UI / estado
  cargoSeleccionado: number | null = null;
  usuariosSeleccionados: number[] = [];
  cargando: boolean = false;

  // Alertas
  alertMessage = "";
  alertType: "success" | "danger" | "warning" = "success";

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.cargarCargos();
    this.cargarUsuarios();
    this.cargarAsignaciones();
  }

  // ------------------ Alerts ------------------
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

  // Propiedades de filtro
  usuariosFiltrados: User[] = [];
  filtroNombre: string = "";
  filtroRol: string | null = null; // nuevo filtro
  filtroCargo: number | null = null;
  // Cuando cargas usuarios:
  cargarUsuarios() {
    this.dataService.getUsers().subscribe({
      next: (list) => {
        this.usuarios = list;
        this.aplicarFiltros();
      },
      error: () => this.showAlert("Error cargando usuarios", "danger"),
    });
  }

  // Obtener todos los cargos de un usuario
  // Devuelve los cargos de un usuario, o un array con un "N/A" ficticio si no tiene
  getCargosUsuario(
    usuarioId: number
  ): { ocupacion: string; descripcion?: string }[] {
    const cargosUsuario = this.asignaciones
      .filter((a) => a.usuario?.id === usuarioId)
      .map((a) => ({
        ocupacion: a.cargo!.ocupacion,
        descripcion: a.cargo!.descripcion,
      }));

    if (cargosUsuario.length === 0) {
      return [{ ocupacion: "N/A" }]; // Solo para mostrar en UI
    }

    return cargosUsuario;
  }

  // Funciones de filtrado
  aplicarFiltros() {
    this.usuariosFiltrados = this.usuarios.filter((u) => {
      const coincideNombre =
        u.firstName.toLowerCase().includes(this.filtroNombre.toLowerCase()) ||
        u.lastName.toLowerCase().includes(this.filtroNombre.toLowerCase());

      const coincideRol = this.filtroRol ? u.role === this.filtroRol : true;

      const coincideCargo = this.filtroCargo
        ? this.asignaciones.some(
            (a) =>
              a.usuario.id === u.id && a.cargo.id_cargo === this.filtroCargo
          )
        : true;

      return coincideNombre && coincideRol && coincideCargo;
    });
  }

  limpiarFiltros() {
    this.filtroNombre = "";
    this.filtroCargo = null;
    this.aplicarFiltros();
  }

  cargarAsignaciones() {
    this.dataService.getEmpleadoCargos().subscribe({
      next: (list) => {
        this.asignaciones = list;
        this.aplicarFiltros();
      },
      error: () => this.showAlert("Error cargando asignaciones", "danger"),
    });
  }

  // ------------------ Selección ------------------
  toggleSeleccion(usuarioId: number, ev: Event) {
    const target = ev.target as HTMLInputElement;
    if (target.checked) {
      if (!this.usuariosSeleccionados.includes(usuarioId)) {
        this.usuariosSeleccionados.push(usuarioId);
      }
    } else {
      this.usuariosSeleccionados = this.usuariosSeleccionados.filter(
        (id) => id !== usuarioId
      );
    }
  }

  toggleAll(ev: Event) {
    const target = ev.target as HTMLInputElement;
    if (target.checked) {
      this.usuariosSeleccionados = this.usuarios.map((u) => u.id!);
    } else {
      this.usuariosSeleccionados = [];
    }
  }

  // Evita duplicados visuales
  tieneAsignacion(usuarioId: number, cargoId: number): boolean {
    return this.asignaciones.some(
      (a) => a.usuario?.id === usuarioId && a.cargo?.id_cargo === cargoId
    );
  }

  // ------------------ Asignación masiva ------------------
  asignarCargo() {
    this.alertMessage = "";
    this.alertType = "success";

    if (!this.cargoSeleccionado) {
      this.showAlert("Debes seleccionar un cargo.", "warning");
      return;
    }

    if (this.usuariosSeleccionados.length === 0) {
      this.showAlert("Debes seleccionar al menos un usuario.", "warning");
      return;
    }

    const toAssign = this.usuariosSeleccionados.filter(
      (uid) => !this.tieneAsignacion(uid, this.cargoSeleccionado!)
    );

    if (toAssign.length === 0) {
      this.showAlert(
        "Todos los usuarios seleccionados ya tienen este cargo.",
        "warning"
      );
      return;
    }

    this.cargando = true;

    const requests = toAssign.map((id_usuario) =>
      this.dataService.createEmpleadoCargo({
        usuarioId: id_usuario, // ⚠ corregido
        cargoId: this.cargoSeleccionado!, // ⚠ corregido
      })
    );

    forkJoin(requests).subscribe({
      next: () => {
        this.cargando = false;
        this.usuariosSeleccionados = [];
        this.cargarAsignaciones();
        this.showAlert("Cargos asignados correctamente", "success");
      },
      error: (err) => {
        this.cargando = false;
        console.error("Error asignando cargos:", err);
        this.showAlert("Ocurrió un error al asignar cargos", "danger");
      },
    });
  }
}
