import { Component, OnInit, inject } from '@angular/core';
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

import { LayoutComponent } from '../../components/layout/layout.component';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import { Activity } from '../../models/activity.model';

import jsPDF from 'jspdf';

type Estado = Activity['estado'];

class MondayFirstDateAdapter extends NativeDateAdapter {
  override getFirstDayOfWeek(): number {
    return 1;
  }
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

interface UserGroup {
  userId: number;
  userName: string;
  activities: Activity[];
}

interface MonthGroup {
  monthKey: string;   // '2025-10'
  monthLabel: string; // 'Octubre 2025'
  users: UserGroup[];
}

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
export class ActivitiesHistoryComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dataService = inject(DataService);
  private authService = inject(AuthService);

  // Nombre de la secretaria logueada (para PDF y cabecera)
  secretaryName = '';

  // Datos crudos
  private allUsers: User[] = [];
  private allActivities: Activity[] = [];

  // Vista agrupada
  groupedMonths: MonthGroup[] = [];
  totalActivities = 0;

  // Filtros
  filters = this.fb.group({
    q: this.fb.control<string>(''),
    desde: this.fb.control<Date | null>(null),
    hasta: this.fb.control<Date | null>(null),
    estado: this.fb.control<'' | Estado>(''),
  });

  get estadoValue(): '' | Estado {
    return (this.filters.controls.estado.value ?? '') as '' | Estado;
  }

  ngOnInit(): void {
    // Cargar usuarios y actividades, luego construir la vista
    this.dataService.getUsers().subscribe({
      next: (users) => {
        this.allUsers = users;

        // Intentar obtener la secretaria logueada
        const currentId = this.authService.getUserId();
        const secretary = users.find(
          (u) => u.id === currentId && u.role === 'Secretaria'
        );
        this.secretaryName = secretary
          ? `${secretary.firstName} ${secretary.lastName}`
          : '';

        // Ahora cargar actividades
        this.dataService.getAllActivities().subscribe({
          next: (acts) => {
            this.allActivities = acts;
            this.rebuildView();
          },
          error: (err) =>
            console.error('Error cargando actividades:', err),
        });
      },
      error: (err) => console.error('Error cargando usuarios:', err),
    });

    // Reconstruir vista cuando cambian los filtros
    this.filters.valueChanges.subscribe(() => this.rebuildView());
  }

  // ================== LÓGICA DE VISTA ==================

  private rebuildView(): void {
    if (!this.allUsers.length || !this.allActivities.length) {
      this.groupedMonths = [];
      this.totalActivities = 0;
      return;
    }

    // Consideramos actividades solo de FUNCIONARIOS
    const funcionarioIds = new Set(
      this.allUsers
        .filter((u) => u.role === 'Funcionario')
        .map((u) => u.id)
    );

    const { q, desde, hasta, estado } = this.filters.getRawValue();
    const term = (q ?? '').trim().toLowerCase();

    const filtered = this.allActivities.filter((a) => {
      if (!funcionarioIds.has(a.userId)) return false;

      if (!this.inRange(a.fecha, desde ?? null, hasta ?? null)) return false;

      if (estado !== '' && a.estado !== estado) return false;

      if (term) {
        const user = this.allUsers.find((u) => u.id === a.userId);
        const userName = user
          ? `${user.firstName} ${user.lastName}`.toLowerCase()
          : '';

        const inText =
          a.titulo.toLowerCase().includes(term) ||
          a.detalle.toLowerCase().includes(term) ||
          a.estado.toLowerCase().includes(term) ||
          userName.includes(term);

        if (!inText) return false;
      }

      return true;
    });

    this.totalActivities = filtered.length;

    // Agrupar por mes y luego por usuario
    const byMonth = new Map<string, Activity[]>();

    for (const a of filtered) {
      const key = a.fecha.slice(0, 7); // 'YYYY-MM'
      const bucket = byMonth.get(key) ?? [];
      bucket.push(a);
      byMonth.set(key, bucket);
    }

    const months: MonthGroup[] = [];

    for (const [monthKey, acts] of byMonth.entries()) {
      // agrupar por usuario
      const byUser = new Map<number, Activity[]>();
      for (const a of acts) {
        const ua = byUser.get(a.userId) ?? [];
        ua.push(a);
        byUser.set(a.userId, ua);
      }

      const userGroups: UserGroup[] = Array.from(byUser.entries())
        .map(([userId, list]) => {
          const user = this.allUsers.find((u) => u.id === userId);
          const userName = user
            ? `${user.firstName} ${user.lastName}`
            : `Usuario ${userId}`;

          // Ordenar actividades dentro de usuario por fecha desc
          list.sort((a, b) =>
            a.fecha < b.fecha ? 1 : a.fecha > b.fecha ? -1 : 0
          );

          return { userId, userName, activities: list };
        })
        .sort((a, b) => a.userName.localeCompare(b.userName));

      months.push({
        monthKey,
        monthLabel: this.getMonthLabel(monthKey),
        users: userGroups,
      });
    }

    // Ordenar meses descendente
    months.sort((a, b) =>
      a.monthKey < b.monthKey ? 1 : a.monthKey > b.monthKey ? -1 : 0
    );

    this.groupedMonths = months;
  }

