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
  monthKey: string;  // '2025-10'
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
    MatOptionModule, // NECESARIO para mat-option en el template
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

  // Nombre de la secretaria logueada (para PDF)
  secretaryName = '';

  // Datos crudos
  private allUsers: User[] = [];
  private allActivities: Activity[] = [];

  // Vista agrupada por mes
  groupedMonths: MonthGroup[] = [];
  totalActivities = 0;

  // Índice del mes actualmente visible (0 = más reciente)
  currentMonthIndex = 0;

  // Filtros (aunque ya no tengan UI, se mantienen por si se usan luego)
  filters = this.fb.group({
    q: this.fb.control<string>(''),
    desde: this.fb.control<Date | null>(null),
    hasta: this.fb.control<Date | null>(null),
    estado: this.fb.control<'' | Estado>(''),
  });

  get estadoValue(): '' | Estado {
    return (this.filters.controls.estado.value ?? '') as '' | Estado;
  }

  /** Mes actualmente visible en la UI */
  get currentMonthGroup(): MonthGroup | null {
    if (!this.groupedMonths.length) return null;
    return this.groupedMonths[this.currentMonthIndex] ?? null;
  }

  /** ¿Hay mes anterior? (más antiguo) */
  get hasPrevMonth(): boolean {
    return this.currentMonthIndex < this.groupedMonths.length - 1;
  }

  /** ¿Hay mes siguiente? (más reciente) */
  get hasNextMonth(): boolean {
    return this.currentMonthIndex > 0;
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

  // ================== NAVEGACIÓN ENTRE MESES ==================

  goPrevMonth(): void {
    if (this.hasPrevMonth) {
      this.currentMonthIndex++;
    }
  }

  goNextMonth(): void {
    if (this.hasNextMonth) {
      this.currentMonthIndex--;
    }
  }

  // ================== LÓGICA DE VISTA ==================
  private rebuildView(): void {
    if (!this.allUsers.length || !this.allActivities.length) {
      this.groupedMonths = [];
      this.totalActivities = 0;
      this.currentMonthIndex = 0;
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
      // si no tiene usuario asociado, la descartamos
      if (a.userId == null) return false;

      // solo actividades de funcionarios
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
        // si por alguna razón llega sin userId, la saltamos
        if (a.userId == null) continue;

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

    // Ordenar meses descendente (más reciente primero)
    months.sort((a, b) =>
      a.monthKey < b.monthKey ? 1 : a.monthKey > b.monthKey ? -1 : 0
    );

    this.groupedMonths = months;

    // Siempre mostrar el mes más reciente al reconstruir
    this.currentMonthIndex = this.groupedMonths.length ? 0 : 0;
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

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const marginX = 14;
  let y = 20;

  // Helper para fecha corta tipo 17-oct
  const formatShort = (iso: string): string => {
    const [yearStr, monthStr, dayStr] = iso.split('-');
    const d = Number(dayStr);
    const m = Number(monthStr);
    const meses = [
      'ene', 'feb', 'mar', 'abr', 'may', 'jun',
      'jul', 'ago', 'sept', 'oct', 'nov', 'dic',
    ];
    return `${String(d).padStart(2, '0')}-${meses[m - 1] ?? ''}`;
  };

  // ========================
  // TÍTULO PRINCIPAL
  // ========================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.text('Resumen de actividades', pageWidth / 2, y, { align: 'center' });
  y += 8;

  // Subtítulo: mes + secretaria
  const secName = this.secretaryName || 'Secretaría (sin identificar)';
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(90, 90, 90);
  doc.text(
    `${month.monthLabel.toLowerCase()} — Informe creado por ${secName}`,
    pageWidth / 2,
    y,
    { align: 'center' }
  );
  y += 10;

  // Línea suave debajo del subtítulo
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 8;

  // ========================
  // CONFIG TABLA
  // ========================
  const tableMarginX = marginX;
  const tableWidth = pageWidth - tableMarginX * 2;
  const headerHeight = 8;
  const lineHeight = 6;

  const dateColWidth = 26;
  const statusColWidth = 32;
  const activityColWidth = tableWidth - dateColWidth - statusColWidth;

  const bottomMargin = 20;

  // ========================
  // POR CADA USUARIO
  // ========================
  month.users.forEach((ug) => {
    if (y > pageHeight - bottomMargin - 40) {
      doc.addPage();
      y = 20;
    }

    // Nombre del usuario
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(0, 0, 0);
    doc.text(ug.userName, tableMarginX, y);
    y += 6;

    // ---- calcular altos de filas ----
    let bodyHeight = 0;
    const rowHeights: number[] = [];

    ug.activities.forEach((a) => {
      const lineaBase = `${a.titulo} — ${a.detalle || ''}`.trim();
      const wrapped = doc.splitTextToSize(
        lineaBase,
        activityColWidth - 4
      );
      const rowHeight = Math.max(lineHeight, wrapped.length * lineHeight);
      rowHeights.push(rowHeight);
      bodyHeight += rowHeight;
    });

    const tableHeight = headerHeight + bodyHeight + 6;

    if (y + tableHeight > pageHeight - bottomMargin) {
      doc.addPage();
      y = 20;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(0, 0, 0);
      doc.text(ug.userName, tableMarginX, y);
      y += 6;
    }

    const tableY = y;

    // Contenedor redondeado (solo borde)
    doc.setDrawColor(210, 210, 210);
    doc.setLineWidth(0.6);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(tableMarginX, tableY, tableWidth, tableHeight, 4, 4, 'S');

    // --- “zona segura” interna para no tocar las esquinas ---
    const innerX = tableMarginX + 1;
    const innerWidth = tableWidth - 2;
    const innerTop = tableY + 0.8;
    const innerBottom = tableY + tableHeight - 0.8;

    // Header de la tabla (rectángulo un poco más pequeño)
    doc.setFillColor(245, 245, 245);
    doc.rect(innerX, innerTop, innerWidth, headerHeight - 0.3, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);

    const headerBaseline = innerTop + headerHeight - 2;
    doc.text('Fecha', innerX + 4, headerBaseline);
    doc.text(
      'Actividad',
      innerX + dateColWidth + 4,
      headerBaseline
    );
    doc.text(
      'Estado',
      innerX + dateColWidth + activityColWidth + 4,
      headerBaseline
    );

    // Líneas verticales (un poco más cortas para no pisar las esquinas)
    doc.setDrawColor(230, 230, 230);
    const v1 = innerX + dateColWidth;
    const v2 = innerX + dateColWidth + activityColWidth;
    doc.line(v1, innerTop, v1, innerBottom);
    doc.line(v2, innerTop, v2, innerBottom);

    // ---- CUERPO DE LA TABLA ----
    let currentY = innerTop + headerHeight + 4;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.setDrawColor(235, 235, 235);

    ug.activities.forEach((a, idx) => {
      const rowHeight = rowHeights[idx];

      // Fecha
      const fechaTxt = formatShort(a.fecha);
      doc.text(
        fechaTxt,
        innerX + 4,
        currentY + lineHeight
      );

      // Actividad
      const actividadTxt = `${a.titulo} — ${a.detalle || ''}`.trim();
      const wrapped = doc.splitTextToSize(
        actividadTxt,
        activityColWidth - 4
      );
      doc.text(
        wrapped,
        innerX + dateColWidth + 4,
        currentY + lineHeight
      );

      // Estado como pill
      const estadoLabel = a.estado;
      let pillFill: [number, number, number];
      let pillText: [number, number, number];

      switch (a.estado) {
        case 'Aprobada':
          pillFill = [222, 247, 236];
          pillText = [22, 101, 52];
          break;
        case 'Pendiente':
          pillFill = [255, 243, 205];
          pillText = [133, 77, 14];
          break;
        case 'Rechazada':
          pillFill = [254, 226, 226];
          pillText = [153, 27, 27];
          break;
        default:
          pillFill = [229, 231, 235];
          pillText = [55, 65, 81];
          break;
      }

      const estadoX = innerX + dateColWidth + activityColWidth;
      const pillPaddingX = 3;
      const pillHeight = lineHeight + 2;
      const textWidth = doc.getTextWidth(estadoLabel);
      const pillWidth = textWidth + pillPaddingX * 2;

      const pillX =
        estadoX + (statusColWidth - pillWidth) / 2;
      const pillY =
        currentY + (rowHeight - pillHeight) / 2;

      doc.setFillColor(...pillFill);
      doc.roundedRect(
        pillX,
        pillY,
        pillWidth,
        pillHeight,
        3,
        3,
        'F'
      );

      doc.setTextColor(...pillText);
      doc.setFont('helvetica', 'bold');
      doc.text(
        estadoLabel,
        pillX + pillPaddingX,
        pillY + pillHeight - 2
      );

      // reset
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);

      // Línea horizontal de la fila (también dentro de la zona segura)
      const rowBottom = currentY + rowHeight;
      doc.setDrawColor(235, 235, 235);
      doc.line(innerX, rowBottom, innerX + innerWidth, rowBottom);

      currentY += rowHeight;
    });

    y = tableY + tableHeight + 10;
  });

  const cleanKey = month.monthKey.replace('-', '');
  doc.save(`reporte_actividades_${cleanKey}.pdf`);
}


}