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
  MatOptionModule,
} from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';

import { LayoutComponent } from '../../../components/layout/layout.component';
import { FUNCIONARIO_NAV_ITEMS } from '../profile-home/funcionario.nav';

type Estado = 'Aprobada' | 'Pendiente' | 'Rechazada';
type Activity = {
  fecha: string;
  titulo: string;
  detalle: string;
  estado: Estado;
  horas: number;
};

class MondayFirstDateAdapter extends NativeDateAdapter {
  override getFirstDayOfWeek(): number { return 1; }
}

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

  // ==== NAV del layout (usado por el template) ====
  funcionarioNavItems = FUNCIONARIO_NAV_ITEMS;

  // (el template muestra/oculta modal en algunos casos: proveemos banderas y métodos)
  showDetails = false;
  openDetails() { this.showDetails = true; }
  closeDetails() { this.showDetails = false; }

  // ==== Filtros ====
  filters = this.fb.group({
    q: this.fb.control<string>(''),
    desde: this.fb.control<Date | null>(null),
    hasta: this.fb.control<Date | null>(null),
    estado: this.fb.control<'' | Estado>(''),
  });

  get estadoValue(): '' | Estado {
    return (this.filters.controls.estado.value ?? '') as '' | Estado;
  }

  // ==== Datos demo ====
  activities: Activity[] = [
    { fecha: '2025-10-15', titulo: 'Taller de CAD', detalle: 'Modelado 3D', estado: 'Aprobada', horas: 4 },
    { fecha: '2025-10-12', titulo: 'Capacitación Docente', detalle: 'Uso de plataformas virtuales', estado: 'Aprobada', horas: 3 },
    { fecha: '2025-10-10', titulo: 'Seminario de Materiales', detalle: 'Compósitos avanzados', estado: 'Pendiente', horas: 2 },
    { fecha: '2025-10-09', titulo: 'Reunión de Facultad', detalle: 'Proyectos de investigación', estado: 'Pendiente', horas: 2 },
    { fecha: '2025-10-05', titulo: 'Voluntariado Feria UTA', detalle: 'Apoyo logístico', estado: 'Aprobada', horas: 5 },
    { fecha: '2025-10-03', titulo: 'Evaluación Parcial', detalle: 'Aplicación de prueba', estado: 'Aprobada', horas: 6 },
    { fecha: '2025-09-29', titulo: 'Asesoría Académica', detalle: 'Orientación a estudiantes', estado: 'Rechazada', horas: 1 },
    { fecha: '2025-09-22', titulo: 'Charla de Seguridad', detalle: 'Protocolos', estado: 'Aprobada', horas: 2 },
    { fecha: '2025-09-14', titulo: 'Taller de Programación', detalle: 'Intro a Python', estado: 'Aprobada', horas: 4 },
    { fecha: '2025-09-05', titulo: 'Reunión con Dirección', detalle: 'Planificación', estado: 'Pendiente', horas: 1 },
  ];

  // ==== Utils ====
  private toISO(d: Date): string {
    return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())).toISOString().slice(0, 10);
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

  statusPillClass(est: '' | Estado): string {
    switch (est) {
      case 'Aprobada': return 'bg-emerald-500/10 text-emerald-700 border-emerald-300';
      case 'Pendiente': return 'bg-amber-500/10 text-amber-700 border-amber-300';
      case 'Rechazada': return 'bg-red-500/10 text-red-700 border-red-300';
      default:          return 'bg-gray-500/10 text-gray-700 border-gray-300';
    }
  }
  displayEstado(est: '' | Estado): string { return est === '' ? 'Todos' : est; }

  get filtered(): Activity[] {
    const { q, desde, hasta, estado } = this.filters.getRawValue();
    const term = (q ?? '').trim().toLowerCase();
    return this.activities
      .filter(a =>
        this.inRange(a.fecha, desde ?? null, hasta ?? null) &&
        ((estado ?? '') === '' || a.estado === estado) &&
        (term === '' ||
          a.titulo.toLowerCase().includes(term) ||
          a.detalle.toLowerCase().includes(term) ||
          a.estado.toLowerCase().includes(term)))
      .sort((a, b) => (a.fecha < b.fecha ? 1 : a.fecha > b.fecha ? -1 : 0));
  }

  clearFilters() {
    this.filters.reset({ q: '', desde: null, hasta: null, estado: '' });
  }
}
