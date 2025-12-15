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

type FuncionarioPdfInfo = {
  nombre: string;
  correo: string;
  telefono: string;
  cargo: string;
  descripcionCargoLines: string[]; // ya con "• "
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
export class ActivitiesHistoryComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dataService = inject(DataService);
  private authService = inject(AuthService);

  // Nombre de la secretaria logueada (para encabezado PDF)
  secretaryName = '';

  // Datos crudos
  private allUsers: User[] = [];
  private allActivities: Activity[] = [];

  // Vista agrupada por mes
  groupedMonths: MonthGroup[] = [];
  totalActivities = 0;

  // Índice del mes actualmente visible (0 = más reciente)
  currentMonthIndex = 0;

  // ===== Logos (dataURL) =====
  private logoDimDataUrl: string | null = null;
  private logoUtaDataUrl: string | null = null;

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
    // Pre-cargar logos (para PDF)
    this.preloadLogos();

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
          error: (err) => console.error('Error cargando actividades:', err),
        });
      },
      error: (err) => console.error('Error cargando usuarios:', err),
    });

    // Reconstruir vista cuando cambian los filtros
    this.filters.valueChanges.subscribe(() => this.rebuildView());
  }

  // ================== NAVEGACIÓN ENTRE MESES ==================

  goPrevMonth(): void {
    if (this.hasPrevMonth) this.currentMonthIndex++;
  }

  goNextMonth(): void {
    if (this.hasNextMonth) this.currentMonthIndex--;
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
      if (a.userId == null) return false;
      if (!funcionarioIds.has(a.userId)) return false;

      if (mesNumber !== null) {
        const activityMonth = Number(a.fecha.slice(5, 7)); // 'YYYY-MM-DD'
        if (activityMonth !== mesNumber) return false;
      }

      if (estado !== '' && a.estado !== estado) return false;

      if (term) {
        const user = this.allUsers.find((u) => u.id === a.userId);
        const userName = user
          ? `${user.firstName} ${user.lastName}`.toLowerCase()
          : '';

        const inText =
          a.titulo.toLowerCase().includes(term) ||
          (a.detalle ?? '').toLowerCase().includes(term) ||
          (a.estado ?? '').toLowerCase().includes(term) ||
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

          list.sort((a, b) => (a.fecha < b.fecha ? 1 : a.fecha > b.fecha ? -1 : 0));
          return { userId, userName, activities: list };
        })
        .sort((a, b) => a.userName.localeCompare(b.userName));

      months.push({
        monthKey,
        monthLabel: this.getMonthLabel(monthKey),
        users: userGroups,
      });
    }

    months.sort((a, b) => (a.monthKey < b.monthKey ? 1 : a.monthKey > b.monthKey ? -1 : 0));
    this.groupedMonths = months;
    this.currentMonthIndex = 0;
  }

  // ================== UTILIDADES ==================

  formatDMY(iso: string): string {
    const [y, m, d] = iso.split('-').map(Number);
    return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;
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
    return month.users.reduce((sum, u) => sum + u.activities.length, 0);
  }

  private getMonthLabel(key: string): string {
    const [yearStr, monthStr] = key.split('-');
    const year = Number(yearStr);
    const month = Number(monthStr);
    const meses = [
      'enero','febrero','marzo','abril','mayo','junio',
      'julio','agosto','septiembre','octubre','noviembre','diciembre',
    ];
    const nombre = meses[month - 1] ?? '';
    return `${nombre.charAt(0).toUpperCase()}${nombre.slice(1)} ${year}`;
  }

  private monthKeyToUpperLabel(month: MonthGroup): string {
    const [y, m] = month.monthKey.split('-').map(Number);
    const mesesUpper = [
      'ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO',
      'JULIO','AGOSTO','SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE',
    ];
    return `MES DE ${mesesUpper[(m ?? 1) - 1] ?? '—'} ${y}`;
  }

  clearFilters() {
    this.filters.reset({ q: '', mes: '', estado: '' });
    this.rebuildView();
  }

  // ================== Helpers texto / cargo ==================

  private stripLeadingNumbering(s: string): string {
    return s.replace(/^\s*(\d+[\.\)]\s+|-\s+|•\s+)/, '').trim();
  }

  private buildCargoLinesFromCargoObject(cargoObj: any): string[] {
    const funciones: unknown =
      cargoObj?.funciones ??
      cargoObj?.functions ??
      cargoObj?.descripcionCargo ??
      null;

    if (Array.isArray(funciones) && funciones.length) {
      const out = funciones
        .map((x) => String(x).trim())
        .filter(Boolean)
        .map((s) => `• ${this.stripLeadingNumbering(s)}`);
      return out.length ? out : ['• —'];
    }

    const texto =
      cargoObj?.descripcion ??
      cargoObj?.detail ??
      cargoObj?.detalle ??
      cargoObj?.glosa ??
      '';

    if (texto && String(texto).trim()) {
      const raw = String(texto).trim();
      const parts = raw
        .split(/\r?\n|;|•/g)
        .map((s) => s.trim())
        .filter(Boolean);

      const out =
        parts.length > 0
          ? parts.map((p) => `• ${this.stripLeadingNumbering(p)}`)
          : ['• —'];

      return out.length ? out : ['• —'];
    }

    return ['• —'];
  }

  private getUserFromCache(userId: number): User | undefined {
    return this.allUsers.find((u) => u.id === userId);
  }

  // ================== Carga logos (como tu primer código) ==================

  private async preloadLogos(): Promise<void> {
    const dimPath = '/logodim.png';
    const utaPath = '/logouta.png';

    try {
      this.logoDimDataUrl = await this.loadImageAsDataURL(dimPath);
    } catch (e) {
      console.warn('No se pudo cargar logodim:', e);
      this.logoDimDataUrl = null;
    }

    try {
      this.logoUtaDataUrl = await this.loadImageAsDataURL(utaPath);
    } catch (e) {
      console.warn('No se pudo cargar logouta:', e);
      this.logoUtaDataUrl = null;
    }
  }

  private loadImageAsDataURL(url: string): Promise<string> {
    return fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status} cargando ${url}`);
        return res.blob();
      })
      .then(
        (blob) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onerror = () => reject(new Error('FileReader error'));
            reader.onload = () => resolve(String(reader.result));
            reader.readAsDataURL(blob);
          })
      );
  }

  // ================== PDF POR MES (RECUADRO POR FUNCIONARIO) ==================

  async downloadMonthPdf(month: MonthGroup): Promise<void> {
    const doc = new jsPDF();

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginX = 14;

    // Footer (igual idea que tu primer código)
    const footerLine1 = 'Dirección Av. 18 de Septiembre N° 2222, Arica - Chile';
    const footerLine2 = 'dim@gestion.uta.cl - +56 58-2205282';
    const footerLine3 = 'www.uta.cl';

    const drawFooter = (pageNum: number, total: number) => {
      const y = pageHeight - 18;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(90, 90, 90);

      doc.text(footerLine1, marginX, y);
      doc.text(footerLine2, marginX, y + 4);
      doc.text(footerLine3, marginX, y + 8);

      doc.setTextColor(120, 120, 120);
      doc.text(`${pageNum}/${total}`, pageWidth - marginX, y + 8, { align: 'right' });
    };

    const applyFooters = () => {
      const total = doc.getNumberOfPages();
      for (let p = 1; p <= total; p++) {
        doc.setPage(p);
        drawFooter(p, total);
      }
    };

    // Encabezado por página (logos + títulos FUERA de los recuadros)
    const drawPageHeader = () => {
      // Logos pequeños
      const logoW = 26;
      const logoH = 12;
      const topY = 12;
      const leftX = marginX;
      const rightX = pageWidth - marginX - logoW;

      if (this.logoDimDataUrl) {
        doc.addImage(this.logoDimDataUrl, 'PNG', leftX, topY, logoW, logoH);
      } else {
        doc.setDrawColor(200, 200, 200);
        doc.rect(leftX, topY, logoW, logoH);
      }

      if (this.logoUtaDataUrl) {
        doc.addImage(this.logoUtaDataUrl, 'PNG', rightX, topY, logoW, logoH);
      } else {
        doc.setDrawColor(200, 200, 200);
        doc.rect(rightX, topY, logoW, logoH);
      }

      let y = 40;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text('DEPARTAMENTO DE INGENIERÍA MECÁNICA', pageWidth / 2, y, { align: 'center' });
      y += 8;

      doc.setFontSize(14);
      doc.text('INFORME DE ACTIVIDADES RELEVANTES', pageWidth / 2, y, { align: 'center' });
      y += 8;

      doc.setFontSize(12);
      doc.text(this.monthKeyToUpperLabel(month), pageWidth / 2, y, { align: 'center' });
y += 10; // más aire

const secName = this.secretaryName || 'Secretaría (sin identificar)';
doc.setFont('helvetica', 'normal');
doc.setFontSize(10);
doc.setTextColor(90, 90, 90);
doc.text(`Informe creado por ${secName}`, pageWidth / 2, y, { align: 'center' });

return 74; // y inicial sugerida para comenzar recuadros en la página
    };

    const bottomSafe = 55; // aire para footer + (posible firma director al final)

    // ===== 1) Obtener info (cargo/descripcion) por funcionario en paralelo =====
    const uniqueUserIds = Array.from(new Set((month.users ?? []).map((u) => u.userId)));

    const infoMap = new Map<number, FuncionarioPdfInfo>();

    await Promise.all(
      uniqueUserIds.map(async (userId) => {
        const u = this.getUserFromCache(userId);

        const nombre = u ? `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() : `Usuario ${userId}`;
        const correo = (u as any)?.email ?? '';
        const telefono = (u as any)?.phone ?? '';

        let cargo = '—';
        let descripcionCargoLines: string[] = ['• —'];

        // Intentar traer cargo real desde endpoint cargos (como tu primer código)
        try {
          const cargos = await new Promise<any[]>((resolve, reject) => {
            this.dataService.getCargosByUsuario(userId).subscribe({
              next: (x) => resolve(x ?? []),
              error: (e) => reject(e),
            });
          });

          const c = cargos?.[0];
          if (c) {
            const nombreCargo =
              (c as any).nombre ??
              (c as any).name ??
              (c as any).titulo ??
              (c as any).title ??
              '';
            if (nombreCargo) cargo = String(nombreCargo);

            descripcionCargoLines = this.buildCargoLinesFromCargoObject(c);
          }
        } catch {
          // fallback: si no se pudo, usar role / mantener '—'
          const roleFallback = (u as any)?.role ? String((u as any).role).trim() : '';
          if (roleFallback) cargo = roleFallback;
          descripcionCargoLines = ['• —'];
        }

        // fallback extra: si cargo quedó vacío
        if (!cargo || cargo === '—') {
          const roleFallback = (u as any)?.role ? String((u as any).role).trim() : '';
          if (roleFallback) cargo = roleFallback;
        }

        infoMap.set(userId, {
          nombre: nombre || '—',
          correo,
          telefono,
          cargo: cargo || '—',
          descripcionCargoLines: (descripcionCargoLines?.length ? descripcionCargoLines : ['• —']),
        });
      })
    );

    // ===== 2) Comenzar documento =====
    let y = drawPageHeader();

    // Helpers
    const dmy = (iso: string) => this.formatDMY(iso);

    const ensureSpace = (needed: number) => {
      if (y + needed > pageHeight - bottomSafe) {
        doc.addPage();
        y = drawPageHeader();
      }
    };

    // ===== 3) Dibujar recuadro por funcionario =====
    for (const ug of (month.users ?? [])) {
      const info = infoMap.get(ug.userId) ?? {
        nombre: ug.userName,
        correo: '',
        telefono: '',
        cargo: '—',
        descripcionCargoLines: ['• —'],
      };

      const activities = ug.activities ?? [];

      // --- medidas base ---
      const frameX = marginX - 4;
      const frameW = pageWidth - (marginX - 4) * 2;

      const boxX = marginX;
      const boxW = pageWidth - marginX * 2;
      const boxH = 32;

      const tableX = marginX;
      const tableW = pageWidth - marginX * 2;

      const colFecha = 28;
      const colEstado = 32;
      const colActividad = tableW - colFecha - colEstado;

      const headerH = 8;
      const lineH = 5.5;

      // --- calcular altura de descripción ---
      const descLines = (info.descripcionCargoLines ?? [])
        .map((s) => String(s).trim())
        .filter(Boolean);

      // Estimar altura de descripción con splitTextToSize (preciso)
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);

      let descHeight = 0;
      if (descLines.length) {
        for (const line of descLines) {
          const wrapped = doc.splitTextToSize(line, pageWidth - marginX * 2);
          descHeight += wrapped.length * 5;
        }
      } else {
        descHeight = 6;
      }

      // --- calcular altura tabla ---
      let tableBodyHeight = 0;
      if (!activities.length) {
        tableBodyHeight = 16;
      } else {
        for (const a of activities) {
          const actividadTxt = `${a.titulo}${a.detalle ? ' - ' + a.detalle : ''}`.trim();
          const wrappedAct = doc.splitTextToSize(actividadTxt, colActividad - 6);
          const rowH = Math.max(10, wrappedAct.length * lineH + 4);
          tableBodyHeight += rowH;
        }
      }
      const tableHeight = headerH + tableBodyHeight;

      // --- firma funcionario (fuera del recuadro) ---
      const sigGapTop = 10;
      const sigBlockH = 18;

      // --- altura total del bloque funcionario ---
      const titleH = 10;      // "Funcionario:"
      const gap1 = 6;
      const gap2 = 8;
      const gap3 = 8;

      const frameInnerHeight =
        titleH +
        gap1 +
        boxH +
        gap2 +
        6 + // label "Descripción de cargo"
        descHeight +
        gap3 +
        6 + // label "Actividades del mes"
        tableHeight +
        6;  // aire final dentro

      const totalNeeded = frameInnerHeight + sigGapTop + sigBlockH + 8;

      // Control de salto antes de comenzar el bloque
      ensureSpace(totalNeeded);

      const frameStartY = y;

      // ===== Dentro del recuadro =====
      let yy = y + 5;

      // Título interno (nombre funcionario)
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
  
      yy += 10;

      // Caja identificación (Nombre/Correo/Teléfono/Cargo)
      doc.setDrawColor(180, 180, 180);
      doc.roundedRect(boxX, yy, boxW, boxH, 2, 2, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('NOMBRE', boxX + 4, yy + 7);
      doc.text('CORREO', boxX + 4, yy + 15);
      doc.text('TELÉFONO', boxX + 4, yy + 23);
      doc.text('CARGO', boxX + 4, yy + 31);

      doc.setFont('helvetica', 'normal');
      doc.text(info.nombre || '—', boxX + 32, yy + 7);
      doc.text(info.correo || '—', boxX + 32, yy + 15);
      doc.text(info.telefono || '—', boxX + 32, yy + 23);
      doc.text(info.cargo || '—', boxX + 32, yy + 31);

      yy += boxH + 10;

      // Descripción del cargo
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('Descripción de cargo:', marginX, yy);
      yy += 6;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);

      if (descLines.length) {
        for (const line of descLines) {
          const wrapped = doc.splitTextToSize(line, pageWidth - marginX * 2);
          doc.text(wrapped, marginX, yy);
          yy += wrapped.length * 5;
        }
      } else {
        doc.text('• —', marginX, yy);
        yy += 6;
      }

      yy += 6;

      // Actividades
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('Actividades del mes', marginX, yy);
      yy += 6;

      // Header tabla
      doc.setFillColor(245, 245, 245);
      doc.setDrawColor(200, 200, 200);
      doc.rect(tableX, yy, tableW, headerH, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);

      doc.text('Fecha', tableX + 3, yy + 5.5);
      doc.text('Actividad', tableX + colFecha + 3, yy + 5.5);
      doc.text('Estado', tableX + colFecha + colActividad + 3, yy + 5.5);

      doc.setDrawColor(220, 220, 220);
      doc.line(tableX + colFecha, yy, tableX + colFecha, yy + headerH);
      doc.line(
        tableX + colFecha + colActividad,
        yy,
        tableX + colFecha + colActividad,
        yy + headerH
      );

      yy += headerH;

      // Body tabla
      if (!activities.length) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80);
        doc.text('No hay actividades registradas para este funcionario en este mes.', tableX + 3, yy + 8);
        yy += 16;
      } else {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);

        for (const a of activities) {
          const fechaTxt = dmy(a.fecha);
          const actividadTxt = `${a.titulo}${a.detalle ? ' - ' + a.detalle : ''}`.trim();
          const estadoTxt = a.estado ?? '—';

          const wrappedAct = doc.splitTextToSize(actividadTxt, colActividad - 6);
          const rowH = Math.max(10, wrappedAct.length * lineH + 4);

          doc.setDrawColor(230, 230, 230);
          doc.rect(tableX, yy, tableW, rowH, 'S');

          doc.line(tableX + colFecha, yy, tableX + colFecha, yy + rowH);
          doc.line(
            tableX + colFecha + colActividad,
            yy,
            tableX + colFecha + colActividad,
            yy + rowH
          );

          doc.text(fechaTxt, tableX + 3, yy + 7);
          doc.text(wrappedAct, tableX + colFecha + 3, yy + 7);

          doc.setFont('helvetica', 'bold');
          doc.text(estadoTxt, tableX + colFecha + colActividad + 3, yy + 7);
          doc.setFont('helvetica', 'normal');

          yy += rowH;
        }
      }

      // Cerrar recuadro principal (frame)
      const frameEndY = yy + 4;
      const frameH = frameEndY - frameStartY;

      doc.setDrawColor(160, 160, 160);
      doc.setLineWidth(0.6);
      doc.roundedRect(frameX, frameStartY, frameW, frameH, 3, 3, 'S');

      // ===== Firma del funcionario (FUERA del recuadro) =====
      y = frameEndY + 10;

      const lineW = 80;
      doc.setDrawColor(0, 0, 0);
      doc.line(marginX, y + 10, marginX + lineW, y + 10);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(info.nombre || 'Funcionario', marginX, y + 16);

      doc.setTextColor(90, 90, 90);
      doc.text('Funcionario', marginX, y + 21);

      y += 30; // espacio para el siguiente bloque
    }

    // ===== 4) Firma Director (SOLO al final de todo) =====
    const directorBlockH = 30;
    if (y + directorBlockH > pageHeight - bottomSafe) {
      doc.addPage();
      y = drawPageHeader();
    }

    y += 6;

    const directorLineW = 90;
    const directorX = pageWidth - marginX - directorLineW;

    doc.setDrawColor(0, 0, 0);
    doc.line(directorX, y + 10, directorX + directorLineW, y + 10);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('Director', directorX + directorLineW, y + 16, { align: 'right' });

    doc.setTextColor(90, 90, 90);
    doc.text('Departamento de Ingeniería Mecánica', directorX + directorLineW, y + 21, {
      align: 'right',
    });

    // Footer + numeración
    applyFooters();

    // Guardar
    const cleanKey = month.monthKey.replace('-', '');
    doc.save(`informe_actividades_secretaria_${cleanKey}.pdf`);
  }
}
