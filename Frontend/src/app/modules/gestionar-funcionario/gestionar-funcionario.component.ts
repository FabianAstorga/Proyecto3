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
  usuarios = signal<Usuario[]>([]);
  private idSeq = 1;

  form: FormGroup;
  modo: 'crear' | 'editar' = 'crear';
  editId: number | null = null;

  readonly estados: ReadonlyArray<Usuario['estado']> = ['Activo', 'Inactivo'];

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
  }

  ngOnInit(): void {
    this.dataService.getUsers().subscribe({
      next: (users: User[]) => {
        const mapped: Usuario[] = users
          // si quieres todos, quita el filtro de role:
          .filter(u => u.role === 'Funcionario')
          .map(u => ({
            id: u.id,
            nombre: u.firstName,
            apellidos: u.lastName,
            correo: u.email,
            telefono: (u as any).phone ?? '',
            anexo: (u as any).anexo ?? '',
            url_horario: (u as any).horarioUrl ?? '',
            foto_url: (u as any).photoUrl ?? '',
            rut: (u as any).rut ?? '',
            estado: ((u as any).estado as Usuario['estado']) ?? 'Activo',
          }));

        this.idSeq =
          mapped.reduce((max, u) => (u.id > max ? u.id : max), 0) + 1;

        this.usuarios.set(mapped);
      },
      error: err => console.error('Error cargando usuarios:', err),
    });
  }

  get f() {
    return this.form.controls;
  }

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
  }

  crear() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const nuevo: Usuario = {
      id: this.idSeq++,
      ...(this.form.value as Omit<Usuario, 'id'>),
    };

    this.usuarios.update(list => [nuevo, ...list]);

    // Aquí luego puedes llamar a tu backend:
    // this.dataService.createFuncionario(nuevo).subscribe(...);

    this.resetForm();
  }

  editar(u: Usuario) {
    this.modo = 'editar';
    this.editId = u.id;
    this.form.patchValue(u);
  }

  actualizar() {
    if (this.form.invalid || this.editId == null) {
      this.form.markAllAsTouched();
      return;
    }

    const updated: Usuario = {
      id: this.editId,
      ...(this.form.value as Omit<Usuario, 'id'>),
    };

    this.usuarios.update(list =>
      list.map(x => (x.id === this.editId ? updated : x))
    );

    // this.dataService.updateFuncionario(updated).subscribe(...);

    this.resetForm();
  }

  eliminar(id: number) {
    if (!confirm('¿Eliminar funcionario?')) return;

    this.usuarios.update(list => list.filter(u => u.id !== id));

    // this.dataService.deleteFuncionario(id).subscribe(...);

    if (this.editId === id) {
      this.resetForm();
    }
  }
}
