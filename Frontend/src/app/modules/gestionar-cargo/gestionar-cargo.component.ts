// src/app/pages/gestionar-cargos/gestionar-cargos.component.ts
import { Component, signal, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup,
} from "@angular/forms";
import { LayoutComponent } from "../../components/layout/layout.component";
import { Cargo } from "../../models/charge.model";
import { DataService } from "../../services/data.service";

@Component({
  standalone: true,
  selector: "app-gestionar-cargo",
  imports: [CommonModule, ReactiveFormsModule, LayoutComponent],
  templateUrl: "./gestionar-cargo.component.html",
  styleUrls: ["./gestionar-cargo.component.scss"],
})
export class GestionarCargoComponent implements OnInit {
  cargos = signal<Cargo[]>([]);
  form: FormGroup;
  modo: "crear" | "editar" = "crear";
  editId: number | null = null;

  // Alertas
  alertMessage = "";
  alertType: "success" | "danger" | "warning" = "success";

  constructor(private fb: FormBuilder, private cargoService: DataService) {
    this.form = this.fb.group({
      ocupacion: ["", [Validators.required, Validators.maxLength(100)]],
      descripcion: ["", [Validators.maxLength(255)]],
    });
  }

  ngOnInit(): void {
    this.cargarCargos();
  }

  modalDescripcion: string | null = null;

  abrirModal(descripcion: string) {
    this.modalDescripcion = descripcion;
  }

  cerrarModal() {
    this.modalDescripcion = null;
  }

  get f() {
    return this.form.controls;
  }

  showAlert(message: string, type: "success" | "danger" | "warning") {
    this.alertMessage = message;
    this.alertType = type;
    setTimeout(() => (this.alertMessage = ""), 4000);
  }

  cargarCargos() {
    this.cargoService.getCargos().subscribe({
      next: (data) => this.cargos.set(data),
      error: () => this.showAlert("Error cargando cargos", "danger"),
    });
  }

  crear() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.showAlert("Complete correctamente los campos", "danger");
      return;
    }

    this.cargoService.createCargo(this.form.value).subscribe({
      next: () => {
        this.cargarCargos();
        this.resetForm();
        this.showAlert("Cargo creado correctamente", "success");
      },
      error: () => this.showAlert("Error creando cargo", "danger"),
    });
  }

  editar(cargo: Cargo) {
    this.modo = "editar";
    this.editId = cargo.id_cargo!;
    this.form.patchValue({
      ocupacion: cargo.ocupacion,
      descripcion: cargo.descripcion,
    });
    this.showAlert("Modo edición activado", "success");
  }

  actualizar() {
    if (!this.editId) {
      this.showAlert("No se ha seleccionado un cargo", "danger");
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.showAlert("Complete correctamente los campos", "danger");
      return;
    }

    this.cargoService.updateCargo(this.editId, this.form.value).subscribe({
      next: () => {
        this.cargarCargos();
        this.resetForm();
        this.showAlert("Cargo actualizado correctamente", "success");
      },
      error: () => this.showAlert("Error actualizando cargo", "danger"),
    });
  }

  eliminar(id: number) {
    if (!confirm("¿Eliminar cargo?")) return;

    this.cargoService.deleteCargo(id).subscribe({
      next: () => {
        this.cargarCargos();
        if (this.editId === id) this.resetForm();
        this.showAlert("Cargo eliminado correctamente", "warning");
      },
      error: () => this.showAlert("Error eliminando cargo", "danger"),
    });
  }

  resetForm() {
    this.modo = "crear";
    this.form.reset({
      ocupacion: "",
      descripcion: "",
    });
    this.editId = null;
  }
}
