import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  MatNativeDateModule,
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
  NativeDateAdapter,
  MatOptionModule, // <-- para <mat-option>
} from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';

import { LayoutComponent } from '../../../components/layout/layout.component';

/** ===== Tipos ===== */
type Estado = 'Aprobada' | 'Pendiente' | 'Rechazada';
type Activity = {
  fecha: string; // ISO 'YYYY-MM-DD'
  titulo: string;
  detalle: string;
  estado: Estado;
  horas: number;
};

/** ===== Adapter: lunes como primer día ===== */
class MondayFirstDateAdapter extends NativeDateAdapter {
  override getFirstDayOfWeek(): number {
    return 1;
  } // 1 = lunes
}

/** ===== Formatos de fecha: dd/MM/yyyy ===== */
export const ES_DATE_FORMATS = {
  parse: { dateInput: 'dd/MM/yyyy' },
  display: {
    dateInput: 'dd/MM/yyyy',
    monthYearLabel: 'MMMM yyyy',
    dateA11yLabel: 'dd/MM/yyyy',
    monthYearA11yLabel: 'MMMM yyyy',
  },
};

@Component({
  selector: 'app-activities-history',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatOptionModule,
    LayoutComponent,
  ],
  templateUrl: './activities-history.component.html',
  styleUrls: ['./activities-history.component.scss'],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-CL' },
    { provide: DateAdapter, useClass: MondayFirstDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: ES_DATE_FORMATS },
  ],
})
export class ActivitiesHistoryComponent {
  private fb = inject(FormBuilder);

  /** Navbar/Sidebar del layout */
  navItems = [
    { label: 'Inicio perfil', link: '/perfil' },
    { label: 'Agregar registro', link: '/actividades/nueva' },
    { label: 'Horario', link: '/horario' },
    { label: 'Historial', link: '/actividades/historial' },
  ];

  /** Filtros (tipados) */
  filters = this.fb.group({
    q: this.fb.control<string>(''),
    desde: this.fb.control<Date | null>(null),
    hasta: this.fb.control<Date | null>(null),
    estado: this.fb.control<'' | Estado>(''), // '' = Todos
  });

  /** Accesores seguros para el template */
  get estadoValue(): '' | Estado {
    return (this.filters.controls.estado.value ?? '') as '' | Estado;
  }

  /** Datos demo */
  activities: Activity[] = [
    {
      fecha: '2025-10-15',
      titulo: 'Taller de CAD',
      detalle: 'Modelado 3D',
      estado: 'Aprobada',
      horas: 4,
    },
    {
      fecha: '2025-10-12',
      titulo: 'Capacitación Docente',
      detalle: 'Uso de plataformas virtuales',
      estado: 'Aprobada',
      horas: 3,
    },
    {
      fecha: '2025-10-10',
      titulo: 'Seminario de Materiales',
      detalle: 'Compósitos avanzados',
      estado: 'Pendiente',
      horas: 2,
    },
    {
      fecha: '2025-10-09',
      titulo: 'Reunión de Facultad',
      detalle: 'Proyectos de investigación',
      estado: 'Pendiente',
      horas: 2,
    },
    {
      fecha: '2025-10-05',
      titulo: 'Voluntariado Feria UTA',
      detalle: 'Apoyo logístico',
      estado: 'Aprobada',
      horas: 5,
    },
    {
      fecha: '2025-10-03',
      titulo: 'Evaluación Parcial',
      detalle: 'Aplicación de prueba a estudiantes',
      estado: 'Aprobada',
      horas: 6,
    },
    {
      fecha: '2025-09-29',
      titulo: 'Asesoría Académica',
      detalle: 'Orientación a estudiantes de primer año',
      estado: 'Rechazada',
      horas: 1,
    },
    {
      fecha: '2025-09-22',
      titulo: 'Charla de Seguridad',
      detalle: 'Protocolos en laboratorio',
      estado: 'Aprobada',
      horas: 2,
    },
    {
      fecha: '2025-09-14',
      titulo: 'Taller de Programación',
      detalle: 'Introducción a Python',
      estado: 'Aprobada',
      horas: 4,
    },
    {
      fecha: '2025-09-05',
      titulo: 'Reunión con Dirección',
      detalle: 'Planificación semestre',
      estado: 'Pendiente',
      horas: 1,
    },
  ];

  /** ===== Utils ===== */
  private toISO(d: Date): string {
    return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
      .toISOString()
      .slice(0, 10);
  }
  private inRange(iso: string, from?: Date | null, to?: Date | null): boolean {
    const f = from ? this.toISO(from) : null;
    const t = to ? this.toISO(to) : null;
    if (f && iso < f) return false;
    if (t && iso > t) return false;
    return true;
  }
  formatDMY(iso: string): string {
    const [y, m, d] = iso.split('-').map(Number);
    return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;
  }

  /** Clase de color para estados (Tailwind) */
  statusPillClass(est: '' | Estado): string {
    switch (est) {
      case 'Aprobada':
        return 'bg-emerald-500/10 text-emerald-700 border-emerald-300';
      case 'Pendiente':
        return 'bg-amber-500/10 text-amber-700 border-amber-300';
      case 'Rechazada':
        return 'bg-red-500/10 text-red-700 border-red-300';
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-300';
    }
  }

  displayEstado(est: '' | Estado): string {
    return est === '' ? 'Todos' : est;
  }

  /** Lista filtrada + ordenada (fecha desc) */
  get filtered(): Activity[] {
    const { q, desde, hasta, estado } = this.filters.getRawValue();
    const term = (q ?? '').trim().toLowerCase();

    return this.activities
      .filter(
        (a) =>
          this.inRange(a.fecha, desde ?? null, hasta ?? null) &&
          ((estado ?? '') === '' || a.estado === estado) &&
          (term === '' ||
            a.titulo.toLowerCase().includes(term) ||
            a.detalle.toLowerCase().includes(term) ||
            a.estado.toLowerCase().includes(term))
      )
      .sort((a, b) => (a.fecha < b.fecha ? 1 : a.fecha > b.fecha ? -1 : 0));
  }

  clearFilters() {
    this.filters.reset({ q: '', desde: null, hasta: null, estado: '' });
  }
}
