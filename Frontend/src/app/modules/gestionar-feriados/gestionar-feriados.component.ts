import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { DataService } from "../../services/data.service";
import { LayoutComponent } from "../../components/layout/layout.component";

type Feriado = {
  id: number;
  fecha: string; // YYYY-MM-DD
  nombre?: string | null;
  activo: boolean;
};

@Component({
  selector: "app-gestionar-feriados",
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LayoutComponent],
  templateUrl: "./gestionar-feriados.component.html",
  styleUrls: ["./gestionar-feriados.component.scss"],
})
export class GestionarFeriadosComponent implements OnInit {
  items: Feriado[] = [];
  itemsFiltrados: Feriado[] = [];

  // filtros
  filtroTexto = "";
  filtroActivo: "all" | "active" | "inactive" = "all";

  // rango (por defecto: año actual)
  from = "";
  to = "";

  // estado UI
  cargando = false;
  modalOpen = false;

  // alertas
  alertMessage = "";
  alertType: "success" | "danger" | "warning" = "success";

  // modal fields
  editId: number | null = null;
  formFecha = ""; // YYYY-MM-DD
  formNombre = "";
  formActivo = true;

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    const y = new Date().getFullYear();
    this.from = `${y}-01-01`;
    this.to = `${y}-12-31`;

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

  // ------------------ Helpers ------------------
  private iso10(value: any): string {
    const s = String(value ?? "");
    if (!s) return "";
    // si viene ISO completo, recorta
    return s.length >= 10 ? s.slice(0, 10) : s;
  }

  // ------------------ Cargar ------------------
  cargar() {
    this.cargando = true;

    // si el usuario selecciona filtroActivo !== all, pedimos al backend por ese estado
    const activoParam =
      this.filtroActivo === "all"
        ? undefined
        : this.filtroActivo === "active";

    this.dataService.getFeriados(this.from, this.to, activoParam).subscribe({
      next: (list: any[]) => {
        this.items = (list ?? []).map((x: any) => ({
          id: x.id,
          fecha: this.iso10(x.fecha),
          nombre: x.nombre ?? null,
          activo: !!x.activo,
        }));
        this.aplicarFiltrosLocal();
      },
      error: (err) => {
        console.error(err);
        this.showAlert("Error cargando feriados", "danger");
      },
      complete: () => (this.cargando = false),
    });
  }

  // ------------------ Filtros ------------------
  aplicarFiltrosLocal() {
    const q = this.filtroTexto.trim().toLowerCase();

    this.itemsFiltrados = this.items.filter((f) => {
      const matchTexto =
        !q ||
        f.fecha.includes(q) ||
        (f.nombre ?? "").toLowerCase().includes(q);

      const matchActivo =
        this.filtroActivo === "all"
          ? true
          : this.filtroActivo === "active"
          ? f.activo
          : !f.activo;

      return matchTexto && matchActivo;
    });
  }

  limpiarFiltros() {
    this.filtroTexto = "";
    this.filtroActivo = "all";
    this.aplicarFiltrosLocal();
  }

  // ------------------ Modal ------------------
  abrirNuevo() {
    this.editId = null;
    this.formFecha = "";
    this.formNombre = "";
    this.formActivo = true;
    this.modalOpen = true;
  }

  abrirEditar(item: Feriado) {
    this.editId = item.id;
    this.formFecha = item.fecha;
    this.formNombre = item.nombre ?? "";
    this.formActivo = item.activo;
    this.modalOpen = true;
  }

  cerrarModal() {
    this.modalOpen = false;
  }

  // ------------------ Guardar modal ------------------
  guardarModal() {
    const fecha = (this.formFecha ?? "").trim();
    const nombre = (this.formNombre ?? "").trim();

    if (!fecha) {
      this.showAlert("La fecha es obligatoria.", "warning");
      return;
    }
    // validación simple YYYY-MM-DD
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      this.showAlert("Formato de fecha inválido (YYYY-MM-DD).", "warning");
      return;
    }

    const payload: any = {
      fecha,
      nombre: nombre || null,
      activo: !!this.formActivo,
    };

    this.cargando = true;

    if (!this.editId) {
      this.dataService.createFeriado(payload).subscribe({
        next: () => {
          this.showAlert("Feriado creado.", "success");
          this.modalOpen = false;
          this.cargar();
        },
        error: (err) => {
          console.error(err);
          this.showAlert("Error al crear feriado.", "danger");
          this.cargando = false;
        },
      });
    } else {
      this.dataService.updateFeriado(this.editId, payload).subscribe({
        next: () => {
          this.showAlert("Feriado actualizado.", "success");
          this.modalOpen = false;
          this.cargar();
        },
        error: (err) => {
          console.error(err);
          this.showAlert("Error al actualizar feriado.", "danger");
          this.cargando = false;
        },
      });
    }
  }

  // ------------------ Acciones ------------------
  desactivar(item: Feriado) {
    if (!confirm(`¿Desactivar el feriado del ${item.fecha}?`)) return;

    this.cargando = true;
    this.dataService.disableFeriado(item.id).subscribe({
      next: () => {
        this.showAlert("Feriado desactivado.", "success");
        this.cargar();
      },
      error: (err) => {
        console.error(err);
        this.showAlert("Error desactivando feriado.", "danger");
        this.cargando = false;
      },
    });
  }

  eliminar(item: Feriado) {
    if (!confirm(`¿Eliminar el feriado del ${item.fecha}?`)) return;

    this.cargando = true;
    this.dataService.deleteFeriado(item.id).subscribe({
      next: () => {
        this.showAlert("Feriado eliminado.", "success");
        this.cargar();
      },
      error: (err) => {
        console.error(err);
        this.showAlert("Error eliminando feriado.", "danger");
        this.cargando = false;
      },
    });
  }
}
