import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { DataService } from "../../services/data.service";
import { LayoutComponent } from "../../components/layout/layout.component";

type TipoActividad = {
  id: number;
  nombre: string;
  orden: number;
  activo: boolean;
  requiereDetalle: boolean;
};

@Component({
  selector: "app-gestionar-tipos-actividad",
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LayoutComponent],
  templateUrl: "./gestionar-tipos-actividad.component.html",
  styleUrls: ["./gestionar-tipos-actividad.component.scss"],
})
export class GestionarTiposActividadComponent implements OnInit {
  items: TipoActividad[] = [];

  // Estado UI
  cargando = false;
  modalOpen = false;

  // Alertas (mismo patrón que tu módulo)
  alertMessage = "";
  alertType: "success" | "danger" | "warning" = "success";

  // Modal form (ngModel simple)
  editId: number | null = null;
  formNombre = "";
  formOrden = 0;
  formActivo = true;
  formRequiereDetalle = false;

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.cargar();
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

  // ------------------ Cargar listado ------------------
  cargar() {
    this.cargando = true;

    this.dataService.getTiposActividad(undefined).subscribe({
      next: (list: any[]) => {
        // normaliza por si backend devuelve otros nombres
        this.items = (list ?? []).map((x: any) => ({
          id: x.id,
          nombre: x.nombre,
          orden: Number(x.orden ?? 0),
          activo: !!x.activo,
          requiereDetalle: !!x.requiereDetalle,
        }));
      },
      error: (err) => {
        console.error(err);
        this.showAlert("Error cargando tipos de actividad", "danger");
      },
      complete: () => (this.cargando = false),
    });
  }

  // ------------------ Modal ------------------
  abrirNuevo() {
    this.editId = null;
    this.formNombre = "";
    this.formOrden = this.siguienteOrdenSugerido();
    this.formActivo = true;
    this.formRequiereDetalle = false;
    this.modalOpen = true;
  }

  abrirEditar(item: TipoActividad) {
    this.editId = item.id;
    this.formNombre = item.nombre;
    this.formOrden = item.orden ?? 0;
    this.formActivo = item.activo;
    this.formRequiereDetalle = item.requiereDetalle;
    this.modalOpen = true;
  }

  cerrarModal() {
    this.modalOpen = false;
  }

  private siguienteOrdenSugerido(): number {
    if (!this.items.length) return 0;
    const maxOrden = Math.max(...this.items.map((i) => Number(i.orden ?? 0)));
    return maxOrden + 1;
  }

  // ------------------ Guardar (crear/editar) ------------------
  guardarModal() {
    const nombre = (this.formNombre ?? "").trim();

    if (!nombre) {
      this.showAlert("El nombre es obligatorio.", "warning");
      return;
    }
    if (nombre.length > 100) {
      this.showAlert("El nombre supera 100 caracteres.", "warning");
      return;
    }

    const payload = {
      nombre,
      orden: Number(this.formOrden ?? 0),
      activo: !!this.formActivo,
      requiereDetalle: !!this.formRequiereDetalle,
    };

    this.cargando = true;

    if (!this.editId) {
      // crear
      this.dataService.createTipoActividad(payload).subscribe({
        next: () => {
          this.showAlert("Tipo de actividad creado.", "success");
          this.modalOpen = false;
          this.cargar();
        },
        error: (err) => {
          console.error(err);
          this.showAlert("Error al crear tipo de actividad.", "danger");
          this.cargando = false;
        },
      });
    } else {
      // editar
      this.dataService.updateTipoActividad(this.editId, payload).subscribe({
        next: () => {
          this.showAlert("Tipo de actividad actualizado.", "success");
          this.modalOpen = false;
          this.cargar();
        },
        error: (err) => {
          console.error(err);
          this.showAlert("Error al actualizar tipo de actividad.", "danger");
          this.cargando = false;
        },
      });
    }
  }

  // ------------------ Acciones tabla ------------------
  desactivar(item: TipoActividad) {
    if (!confirm(`¿Desactivar "${item.nombre}"?`)) return;

    this.cargando = true;
    this.dataService.disableTipoActividad(item.id).subscribe({
      next: () => {
        this.showAlert("Tipo desactivado.", "success");
        this.cargar();
      },
      error: (err) => {
        console.error(err);
        this.showAlert("Error desactivando tipo.", "danger");
        this.cargando = false;
      },
    });
  }

  eliminar(item: TipoActividad) {
    if (!confirm(`¿Eliminar "${item.nombre}"?`)) return;

    this.cargando = true;
    this.dataService.deleteTipoActividad(item.id).subscribe({
      next: () => {
        this.showAlert("Tipo eliminado.", "success");
        this.cargar();
      },
      error: (err) => {
        console.error(err);
        this.showAlert("Error eliminando tipo.", "danger");
        this.cargando = false;
      },
    });
  }
}
