import {
  Component,
  signal,
  computed,
  OnInit,
  ViewChild,
  ElementRef,
} from "@angular/core";
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
  usuarios = signal<User[]>([]); // Solo usuarios que se pueden gestionar aquí (NO administradores)
  mostrarConfirmacion = false;
  usuarioAEliminarId: number | null = null;
  usuariosGestionables = computed(() =>
    this.usuarios().filter((u) => u.role?.toLowerCase() !== "administrador")
  );

  @ViewChild("fotoInput") fotoInput!: ElementRef<HTMLInputElement>;

  form: FormGroup;
  modo: "crear" | "editar" = "crear";
  editId: number | null = null; // Roles permitidos en este módulo (sin administrador)

  roles: User["role"][] = ["funcionario", "secretaria"]; // Alertas

  alertMessage = "";
  alertType: "success" | "danger" | "warning" = "success"; // Preview de foto seleccionada

  selectedFile: File | null = null;
  fotoPreview: string | null = null;
  quitarFotoFlag = false;
  readonly API_URL = "http://localhost:3000";

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
  } // ================= ALERTAS =================

  showAlert(message: string, type: "success" | "danger" | "warning") {
    this.alertMessage = message;
    this.alertType = type;
    setTimeout(() => (this.alertMessage = ""), 4000);
  } // ================= CARGAR USUARIOS =================

  cargarUsuarios() {
    this.dataService.getUsers().subscribe({
      next: (users: any[]) => {
        console.log("Usuarios raw del backend:", users);
        this.usuarios.set(
          users.map((u) => {
            let finalPhotoUrl: string;

            if (u.photoUrl && u.photoUrl.trim() !== "") {
              finalPhotoUrl = `${this.API_URL}${u.photoUrl.trim()}`;
            } else {
              finalPhotoUrl = "/usuario(1).png";
            }

            console.log(
              `[DEPURACIÓN FOTO] Usuario: ${u.firstName} ${u.lastName}, URL Final: ${finalPhotoUrl}`
            );

            return {
              ...u,
              photoUrl: finalPhotoUrl,
            };
          })
        );
      },
    });
  } // ================= FORM HELPERS =================

  resetForm() {
    this.form.reset({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      role: "funcionario",
      password: "",
    });

    // 🔒 RESTAURAR VALIDADORES PARA CREAR
    this.form
      .get("firstName")
      ?.setValidators([Validators.required, Validators.maxLength(80)]);
    this.form
      .get("lastName")
      ?.setValidators([Validators.required, Validators.maxLength(120)]);
    this.form
      .get("email")
      ?.setValidators([Validators.required, Validators.email]);
    this.form.get("role")?.setValidators([Validators.required]);

    this.form.updateValueAndValidity();

    this.limpiarFotoInterna();
    this.modo = "crear";
    this.editId = null;

    this.showAlert("Formulario limpiado correctamente", "warning");
  }

  onFotoSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.selectedFile = file;
    this.quitarFotoFlag = false;

    const reader = new FileReader();
    reader.onload = () => (this.fotoPreview = reader.result as string);
    reader.readAsDataURL(file);
  } // ================= CRUD =================

  crear() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.showAlert("Por favor complete correctamente los campos", "danger");
      return;
    }

    const formValue = this.form.value; // 🔒 Normalizar rol (SE MANTIENE)

    const rawRole = (formValue.role || "").toString().toLowerCase();
    const safeRole =
      rawRole === "administrador" || rawRole === "" ? "funcionario" : rawRole;

    const formData = new FormData(); // 📷 Archivo (si existe)

    if (this.selectedFile) {
      formData.append("photo", this.selectedFile);
    } // 🧾 Datos del usuario

    formData.append("nombre", formValue.firstName);
    formData.append("apellido", formValue.lastName);
    formData.append("correo", formValue.email);
    formData.append("telefono", formValue.phone || "");
    formData.append("rol", safeRole);

    if (formValue.password) {
      formData.append("contrasena", formValue.password);
    }

    this.dataService.createUser(formData).subscribe({
      next: () => {
        this.cargarUsuarios();
        this.resetForm();
        this.showAlert("Funcionario creado correctamente", "success");
      },
      error: (err) => {
        console.error(err);
        this.showAlert("Error creando funcionario", "danger");
      },
    });
  }

  editar(u: User) {
    if (u.role?.toLowerCase() === "administrador") {
      this.showAlert("No puedes editar administradores", "danger");
      return;
    }

    this.modo = "editar";
    this.editId = u.id;

    // 🔓 QUITAR VALIDADORES EN EDICIÓN
    this.form.get("firstName")?.clearValidators();
    this.form.get("lastName")?.clearValidators();
    this.form.get("email")?.clearValidators();
    this.form.get("role")?.clearValidators();

    this.form.updateValueAndValidity();

    // 🧼 limpiar estado foto
    this.selectedFile = null;
    this.quitarFotoFlag = false;

    this.form.patchValue({
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      phone: u.phone,
      role: u.role,
      password: "",
    });

    this.fotoPreview = u.photoUrl ?? "/usuario(1).png";

    if (this.fotoInput) {
      this.fotoInput.nativeElement.value = "";
    }

    this.showAlert("Modo edición activado", "success");
  }

  actualizar() {
    if (!this.editId) {
      this.showAlert("No se ha seleccionado un funcionario", "danger");
      return;
    }

    const formValue = this.form.value;
    const formData = new FormData();

    // 👇 SOLO enviar si existe valor
    if (formValue.firstName?.trim()) {
      formData.append("nombre", formValue.firstName);
    }

    if (formValue.lastName?.trim()) {
      formData.append("apellido", formValue.lastName);
    }

    if (formValue.email?.trim()) {
      formData.append("correo", formValue.email);
    }

    if (formValue.phone?.trim()) {
      formData.append("telefono", formValue.phone);
    }

    if (formValue.role?.trim()) {
      formData.append("rol", formValue.role.toLowerCase());
    }

    if (formValue.password?.trim()) {
      formData.append("contrasena", formValue.password);
    }

    // 📷 Nueva foto
    if (this.selectedFile) {
      formData.append("photo", this.selectedFile);
    }
    // ❌ Quitar foto
    else if (this.quitarFotoFlag) {
      formData.append("removePhoto", "true");
    }

    formData.forEach((v, k) => console.log(k, v));

    this.dataService.updateUser(this.editId, formData).subscribe({
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
        "No puedes eliminar usuarios con rol administrador",
        "danger"
      );
      return;
    }

    this.dataService.deleteUser(id).subscribe({
      next: () => {
        this.cargarUsuarios();

        if (this.editId === id) {
          this.resetForm();
        }

        this.showAlert("Funcionario eliminado correctamente", "success");
      },
      error: (err) => {
        console.error(err);
        this.showAlert("Error eliminando funcionario", "danger");
      },
    });
  }

  quitarFoto() {
    this.limpiarFotoInterna();
    this.quitarFotoFlag = true;
  }

  private limpiarFotoInterna(): void {
    this.selectedFile = null;
    this.fotoPreview = null;
    this.quitarFotoFlag = false;

    if (this.fotoInput) {
      this.fotoInput.nativeElement.value = "";
    }
  }
  confirmarEliminacion(id: number) {
    this.usuarioAEliminarId = id;
    this.mostrarConfirmacion = true;
  }

  cancelarEliminacion() {
    this.usuarioAEliminarId = null;
    this.mostrarConfirmacion = false;
  }

  confirmarEliminar() {
    if (!this.usuarioAEliminarId) return;

    this.eliminar(this.usuarioAEliminarId);

    this.usuarioAEliminarId = null;
    this.mostrarConfirmacion = false;
  }
}
