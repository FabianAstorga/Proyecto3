import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup,
} from '@angular/forms';
import { LayoutComponent } from '../../../components/layout/layout.component';
import { SECRETARIA_NAV_ITEMS } from '../profile-home/secretaria.nav';

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
export class GestionarFuncionarioComponent {
  // iMPORTAR NAV SECRETARIA
  secretariaNavItems = SECRETARIA_NAV_ITEMS;
  // listado demo en memoria
  usuarios = signal<Usuario[]>([
    {
      id: 1,
      nombre: 'María',
      apellidos: 'Navarrete Bustamante',
      correo: 'mnavarrete@uta.cl',
      telefono: '+56 58 220 5282',
      anexo: '35282',
      url_horario: 'https://intranet/horario/mnavarrete',
      estado: 'Activo',
    },
    {
      id: 2,
      nombre: 'Luis',
      apellidos: 'Araya Tapia',
      correo: 'laraya@uta.cl',
      telefono: '+56 58 220 4010',
      anexo: '34010',
      estado: 'Inactivo',
    },
  ]);

  private idSeq = 3;

  form: FormGroup;
  modo: 'crear' | 'editar' = 'crear';
  editId: number | null = null;

  estados = ['Activo', 'Inactivo'] as const;

  constructor(private fb: FormBuilder) {
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
    this.usuarios.update((list) => [nuevo, ...list]);
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
    const updated = {
      id: this.editId,
      ...(this.form.value as Omit<Usuario, 'id'>),
    } as Usuario;
    this.usuarios.update((list) =>
      list.map((x) => (x.id === this.editId ? updated : x))
    );
    this.resetForm();
  }

  eliminar(id: number) {
    if (!confirm('¿Eliminar funcionario?')) return;
    this.usuarios.update((list) => list.filter((u) => u.id !== id));
    if (this.editId === id) this.resetForm();
  }
}
