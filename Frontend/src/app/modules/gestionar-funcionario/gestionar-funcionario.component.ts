// src/app/pages/gestionar-funcionario/gestionar-funcionario.component.ts
import { Component, signal, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup,
} from "@angular/forms";
import { LayoutComponent } from "../../components/layout/layout.component";
import { DataService } from "../../services/data.service";
import { BackendUser } from "../../services/backend/user-backend.model";

@Component({
  standalone: true,
  selector: "app-gestionar-funcionario",
  imports: [CommonModule, ReactiveFormsModule, LayoutComponent],
  templateUrl: "./gestionar-funcionario.component.html",
  styleUrls: ["./gestionar-funcionario.component.scss"],
})
export class GestionarFuncionarioComponent implements OnInit {
  usuarios = signal<BackendUser[]>([]);
  private idSeq = 1;

  form: FormGroup;
  modo: "crear" | "editar" = "crear";
  editId: number | null = null;

  // ===== Alertas =====
  alertMessage = "";
  alertType: "success" | "danger" | "warning" = "success";

  isDragging = false;
  roles = ["funcionario", "administrador", "secretaria"];

  constructor(private fb: FormBuilder, private dataService: DataService) {
    this.form = this.fb.group({
      nombre: ["", [Validators.required, Validators.maxLength(80)]],
      apellido: ["", [Validators.required, Validators.maxLength(120)]],
      correo: ["", [Validators.required, Validators.email]],
      telefono: [""],
      foto_url: [""],
      contrasena: ["", [Validators.required, Validators.minLength(8)]],
      rol: ["", Validators.required], // <-- vacío
    });
  }

  showAlert(message: string, type: "success" | "danger" | "warning") {
    this.alertMessage = message;
    this.alertType = type;
    setTimeout(() => (this.alertMessage = ""), 4000);
  }

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  get f() {
    return this.form.controls;
  }

  cargarUsuarios() {
    this.dataService.getUsers().subscribe({
      next: (users) => {
        const mapped: BackendUser[] = users.map((u: any) => ({
          id: u.id,
          nombre: u.firstName,
          apellido: u.lastName,
          correo: u.email,
          telefono: u.phone ?? "",
          foto_url: u.photoUrl ?? "",
          contrasena: "",
          rol: u.role.toLowerCase(),
        }));

        this.idSeq =
          mapped.reduce((max, u) => (u.id > max ? u.id : max), 0) + 1;
        this.usuarios.set(mapped);
      },
      error: (err) => this.showAlert("Error cargando usuarios", "danger"),
    });
  }

  crear() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.showAlert("Por favor complete correctamente los campos", "danger");
      return;
    }

    const nuevoUsuario = {
      nombre: this.form.value.nombre,
      apellido: this.form.value.apellido,
      correo: this.form.value.correo,
      telefono: this.form.value.telefono,
      foto_url: this.form.value.foto_url,
      contrasena: this.form.value.contrasena,
      rol: this.form.value.rol,
    };

    this.dataService.createUser(nuevoUsuario).subscribe({
      next: (res) => {
        this.cargarUsuarios(); // recarga la lista desde backend
        this.resetForm();
        this.showAlert("Usuario creado correctamente", "success"); // alerta verde
      },
      error: (err) => {
        console.error("Error creando usuario:", err);
        this.showAlert("Error creando usuario", "danger"); // alerta roja
      },
    });
  }

  actualizar() {
    if (this.editId == null) {
      this.showAlert("No se ha seleccionado un usuario", "danger");
      return;
    }

    // Crear un objeto vacío para enviar solo los campos modificados
    const updatedUsuario: any = {};

    // Revisar cada campo y agregarlo solo si tiene valor
    if (this.form.value.nombre) updatedUsuario.nombre = this.form.value.nombre;
    if (this.form.value.apellido)
      updatedUsuario.apellido = this.form.value.apellido;
    if (this.form.value.correo) updatedUsuario.correo = this.form.value.correo;
    if (this.form.value.telefono)
      updatedUsuario.telefono = this.form.value.telefono;
    if (this.form.value.foto_url)
      updatedUsuario.foto_url = this.form.value.foto_url;
    if (this.form.value.rol) updatedUsuario.rol = this.form.value.rol;
    if (this.form.value.contrasena)
      updatedUsuario.contrasena = this.form.value.contrasena; // solo si cambia

    // Validación mínima: si no hay ningún campo para actualizar
    if (Object.keys(updatedUsuario).length === 0) {
      this.showAlert("No hay cambios para actualizar", "warning");
      return;
    }

    this.dataService.updateUser(this.editId, updatedUsuario).subscribe({
      next: (res) => {
        this.cargarUsuarios();
        this.resetForm();
        this.showAlert("Usuario actualizado correctamente", "success");
      },
      error: (err) => {
        console.error("Error actualizando usuario:", err);
        this.showAlert("Error actualizando usuario", "danger");
      },
    });
  }

  editar(u: BackendUser) {
    this.modo = "editar"; // primero modo editar
    this.editId = u.id;

    this.setValidatorsByMode(); // limpia validators para edición parcial

    this.form.patchValue({
      nombre: u.nombre,
      apellido: u.apellido,
      correo: u.correo,
      telefono: u.telefono,
      foto_url: u.foto_url,
      contrasena: "",
      rol: u.rol,
    });

    this.showAlert("Modo edición activado", "success");
  }

  resetForm() {
    this.modo = "crear"; // primero volvemos a crear
    this.form.reset({
      nombre: "",
      apellido: "",
      correo: "",
      telefono: "",
      foto_url: "",
      contrasena: "",
      rol: "",
    });
    this.setValidatorsByMode(); // ahora sí se aplican los validators de crear
    this.editId = null;
    this.showAlert("Formulario limpiado correctamente", "warning");
  }

  eliminar(id: number) {
    if (!confirm("¿Eliminar usuario?")) return;

    this.dataService.deleteUser(id).subscribe({
      next: (res) => {
        this.cargarUsuarios();
        if (this.editId === id) this.resetForm();
        this.showAlert("Usuario eliminado correctamente", "warning"); // alerta amarilla
      },
      error: (err) => {
        console.error("Error eliminando usuario:", err);
        this.showAlert("Error eliminando usuario", "danger"); // alerta roja
      },
    });
  }

  private setValidatorsByMode() {
    if (this.modo === "crear") {
      this.form
        .get("nombre")
        ?.setValidators([Validators.required, Validators.maxLength(80)]);
      this.form
        .get("apellido")
        ?.setValidators([Validators.required, Validators.maxLength(120)]);
      this.form
        .get("correo")
        ?.setValidators([Validators.required, Validators.email]);
      this.form.get("telefono")?.setValidators([Validators.required]);

      this.form
        .get("contrasena")
        ?.setValidators([Validators.required, Validators.minLength(8)]);
      this.form.get("rol")?.setValidators([Validators.required]);
    } else {
      // Al editar, todos opcionales
      this.form.get("nombre")?.clearValidators();
      this.form.get("apellido")?.clearValidators();
      this.form.get("correo")?.clearValidators();
      this.form.get("telefono")?.clearValidators();
      this.form.get("foto_url")?.clearValidators();
      this.form.get("contrasena")?.clearValidators();
      this.form.get("rol")?.clearValidators();
    }
    this.form.updateValueAndValidity();
  }

  // ================= Drag & Drop =================
  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
    if (event.dataTransfer?.files.length) {
      this.handleFile(event.dataTransfer.files[0]);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) this.handleFile(input.files[0]);
  }

  handleFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      this.form.patchValue({ foto_url: reader.result as string });
    };
    reader.readAsDataURL(file);
  }
}
