// src/app/pages/gestionar-funcionario/gestionar-funcionario.component.ts
import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup,
} from '@angular/forms';
import { LayoutComponent } from '../../components/layout/layout.component';
import { DataService } from '../../services/data.service';
import { User } from '../../models/user.model';

type Usuario = {
  id: number;
  nombre: string;
  apellidos: string;
  correo: string;
  telefono?: string;
  anexo?: string;
  url_horario?: string;
  foto_url?: string;
  rut?: string;
  estado: 'Activo' | 'Inactivo';
};

@Component({
  standalone: true,
  selector: 'app-gestionar-funcionario',
  imports: [CommonModule, ReactiveFormsModule, LayoutComponent],
  templateUrl: './gestionar-funcionario.component.html',
  styleUrls: ['./gestionar-funcionario.component.scss'],
})
export class GestionarFuncionarioComponent implements OnInit {
  // Lista reactiva de usuarios para la tabla
  usuarios = signal<Usuario[]>([]);

  form: FormGroup;
  modo: 'crear' | 'editar' = 'crear';
  editId: number | null = null;

  readonly estados: ReadonlyArray<Usuario['estado']> = ['Activo', 'Inactivo'];

  // Alertas
  alertMessage = '';
  alertType: 'success' | 'danger' | 'warning' = 'success';

  constructor(
    private fb: FormBuilder,
    private dataService: DataService
  ) {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(80)]],
      apellidos: ['', [Validators.required, Validators.maxLength(120)]],
      correo: ['', [Validators.required, Validators.email]],
      telefono: [''],
      anexo: [''],
      url_horario: [''],
      foto_url: [''],
      rut: [''],
      estado: ['Activo', Validators.required],
    });

    this.setValidatorsByMode(); // modo inicial: crear
  }

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  get f() {
    return this.form.controls;
  }

  // ================= Lógica de alertas =================
  showAlert(message: string, type: 'success' | 'danger' | 'warning') {
    this.alertMessage = message;
    this.alertType = type;
    setTimeout(() => (this.alertMessage = ''), 4000);
  }

  // ================= Carga inicial =================
cargarUsuarios() {
  this.dataService.getUsers().subscribe({
    next: (users: any[]) => {
      const mapped: Usuario[] = users.map((u: any) => ({
        id: u.id,
        nombre: u.firstName,
        apellidos: u.lastName,
        correo: u.email,
        telefono: u.phone ?? '',
        anexo: u.anexo ?? '',
        url_horario: u.horarioUrl ?? '',
        foto_url: u.photoUrl ?? '',
        rut: u.rut ?? '',
        // si el backend no tiene estado, caemos en 'Activo'
        estado: (u.estado as Usuario['estado']) ?? 'Activo',
      }));

      this.usuarios.set(mapped);
    },
    error: (err) => {
      console.error('Error cargando usuarios:', err);
      this.showAlert('Error cargando usuarios', 'danger');
    },
  });
}

  // ================= Form helpers =================
  resetForm() {
    this.form.reset({
      nombre: '',
      apellidos: '',
      correo: '',
      telefono: '',
      anexo: '',
      url_horario: '',
      foto_url: '',
      rut: '',
      estado: 'Activo',
    });
    this.modo = 'crear';
    this.editId = null;
    this.setValidatorsByMode();
    this.showAlert('Formulario limpiado correctamente', 'warning');
  }

  private setValidatorsByMode() {
    if (this.modo === 'crear') {
      this.form
        .get('nombre')
        ?.setValidators([Validators.required, Validators.maxLength(80)]);
      this.form
        .get('apellidos')
        ?.setValidators([Validators.required, Validators.maxLength(120)]);
      this.form
        .get('correo')
        ?.setValidators([Validators.required, Validators.email]);
      // El resto opcionales por ahora
      this.form.get('estado')?.setValidators([Validators.required]);
    } else {
      // En edición, todos opcionales (puedes endurecer esto si lo necesitas)
      this.form.get('nombre')?.clearValidators();
      this.form.get('apellidos')?.clearValidators();
      this.form.get('correo')?.clearValidators();
      this.form.get('telefono')?.clearValidators();
      this.form.get('anexo')?.clearValidators();
      this.form.get('url_horario')?.clearValidators();
      this.form.get('foto_url')?.clearValidators();
      this.form.get('rut')?.clearValidators();
      this.form.get('estado')?.clearValidators();
    }
    this.form.updateValueAndValidity();
  }

  // ================= CRUD =================
  crear() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.showAlert('Por favor complete correctamente los campos', 'danger');
      return;
    }

    const v = this.form.value;

    const nuevoUsuario = {
      nombre: v.nombre,
      apellidos: v.apellidos,
      correo: v.correo,
      telefono: v.telefono,
      anexo: v.anexo,
      url_horario: v.url_horario,
      foto_url: v.foto_url,
      rut: v.rut,
      estado: v.estado,
    };

    this.dataService.createUser(nuevoUsuario).subscribe({
      next: () => {
        this.cargarUsuarios();
        this.resetForm();
        this.showAlert('Funcionario creado correctamente', 'success');
      },
      error: (err) => {
        console.error('Error creando funcionario:', err);
        this.showAlert('Error creando funcionario', 'danger');
      },
    });
  }

  editar(u: Usuario) {
    this.modo = 'editar';
    this.editId = u.id;
    this.setValidatorsByMode();

    this.form.patchValue({
      nombre: u.nombre,
      apellidos: u.apellidos,
      correo: u.correo,
      telefono: u.telefono,
      anexo: u.anexo,
      url_horario: u.url_horario,
      foto_url: u.foto_url,
      rut: u.rut,
      estado: u.estado,
    });

    this.showAlert('Modo edición activado', 'success');
  }

  actualizar() {
    if (this.editId == null) {
      this.showAlert('No se ha seleccionado un funcionario', 'danger');
      return;
    }

    const v = this.form.value;
    const updatedUsuario: any = {};

    if (v.nombre) updatedUsuario.nombre = v.nombre;
    if (v.apellidos) updatedUsuario.apellidos = v.apellidos;
    if (v.correo) updatedUsuario.correo = v.correo;
    if (v.telefono) updatedUsuario.telefono = v.telefono;
    if (v.anexo) updatedUsuario.anexo = v.anexo;
    if (v.url_horario) updatedUsuario.url_horario = v.url_horario;
    if (v.foto_url) updatedUsuario.foto_url = v.foto_url;
    if (v.rut) updatedUsuario.rut = v.rut;
    if (v.estado) updatedUsuario.estado = v.estado;

    if (Object.keys(updatedUsuario).length === 0) {
      this.showAlert('No hay cambios para actualizar', 'warning');
      return;
    }

    this.dataService.updateUser(this.editId, updatedUsuario).subscribe({
      next: () => {
        this.cargarUsuarios();
        this.resetForm();
        this.showAlert('Funcionario actualizado correctamente', 'success');
      },
      error: (err) => {
        console.error('Error actualizando funcionario:', err);
        this.showAlert('Error actualizando funcionario', 'danger');
      },
    });
  }

  eliminar(id: number) {
    if (!confirm('¿Eliminar funcionario?')) return;

    this.dataService.deleteUser(id).subscribe({
      next: () => {
        this.cargarUsuarios();
        if (this.editId === id) this.resetForm();
        this.showAlert('Funcionario eliminado correctamente', 'warning');
      },
      error: (err) => {
        console.error('Error eliminando funcionario:', err);
        this.showAlert('Error eliminando funcionario', 'danger');
      },
    });
  }
}
