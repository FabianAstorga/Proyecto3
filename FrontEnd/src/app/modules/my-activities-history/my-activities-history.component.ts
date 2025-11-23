import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from '../../components/layout/layout.component';

import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { Activity } from '../../models/activity.model';

import jsPDF from 'jspdf';

type Estado = Activity['estado'];

interface MonthGroup {
  monthKey: string;   // '2025-10'
  monthLabel: string; // 'Octubre 2025'
  activities: Activity[];
}

@Component({
  selector: 'app-my-activities-history',
  standalone: true,
  imports: [CommonModule, LayoutComponent],
  templateUrl: './my-activities-history.component.html',
  styleUrls: ['./my-activities-history.component.scss'],
})
export class MyActivitiesHistoryComponent implements OnInit {
  private dataService = inject(DataService);
  private authService = inject(AuthService);

  // Info del funcionario
  funcionarioName = '';

  // Datos
  private allActivities: Activity[] = [];

  // Agrupación por mes
  groupedMonths: MonthGroup[] = [];
  currentMonthIndex = 0;

  // ===== Getters de navegación / vista =====

  get currentMonthGroup(): MonthGroup | null {
    if (!this.groupedMonths.length) return null;
    return this.groupedMonths[this.currentMonthIndex] ?? null;
  }

  get hasPrevMonth(): boolean {
    return this.currentMonthIndex < this.groupedMonths.length - 1;
  }

  get hasNextMonth(): boolean {
    return this.currentMonthIndex > 0;
  }

  // ===== Ciclo de vida =====

  ngOnInit(): void {
    const userId = this.authService.getUserId();
    if (!userId) {
      // si por algún motivo no hay id, no seguimos
      this.groupedMonths = [];
      return;
    }

    // Opcional: nombre desde el token o desde users.json
    // Aquí lo obtenemos desde users.json para ser consistentes
    this.dataService.getUserById(userId).subscribe({
      next: (user) => {
        if (user) {
          this.funcionarioName = `${user.firstName} ${user.lastName}`;
        }
      },
      error: (err) => console.error('Error cargando usuario:', err),
    });

    // Cargar actividades solo del funcionario
    this.dataService.getActivitiesByUser(userId).subscribe({
      next: (acts) => {
        this.allActivities = acts;
        this.rebuildView();
      },
      error: (err) =>
        console.error('Error cargando actividades del funcionario:', err),
    });
  }

  // ===== Navegación entre meses =====

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

  // ===== Construcción de la vista =====

  private rebuildView(): void {
    if (!this.allActivities.length) {
      this.groupedMonths = [];
      this.currentMonthIndex = 0;
      return;
    }

    // Agrupar por mes (YYYY-MM)
    const byMonth = new Map<string, Activity[]>();

    for (const a of this.allActivities) {
      const key = a.fecha.slice(0, 7); // 'YYYY-MM'
      const bucket = byMonth.get(key) ?? [];
      bucket.push(a);
      byMonth.set(key, bucket);
    }

    const months: MonthGroup[] = [];

    for (const [monthKey, acts] of byMonth.entries()) {
      // ordenar actividades del mes por fecha desc y luego por título
      acts.sort((a, b) => {
        if (a.fecha < b.fecha) return 1;
        if (a.fecha > b.fecha) return -1;
        return a.titulo.localeCompare(b.titulo);
      });

      months.push({
        monthKey,
        monthLabel: this.getMonthLabel(monthKey),
        activities: acts,
      });
    }

    // Ordenar meses: más reciente primero
    months.sort((a, b) =>
      a.monthKey < b.monthKey ? 1 : a.monthKey > b.monthKey ? -1 : 0
    );

    this.groupedMonths = months;
    this.currentMonthIndex = this.groupedMonths.length ? 0 : 0;
  }

  // ===== Utilidades =====

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

  // ===== PDF por mes (para el propio funcionario) =====

  downloadMonthPdf(month: MonthGroup): void {
    const doc = new jsPDF();
    let y = 20;
    const marginX = 14;

    // Cabecera
    doc.setFontSize(14);
    const title = `Mis actividades - ${month.monthLabel}`;
    doc.text(title, marginX, y);
    y += 8;

    if (this.funcionarioName) {
      doc.setFontSize(11);
      doc.text(`Funcionario: ${this.funcionarioName}`, marginX, y);
      y += 10;
    } else {
      y += 4;
    }

    // Listado
    doc.setFontSize(10);
    month.activities.forEach((a) => {
      if (y > 280) {
        doc.addPage();
        y = 20;
      }

      const line = `- ${this.formatDMY(a.fecha)} · ${a.titulo} · ${a.horas} h (${a.estado})`;
      doc.text(line, marginX, y);
      y += 5;
    });

    const cleanKey = month.monthKey.replace('-', '');
    doc.save(`mis_actividades_${cleanKey}.pdf`);
  }
}
