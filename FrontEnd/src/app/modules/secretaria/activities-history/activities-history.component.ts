import { Component, OnInit, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { LayoutComponent } from '../../../components/layout/layout.component';
import { SECRETARIA_NAV_ITEMS } from '../profile-home/secretaria.nav';

type Estado = 'Aprobada' | 'Pendiente' | 'Rechazada';

type Activity = {
  fecha: string;   // 'YYYY-MM-DD'
  titulo: string;
  detalle: string;
  estado: Estado;
  userId: number;
};

type User = {
  id: number;
  firstName: string;
  lastName: string;
  role: string;
};

type Combined = Activity & {
  firstName: string;
  lastName: string;
  fullName: string;
  role: string;
};

type MonthKey = string; // 'YYYY-MM'
type GroupedMonth = {
  monthKey: MonthKey;             // 'YYYY-MM'
  label: string;                  // 'mayo de 2025'
  users: Array<{
    userId: number;
    fullName: string;
    activities: Combined[];       // actividades de ese usuario en ese mes
  }>;
};

@Component({
  standalone: true,
  selector: 'app-activities-history',
  imports: [CommonModule, HttpClientModule, FormsModule, LayoutComponent],
  templateUrl: './activities-history.component.html',
})
export class ActivitiesHistoryComponent implements OnInit {
  private http = inject(HttpClient);

  // NAV
  secretariaNavItems = SECRETARIA_NAV_ITEMS;

  // Estado carga
  loading = true;
  error?: string;

  // Datos
  users: User[] = [];
  combined: Combined[] = [];

  // Filtros
  selectedUserId: number | null = null;
  selectedEstado: Estado | null = null;
  selectedDate: string | null = null; // 'YYYY-MM-DD' (exacta)

  // UI dropdowns
  showUserMenu = false;
  showEstadoMenu = false;

  // Autor del informe (temporal inventado)
  readonly SECRETARIA_NOMBRE = 'María Fernanda Rojas';

  async ngOnInit(): Promise<void> {
    try {
      const [users, acts] = await Promise.all([
        this.http.get<User[]>('/assets/data/users.json').toPromise(),
        this.http.get<Activity[]>('/assets/data/activities.json').toPromise(),
      ]);
      if (!users || !acts) throw new Error('Datos incompletos');

      // Usuarios ordenados
      this.users = users.slice().sort((a, b) =>
        `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`, 'es')
      );

      const byId = new Map(users.map(u => [u.id, u]));

      // Lista combinada, orden fecha desc
      this.combined = acts
        .map(a => {
          const u = byId.get(a.userId);
          const firstName = u?.firstName ?? '—';
          const lastName = u?.lastName ?? '';
          const role = u?.role ?? '—';
          return {
            ...a,
            firstName,
            lastName,
            fullName: `${firstName} ${lastName}`.trim(),
            role,
          } as Combined;
        })
        .sort((a, b) => (a.fecha < b.fecha ? 1 : a.fecha > b.fecha ? -1 : 0));
    } catch (err) {
      console.error(err);
      this.error = 'Error cargando historial';
    } finally {
      this.loading = false;
    }
  }

  // ===== Helpers de UI =====
  statusPillClass(est: Estado): string {
    switch (est) {
      case 'Aprobada':
        return 'bg-emerald-500/10 text-emerald-700 border border-emerald-300';
      case 'Pendiente':
        return 'bg-amber-500/10 text-amber-700 border border-amber-300';
      case 'Rechazada':
        return 'bg-red-500/10 text-red-700 border border-red-300';
    }
  }

  get estados(): Estado[] {
    return ['Aprobada', 'Pendiente', 'Rechazada'];
  }

  get selectedUserLabel(): string {
    if (this.selectedUserId === null) return 'Todos';
    const u = this.users.find(x => x.id === this.selectedUserId);
    return u ? `${u.firstName} ${u.lastName}` : 'Desconocido';
  }

  get selectedEstadoLabel(): string {
    return this.selectedEstado ?? 'Todos';
  }

  clearFilters(): void {
    this.selectedUserId = null;
    this.selectedEstado = null;
       this.selectedDate = null;
  }

  // ===== Filtrado previo =====
  get filteredCombined(): Combined[] {
    return this.combined.filter(a => {
      const byUser = this.selectedUserId === null || a.userId === this.selectedUserId;
      const byEstado = this.selectedEstado === null || a.estado === this.selectedEstado;
      const byDate = !this.selectedDate || a.fecha === this.selectedDate;
      return byUser && byEstado && byDate;
    });
  }

  // ===== Agrupado por MES → USUARIO =====
  get groupedByMonth(): GroupedMonth[] {
    const mapMonths = new Map<MonthKey, GroupedMonth>();

    for (const it of this.filteredCombined) {
      const monthKey: MonthKey = it.fecha.slice(0, 7); // 'YYYY-MM'
      if (!mapMonths.has(monthKey)) {
        mapMonths.set(monthKey, {
          monthKey,
          label: this.formatMonthLabel(monthKey),
          users: [],
        });
      }
      const month = mapMonths.get(monthKey)!;

      let bucket = month.users.find(u => u.userId === it.userId);
      if (!bucket) {
        bucket = { userId: it.userId, fullName: it.fullName, activities: [] };
        month.users.push(bucket);
      }
      bucket.activities.push(it);
    }

    // Orden: meses desc, usuarios A-Z, actividades por fecha desc
    const out = Array.from(mapMonths.values()).sort((a, b) => (a.monthKey < b.monthKey ? 1 : -1));
    for (const m of out) {
      m.users.sort((a, b) => a.fullName.localeCompare(b.fullName, 'es'));
      for (const u of m.users) {
        u.activities.sort((a, b) => (a.fecha < b.fecha ? 1 : a.fecha > b.fecha ? -1 : 0));
      }
    }
    return out;
  }

  private formatMonthLabel(monthKey: MonthKey): string {
    // monthKey 'YYYY-MM'
    const [y, m] = monthKey.split('-').map(Number);
    const dt = new Date(y, (m ?? 1) - 1, 1);
    // ej: "mayo de 2025"
    return new Intl.DateTimeFormat('es-CL', { month: 'long', year: 'numeric' }).format(dt);
  }

  formatDay(d: string): string {
    // 'YYYY-MM-DD' -> 'DD MMM'
    const [y, m, day] = d.split('-').map(Number);
    const dt = new Date(y, (m ?? 1) - 1, day ?? 1);
    return new Intl.DateTimeFormat('es-CL', { day: '2-digit', month: 'short' }).format(dt);
  }

  // ===== PDF del MES (B/N profesional, grid con bordes redondeados; solo estado en color) =====
  async exportMonthToPDF(monthKey: string) {
  const month = this.groupedByMonth.find(m => m.monthKey === monthKey);
  if (!month) return;

  const [{ jsPDF }] = await Promise.all([import('jspdf')]);

  const pdf = new jsPDF('p', 'pt', 'a4');
  const margin = 36; // 0.5in
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Paleta B/N y colores de texto para estado
  const BLACK = [20, 20, 20];
  const GRAY_DARK = [80, 80, 80];
  const GRAY = [160, 160, 160];
  const GRAY_LIGHT = [235, 235, 235]; // líneas suaves
  const GREEN = [22, 101, 52];
  const AMBER = [120, 53, 15];
  const RED = [127, 29, 29];

  // Títulos (B/N)
  pdf.setTextColor(BLACK[0], BLACK[1], BLACK[2]);
  pdf.setFont('helvetica', 'bold'); pdf.setFontSize(18);
  pdf.text('Resumen de actividades', pageWidth / 2, y, { align: 'center' });
  y += 22;
  pdf.setFont('helvetica', 'normal'); pdf.setFontSize(12);
  const subt = `${month.label} — Informe creado por ${this.SECRETARIA_NOMBRE}`;
  pdf.setTextColor(GRAY_DARK[0], GRAY_DARK[1], GRAY_DARK[2]);
  pdf.text(subt, pageWidth / 2, y, { align: 'center' });
  y += 16;
  pdf.setDrawColor(GRAY[0], GRAY[1], GRAY[2]);
  pdf.line(margin, y, pageWidth - margin, y);
  y += 14;

  // Config de grid
  const cellPadX = 12;
  const cellPadY = 8;
  const lineH = 14;
  const fechaW = 70;
  const estadoW = 120; // columna reservada para estado (texto coloreado)
  const actividadW = contentWidth - fechaW - estadoW - (cellPadX * 2) - 2; // 2 separadores
  const colX = {
    fecha: margin + cellPadX,
    sep1:  margin + cellPadX + fechaW,
    act:   margin + cellPadX + fechaW + 2, // +2 = línea separadora
    sep2:  margin + cellPadX + fechaW + 2 + actividadW,
    estado: margin + cellPadX + fechaW + 2 + actividadW + 2, // +2 = línea separadora
  };

  const estadoColor = (txt: string) => {
    if (txt === 'Aprobada') return GREEN;
    if (txt === 'Pendiente') return AMBER;
    if (txt === 'Rechazada') return RED;
    return BLACK;
  };

  const drawUserCard = (
    fullName: string,
    acts: { fecha: string; titulo: string; detalle?: string; estado: string }[],
  ) => {
    // 1) Calcular alto total de la tarjeta
    const headerH = 30;
    let totalRowsH = 0;

    const rowsHeights: number[] = [];
    pdf.setFont('helvetica', 'normal'); pdf.setFontSize(11);
    for (const a of acts) {
      const texto = `${a.titulo}${a.detalle ? ' — ' + a.detalle : ''}`;
      const lines = pdf.splitTextToSize(texto, actividadW) as string[];
      const textH = lines.length * lineH;
      const rowH = Math.max(textH, lineH) + cellPadY * 2; // acolchado vertical
      rowsHeights.push(rowH);
      totalRowsH += rowH;
    }

    const tableH = headerH + 1 + totalRowsH + 1;
    // Salto de página si no cabe
    if (y + tableH > pageHeight - margin) {
      pdf.addPage(); y = margin;
    }

    // 2) Marco exterior redondeado (B/N)
    const radius = 12;
    pdf.setDrawColor(GRAY[0], GRAY[1], GRAY[2]);
    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(margin, y, contentWidth, tableH, radius, radius, 'FD');

    // 3) Encabezado (nombre del funcionario) en banda gris claro
    pdf.setFillColor(245, 245, 245);
    pdf.roundedRect(margin, y, contentWidth, headerH, radius, radius, 'F');
    // “Recorte” inferior del header
    pdf.setFillColor(255, 255, 255);
    pdf.rect(margin, y + headerH - radius, contentWidth, radius, 'F');

    pdf.setTextColor(BLACK[0], BLACK[1], BLACK[2]);
    pdf.setFont('helvetica', 'bold'); pdf.setFontSize(12);
    pdf.text(fullName, margin + cellPadX, y + 20);

    // 4) Encabezados columnas
    let yCursor = y + headerH;
    pdf.setDrawColor(GRAY_LIGHT[0], GRAY_LIGHT[1], GRAY_LIGHT[2]);
    pdf.line(margin, yCursor, margin + contentWidth, yCursor);
    yCursor += 14;

    pdf.setFont('helvetica', 'bold'); pdf.setFontSize(11);
    pdf.setTextColor(BLACK[0], BLACK[1], BLACK[2]);
    pdf.text('Fecha', colX.fecha, yCursor);
    pdf.text('Actividad', colX.act, yCursor);
    pdf.text('Estado', margin + contentWidth - cellPadX, yCursor, { align: 'right' });

    yCursor += 6;
    pdf.setDrawColor(GRAY_LIGHT[0], GRAY_LIGHT[1], GRAY_LIGHT[2]);
    pdf.line(margin, yCursor, margin + contentWidth, yCursor);
    // Separadores verticales
    pdf.line(colX.sep1, y + headerH, colX.sep1, y + tableH);
    pdf.line(colX.sep2, y + headerH, colX.sep2, y + tableH);

    // 5) Filas
    pdf.setFont('helvetica', 'normal'); pdf.setFontSize(11);
    pdf.setTextColor(BLACK[0], BLACK[1], BLACK[2]);
    let rowTop = yCursor + 10;

    acts.forEach((a, i) => {
      // Fecha
      const [yy, mm, dd] = a.fecha.split('-');
      const dt = new Date(Number(yy), Number(mm) - 1, Number(dd));
      const fechaTxt = new Intl.DateTimeFormat('es-CL', { day: '2-digit', month: 'short' }).format(dt);
      pdf.text(fechaTxt, colX.fecha, rowTop);

      // Actividad (multilínea dentro de su celda)
      const texto = `${a.titulo}${a.detalle ? ' — ' + a.detalle : ''}`;
      const lines = pdf.splitTextToSize(texto, actividadW) as string[];
      let textY = rowTop;
      lines.forEach((line: string) => {
        pdf.text(line, colX.act, textY);
        textY += lineH;
      });

      // Estado (solo texto en color; pastilla B/N)
      const color = estadoColor(a.estado);
      const pillTxtW = pdf.getTextWidth(a.estado);
      const padX = 10, padY = 6;
      const pillW = Math.min(estadoW - 10, pillTxtW + padX * 2);
      const pillH = 20;
      const pillX = margin + contentWidth - cellPadX - pillW;
      const pillY = rowTop - (pillH - 11) / 2;

      pdf.setDrawColor(GRAY_LIGHT[0], GRAY_LIGHT[1], GRAY_LIGHT[2]);
      pdf.setFillColor(255, 255, 255);
      pdf.roundedRect(pillX, pillY, pillW, pillH, 10, 10, 'FD');
      pdf.setTextColor(color[0], color[1], color[2]);
      pdf.text(a.estado, pillX + padX, pillY + pillH - padY);
      pdf.setTextColor(BLACK[0], BLACK[1], BLACK[2]);

      // Siguiente fila
      const rowH = rowsHeights[i];
      rowTop = rowTop - 11 + rowH;

      // Línea divisoria de fila
      pdf.setDrawColor(GRAY_LIGHT[0], GRAY_LIGHT[1], GRAY_LIGHT[2]);
      pdf.line(margin, rowTop, margin + contentWidth, rowTop);
      rowTop += 10;
    });

    y += tableH + 14; // espacio entre tarjetas
  };

  // Render por usuario con paginación
  for (const u of month.users) {
    const acts = u.activities.map(a => ({ fecha: a.fecha, titulo: a.titulo, detalle: a.detalle, estado: a.estado }));
    drawUserCard(u.fullName, acts);
  }

  const safeLabel = month.label.replace(/\s+/g, '_').replace(/[^\w_áéíóúÁÉÍÓÚñÑ-]/g, '');
  pdf.save(`Resumen_actividades_${safeLabel}.pdf`);
}

  // ===== Dropdowns =====
  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
    if (this.showUserMenu) this.showEstadoMenu = false;
  }
  toggleEstadoMenu(): void {
    this.showEstadoMenu = !this.showEstadoMenu;
    if (this.showEstadoMenu) this.showUserMenu = false;
  }
  selectUser(id: number | null): void {
    this.selectedUserId = id;
    this.showUserMenu = false;
  }
  selectEstado(e: Estado | null): void {
    this.selectedEstado = e;
    this.showEstadoMenu = false;
  }

  // Cerrar menús al hacer click fuera
  @HostListener('document:click', ['$event'])
  onDocClick(ev: MouseEvent) {
    const target = ev.target as HTMLElement;
    const inMenuOrButton = target.closest('[data-menu]') || target.closest('[data-menu-btn]');
    if (!inMenuOrButton) {
      this.showUserMenu = false;
      this.showEstadoMenu = false;
    }
  }
}
