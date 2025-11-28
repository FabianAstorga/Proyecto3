import { Component, signal, computed, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup,
} from "@angular/forms";
import { LayoutComponent } from "../../components/layout/layout.component";
import { DataService } from "../../services/data.service";
import { User } from "../../models/user.model";

@Component({
  standalone: true,
  selector: "app-gestionar-funcionario",
  imports: [CommonModule, ReactiveFormsModule, LayoutComponent],
  templateUrl: "./gestionar-funcionario.component.html",
  styleUrls: ["./gestionar-funcionario.component.scss"],
})
export class GestionarFuncionarioComponent implements OnInit {
  // Todos los usuarios raw
  usuarios = signal<User[]>([]);

  // Solo usuarios que se pueden gestionar aquí (NO administradores)
  usuariosGestionables = computed(() =>
    this.usuarios().filter(
      (u) => u.role?.toLowerCase() !== "administrador"
    )
  );

  form: FormGroup;
  modo: "crear" | "editar" = "crear";
  editId: number | null = null;

  // Roles permitidos en este módulo (sin administrador)
  roles: User["role"][] = ["funcionario", "secretaria"];

  // Alertas
  alertMessage = "";
  alertType: "success" | "danger" | "warning" = "success";

  // Preview de foto seleccionada
  fotoPreview: string | ArrayBuffer | null = null;

  constructor(private fb: FormBuilder, private dataService: DataService) {
    this.form = this.fb.group({
      firstName: ["", [Validators.required, Validators.maxLength(80)]],
      lastName: ["", [Validators.required, Validators.maxLength(120)]],
      email: ["", [Validators.required, Validators.email]],
      phone: [""],
      role: ["funcionario", Validators.required],
      photoUrl: [""],
      password: [""], // opcional
    });
  }

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  get f() {
    return this.form.controls;
  }

  // ================= ALERTAS =================
  showAlert(message: string, type: "success" | "danger" | "warning") {
    this.alertMessage = message;
    this.alertType = type;
    setTimeout(() => (this.alertMessage = ""), 4000);
  }

  // ================= CARGAR USUARIOS =================
  cargarUsuarios() {
    this.dataService.getUsers().subscribe({
      next: (users: User[]) => this.usuarios.set(users),
      error: (err) => {
        console.error(err);
        this.showAlert("Error cargando usuarios", "danger");
      },
    });
  }

  // ================= FORM HELPERS =================
  resetForm() {
    this.form.reset({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      role: "funcionario",
      photoUrl: "",
      password: "",
    });
    this.fotoPreview = null;
    this.modo = "crear";
    this.editId = null;
    this.showAlert("Formulario limpiado correctamente", "warning");
  }

  onFotoSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => (this.fotoPreview = reader.result);
      reader.readAsDataURL(file);
      this.form.patchValue({ photoUrl: URL.createObjectURL(file) });
    }
  }

  // ================= CRUD =================
  crear() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.showAlert("Por favor complete correctamente los campos", "danger");
      return;
    }

    const formValue = this.form.value;

    // Normalizar rol y evitar crear administradores desde este módulo
    const rawRole = (formValue.role || "").toString().toLowerCase();
    const safeRole =
      rawRole === "administrador" || rawRole === "" ? "funcionario" : rawRole;

    // Mapeo de frontend -> backend
    const payload = {
      nombre: formValue.firstName,
      apellido: formValue.lastName,
      correo: formValue.email,
      telefono: formValue.phone,
      rol: safeRole,
      foto_url: formValue.photoUrl || "/usuario(1).png", // valor por defecto si no hay
      contrasena: formValue.password || undefined, // opcional
    };

    console.log("Enviando payload:", payload); // útil para debug

    this.dataService.createUser(payload).subscribe({
      next: () => {
        this.cargarUsuarios();
        this.resetForm();
        this.showAlert("Funcionario creado correctamente", "success");
      },
      error: (err) => {
        console.error("Error creando usuario:", err);
        if (err.status === 409) {
          this.showAlert("❌ El correo ya está registrado", "danger");
        } else if (err.error?.message) {
          this.showAlert(`❌ ${err.error.message}`, "danger");
        } else {
          this.showAlert("❌ Error creando funcionario", "danger");
        }
      },
    });
  }

  editar(u: User) {
    // Blindaje: no permitir editar administradores desde este módulo
    if (u.role?.toLowerCase() === "administrador") {
      this.showAlert(
        "No puedes editar usuarios con rol administrador desde este módulo",
        "danger"
      );
      return;
    }

    this.modo = "editar";
    this.editId = u.id;
    this.form.patchValue({
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      phone: u.phone,
      role: u.role,
      photoUrl: u.photoUrl ?? "",
      password: "",
    });
    this.fotoPreview = u.photoUrl ?? "";
    this.showAlert("Modo edición activado", "success");
  }

  actualizar() {
    if (!this.editId) {
      this.showAlert("No se ha seleccionado un funcionario", "danger");
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.showAlert("Por favor complete correctamente los campos", "danger");
      return;
    }

    const formValue = this.form.value;

    // Normalizar rol y evitar pasar administrador
    const rawRole = (formValue.role || "").toString().toLowerCase();
    const safeRole =
      rawRole === "administrador" || rawRole === "" ? "funcionario" : rawRole;

    const payload: any = {
      nombre: formValue.firstName,
      apellido: formValue.lastName,
      correo: formValue.email,
      telefono: formValue.phone,
      rol: safeRole,
    };

    if (formValue.photoUrl && formValue.photoUrl !== "") {
      payload.foto_url = formValue.photoUrl;
    }

    if (formValue.password && formValue.password.trim() !== "") {
      payload.contrasena = formValue.password;
    }

    console.log("Actualizando usuario con payload:", payload);

    this.dataService.updateUser(this.editId, payload).subscribe({
      next: () => {
        this.cargarUsuarios();
        this.resetForm();
        this.showAlert("Funcionario actualizado correctamente", "success");
      },
      error: (err) => {
        console.error("Error actualizando funcionario:", err);
        this.showAlert("Error actualizando funcionario", "danger");
      },
    });
  }

  eliminar(id: number) {
    const user = this.usuarios().find((u) => u.id === id);
    if (user && user.role?.toLowerCase() === "administrador") {
      this.showAlert(
        "No puedes eliminar usuarios con rol administrador desde este módulo",
        "danger"
      );
      return;
    }

    if (!confirm("¿Eliminar funcionario?")) return;

    this.dataService.deleteUser(id).subscribe({
      next: () => {
        this.cargarUsuarios();
        if (this.editId === id) this.resetForm();
        this.showAlert("Funcionario eliminado correctamente", "warning");
      },
      error: (err) => {
        console.error(err);
        this.showAlert("Error eliminando funcionario", "danger");
      },
    });
  }
}