  // ================== UTILIDADES ==================

  private toISO(d: Date): string {
    return new Date(
      Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())
    )
      .toISOString()
      .slice(0, 10);
  }

  private inRange(
    iso: string,
    from?: Date | null,
    to?: Date | null
  ): boolean {
    const f = from ? this.toISO(from) : null;
    const t = to ? this.toISO(to) : null;
    if (f && iso < f) return false;
    if (t && iso > t) return false;
    return true;
  }

  formatDMY(iso: string): string {
    const [y, m, d] = iso.split('-').map(Number);
    return `${String(d).padStart(2, '0')}/${String(m).padStart(
      2,
      '0'
    )}/${y}`;
  }

  statusPillClass(est: '' | Estado): string {
    switch (est) {
      case 'Aprobada':
        return 'pill-status-aprobada';
      case 'Pendiente':
        return 'pill-status-pendiente';
      case 'Rechazada':
        return 'pill-status-rechazada';
      default:
        return 'pill-status-default';
    }
  }

  displayEstado(est: '' | Estado): string {
    return est === '' ? 'Todos' : est;
  }

  getMonthTotalActivities(month: MonthGroup): number {
    return month.users.reduce(
      (sum, u) => sum + u.activities.length,
      0
    );
  }

  private getMonthLabel(key: string): string {
    const [yearStr, monthStr] = key.split('-');
    const year = Number(yearStr);
    const month = Number(monthStr); // 1..12
    const meses = [
      'enero',
      'febrero',
      'marzo',
      'abril',
      'mayo',
      'junio',
      'julio',
      'agosto',
      'septiembre',
      'octubre',
      'noviembre',
      'diciembre',
    ];
    const nombre = meses[month - 1] ?? '';
    return `${nombre.charAt(0).toUpperCase()}${nombre.slice(
      1
    )} ${year}`;
  }

  clearFilters() {
    this.filters.reset({
      q: '',
      desde: null,
      hasta: null,
      estado: '',
    });
    this.rebuildView();
  }

  // ================== PDF POR MES ==================

  downloadMonthPdf(month: MonthGroup): void {
    const doc = new jsPDF();
    let y = 20;
    const marginX = 14;

    // Cabecera
    doc.setFontSize(14);
    const title = `Historial de actividades - ${month.monthLabel}`;
    doc.text(title, marginX, y);
    y += 8;

    doc.setFontSize(11);
    const secName =
      this.secretaryName || 'Secretaría (sin identificar)';
    doc.text(`Secretaria: ${secName}`, marginX, y);
    y += 10;

    // Contenido: por usuario
    month.users.forEach((ug) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }

      doc.setFontSize(12);
      doc.text(ug.userName, marginX, y);
      y += 6;

      doc.setFontSize(10);
      ug.activities.forEach((a) => {
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
        const line = `- ${this.formatDMY(a.fecha)} · ${a.titulo} · ${a.horas} h (${a.estado})`;
        doc.text(line, marginX, y);
        y += 5;
      });

      y += 4;
    });

    const cleanKey = month.monthKey.replace('-', '');
    doc.save(`reporte_actividades_${cleanKey}.pdf`);
  }
}
