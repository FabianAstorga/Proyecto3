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

  // === Filtros (q = texto, mes = número de mes, estado) ===
  filters = this.fb.group({
    q: this.fb.control<string>(''),
    mes: this.fb.control<string>(''), // '1'..'12' o '' (todos)
    estado: this.fb.control<'' | Estado>(''),
  });

  // Opciones del selector de meses (para el template)
  meses = [
    { value: '1', label: 'Enero' },
    { value: '2', label: 'Febrero' },
    { value: '3', label: 'Marzo' },
    { value: '4', label: 'Abril' },
    { value: '5', label: 'Mayo' },
    { value: '6', label: 'Junio' },
    { value: '7', label: 'Julio' },
    { value: '8', label: 'Agosto' },
    { value: '9', label: 'Septiembre' },
    { value: '10', label: 'Octubre' },
    { value: '11', label: 'Noviembre' },
    { value: '12', label: 'Diciembre' },
  ];

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

    const { q, mes, estado } = this.filters.getRawValue();
    const term = (q ?? '').trim().toLowerCase();
    const mesNumber = mes ? Number(mes) : null;

    const filtered = this.allActivities.filter((a) => {
      // si no tiene usuario asociado, la descartamos
      if (a.userId == null) return false;

      // solo actividades de funcionarios
      if (!funcionarioIds.has(a.userId)) return false;

      // filtro por mes (solo número de mes, sin año)
      if (mesNumber !== null) {
        const activityMonth = Number(a.fecha.slice(5, 7)); // 'YYYY-MM-DD'
        if (activityMonth !== mesNumber) return false;
      }

      // filtro por estado
      if (estado !== '' && a.estado !== estado) return false;

      // filtro por texto
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
    this.currentMonthIndex = this.groupedMonths.length ? 0 : 0;
  }

  // ================== UTILIDADES ==================

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
      mes: '',
      estado: '',
    });
    this.rebuildView();
  }

  // ================== PDF POR MES (CON LOGOS Y FIRMAS) ==================

  downloadMonthPdf(month: MonthGroup): void {
    const doc = new jsPDF();

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const marginX = 14;
    let y = 20;

    // === 0. LOGOS DEPARTAMENTO (PLACEHOLDERS logdim1 / logdim2) ===
    // Reemplazar estos rectángulos por:
    // doc.addImage(logdim1, 'PNG/JPEG', x, y, w, h);
    // doc.addImage(logdim2, 'PNG/JPEG', x, y, w, h);
    const logoWidth = 30;
    const logoHeight = 15;

    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(255, 255, 255);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);

    // Logo izquierdo (logdim1)
    doc.rect(marginX, 10, logoWidth, logoHeight);
    doc.text(
      'logdim1',
      marginX + logoWidth / 2,
      10 + logoHeight / 2 + 2,
      { align: 'center' }
    );

    // Logo derecho (logdim2)
    const rightLogoX = pageWidth - marginX - logoWidth;
    doc.rect(rightLogoX, 10, logoWidth, logoHeight);
    doc.text(
      'logdim2',
      rightLogoX + logoWidth / 2,
      10 + logoHeight / 2 + 2,
      { align: 'center' }
    );

    // Bajamos un poco más el cursor de escritura para el título
    y = 32;

    // Función para formatear la fecha a 'DD-mes' (ej: 21-nov)
    const formatShort = (iso: string): string => {
      const [_, monthStr, dayStr] = iso.split('-');
      const d = Number(dayStr);
      const m = Number(monthStr); // 1..12
      const meses = [
        'ene',
        'feb',
        'mar',
        'abr',
        'may',
        'jun',
        'jul',
        'ago',
        'sept',
        'oct',
        'nov',
        'dic',
      ];
      return `${String(d).padStart(2, '0')}-${meses[m - 1] ?? ''}`;
    };

    // === 1. ENCABEZADO PRINCIPAL (TÍTULO Y SECRETARIA) ===
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text('Resumen de actividades', pageWidth / 2, y, {
      align: 'center',
    });
    y += 8;

    const secName =
      this.secretaryName || 'Secretaría (sin identificar)';
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

    const tableMarginX = marginX;
    const tableWidth = pageWidth - tableMarginX * 2;
    const headerHeight = 10;
    const lineHeight = 8; // Altura base de línea de texto

    const dateColWidth = 36;
    const statusColWidth = 42;
    const activityColWidth = tableWidth - dateColWidth - statusColWidth; // Columna flexible

    const bottomMargin = 30;

    // === 2. ITERAR POR FUNCIONARIO Y DIBUJAR TABLA + FIRMA DE FUNCIONARIO ===
    month.users.forEach((ug) => {
      // Verificar espacio y agregar página si es necesario
      if (y > pageHeight - bottomMargin - 40) {
        doc.addPage();
        y = 20;

        // Volver a dibujar logos en la nueva página
        const newPageLogoY = 10;
        doc.setDrawColor(200, 200, 200);
        doc.setFillColor(255, 255, 255);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);

        doc.rect(marginX, newPageLogoY, logoWidth, logoHeight);
        doc.text(
          'logdim1',
          marginX + logoWidth / 2,
          newPageLogoY + logoHeight / 2 + 2,
          { align: 'center' }
        );

        const newRightLogoX = pageWidth - marginX - logoWidth;
        doc.rect(newRightLogoX, newPageLogoY, logoWidth, logoHeight);
        doc.text(
          'logdim2',
          newRightLogoX + logoWidth / 2,
          newPageLogoY + logoHeight / 2 + 2,
          { align: 'center' }
        );

        y = 32;
      }

      // Nombre del Funcionario
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text(ug.userName, tableMarginX, y);
      y += 6;

      // --- 2.1. Calcular altura de la tabla y bloque de firma ---
      let bodyHeight = 0;
      const rowHeights: number[] = [];

      doc.setFontSize(11);
      ug.activities.forEach((a) => {
        const lineaBase = `${a.titulo} — ${a.detalle || ''}`.trim();
        const wrapped = doc.splitTextToSize(
          lineaBase,
          activityColWidth - 8 // margen interno
        );
        const minRowHeight = 14;
        const rowHeight = Math.max(
          minRowHeight,
          wrapped.length * lineHeight + 4
        );
        rowHeights.push(rowHeight);
        bodyHeight += rowHeight;
      });

      const tableHeight = headerHeight + bodyHeight + 2;
      const gapBetweenTableAndSignature = 10;
      const signatureBlockHeight = 14; // espacio para "Firma funcionario" + línea
      const gapAfterSignature = 6;

      const totalBlockHeight =
        tableHeight +
        gapBetweenTableAndSignature +
        signatureBlockHeight +
        gapAfterSignature;

      // Control de salto de página antes de dibujar la tabla + firma
      if (y + totalBlockHeight > pageHeight - bottomMargin) {
        doc.addPage();
        y = 20;

        // Logos en la nueva página
        const newPageLogoY = 10;
        doc.setDrawColor(200, 200, 200);
        doc.setFillColor(255, 255, 255);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);

        doc.rect(marginX, newPageLogoY, logoWidth, logoHeight);
        doc.text(
          'logdim1',
          marginX + logoWidth / 2,
          newPageLogoY + logoHeight / 2 + 2,
          { align: 'center' }
        );

        const newRightLogoX = pageWidth - marginX - logoWidth;
        doc.rect(newRightLogoX, newPageLogoY, logoWidth, logoHeight);
        doc.text(
          'logdim2',
          newRightLogoX + logoWidth / 2,
          newPageLogoY + logoHeight / 2 + 2,
          { align: 'center' }
        );

        y = 32;

        // Volvemos a escribir el nombre del funcionario en la nueva página
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text(ug.userName, tableMarginX, y);
        y += 6;
      }

      const tableY = y;

      // --- 2.2. DIBUJO DEL CONTENEDOR DE LA TABLA (RECUADRO) ---
      doc.setDrawColor(210, 210, 210);
      doc.setLineWidth(0.6);
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(
        tableMarginX,
        tableY,
        tableWidth,
        tableHeight,
        4,
        4,
        'S'
      );

      const innerX = tableMarginX;
      const innerWidth = tableWidth;
      const innerTop = tableY;
      const innerBottom = tableY + tableHeight;

      // --- 2.3. DIBUJO DEL ENCABEZADO DE COLUMNAS ---
      doc.setFillColor(245, 245, 245);
      doc.rect(
        innerX + 1,
        innerTop + 1,
        innerWidth - 2,
        headerHeight,
        'F'
      );

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);

      const headerBaseline = innerTop + headerHeight - 2;
      doc.text('Fecha', innerX + 5, headerBaseline);
      doc.text('Actividad', innerX + dateColWidth + 5, headerBaseline);
      doc.text(
        'Estado',
        innerX + dateColWidth + activityColWidth + 5,
        headerBaseline
      );

      // Líneas divisorias verticales
      doc.setDrawColor(230, 230, 230);
      const v1 = innerX + dateColWidth;
      const v2 = innerX + dateColWidth + activityColWidth;
      doc.line(v1, innerTop, v1, innerBottom);
      doc.line(v2, innerTop, v2, innerBottom);
      doc.line(
        innerX,
        innerTop + headerHeight + 1,
        innerX + innerWidth,
        innerTop + headerHeight + 1
      ); // Separador bajo el header

      let currentY = innerTop + headerHeight + 1;

      // --- 2.4. DIBUJO DE LAS FILAS DE ACTIVIDADES ---
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.setDrawColor(235, 235, 235);

      ug.activities.forEach((a, idx) => {
        const rowHeight = rowHeights[idx];

        // Posición central vertical de la fila
        const centerBaselineY = currentY + rowHeight / 2 + 1.5;

        // 1. FECHA (centrada verticalmente)
        const fechaTxt = formatShort(a.fecha);
        doc.text(fechaTxt, innerX + 5, centerBaselineY);

        // 2. ACTIVIDAD (texto multilínea, pseudo-centrado vertical)
        const actividadTxt = `${a.titulo} — ${
          a.detalle || ''
        }`.trim();
        const wrapped = doc.splitTextToSize(
          actividadTxt,
          activityColWidth - 8
        );

        const textBlockHeight = wrapped.length * lineHeight;
        const activityStartPaddingY = (rowHeight - textBlockHeight) / 2;

        doc.text(
          wrapped,
          innerX + dateColWidth + 5,
          currentY + activityStartPaddingY + lineHeight
        );

        // 3. ESTADO (solo texto centrado en la columna)
        const estadoLabel = a.estado;
        const pillTextSize = 11;
        doc.setFontSize(pillTextSize);

        const estadoX = innerX + dateColWidth + activityColWidth;
        const textWidth = doc.getTextWidth(estadoLabel);
        const pillTextX = estadoX + (statusColWidth - textWidth) / 2;

        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'bold');
        doc.text(estadoLabel, pillTextX, centerBaselineY);

        // Volver a configuración por defecto
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);

        // 4. LÍNEA DIVISORIA HORIZONTAL (entre filas, excepto la última)
        if (idx < ug.activities.length - 1) {
          const rowBottom = currentY + rowHeight;
          doc.setDrawColor(235, 235, 235);
          doc.line(
            innerX + 1,
            rowBottom,
            innerX + innerWidth - 1,
            rowBottom
          );
        }

        currentY += rowHeight;
      });

      // --- 2.5. BLOQUE FIRMA FUNCIONARIO BAJO EL RECUADRO ---
      const signatureY =
        tableY + tableHeight + gapBetweenTableAndSignature;
      const lineY = signatureY + 2;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);

      doc.text('Firma funcionario:', tableMarginX, signatureY);
      doc.setDrawColor(0, 0, 0);
      doc.line(tableMarginX + 35, lineY, tableMarginX + 100, lineY);

      // Avanzar cursor vertical para el siguiente bloque
      y = tableY + totalBlockHeight;
    });

    // === 3. FIRMA DIRECTOR AL FINAL DEL DOCUMENTO ===
    const finalPageNumber = doc.getNumberOfPages();
    doc.setPage(finalPageNumber);

    const finalPageWidth = doc.internal.pageSize.getWidth();
    const finalPageHeight = doc.internal.pageSize.getHeight();

    const directorLineWidth = 80;
    const directorLineY = finalPageHeight - 25;
    const directorLineXStart =
      (finalPageWidth - directorLineWidth) / 2;

    // Línea de firma del Director
    doc.setDrawColor(0, 0, 0);
    doc.line(
      directorLineXStart,
      directorLineY,
      directorLineXStart + directorLineWidth,
      directorLineY
    );

    // Texto bajo la línea
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);

    doc.text(
      'Firma Director',
      finalPageWidth / 2,
      directorLineY + 6,
      { align: 'center' }
    );
    doc.text(
      'Departamento Mecánica',
      finalPageWidth / 2,
      directorLineY + 12,
      { align: 'center' }
    );

    // === 4. GUARDAR EL ARCHIVO ===
    const cleanKey = month.monthKey.replace('-', '');
    doc.save(`reporte_actividades_${cleanKey}.pdf`);
  }
}
