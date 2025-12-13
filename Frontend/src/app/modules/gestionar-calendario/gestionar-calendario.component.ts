// src/app/modules/gestionar-calendario/gestionar-calendario.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LayoutComponent } from '../../components/layout/layout.component';

import { DayKey } from '../../models/horario.models';
import { GlobalEvent, GlobalEventPayload } from '../../models/global-event.model';
import { DataService } from '../../services/data.service';

interface Block {
  label: string;
  code: string;
  isLunch?: boolean;
}

// Celda del grid de eventos globales
type GlobalCell = { title: string; note?: string } | null;

/* ==== Helpers para semana ISO ==== */

function pad(n: number) {
  return n.toString().padStart(2, '0');
}

function weekKey(d: Date) {
  const tmp = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  tmp.setUTCDate(tmp.getUTCDate() + 4 - (tmp.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((+tmp - +yearStart) / 86400000 + 1) / 7);
  return `${tmp.getUTCFullYear()}-W${pad(week)}`;
}

function mondayOfISOWeek(iso: string) {
  const year = Number(iso.slice(0, 4));
  const week = Number(iso.slice(6));
  const simple = new Date(Date.UTC(year, 0, 4));
  const dayOfWeek = simple.getUTCDay() || 7;
  const monday = new Date(simple);
  monday.setUTCDate(simple.getUTCDate() - dayOfWeek + 1 + (week - 1) * 7);
  return monday;
}

@Component({
  standalone: true,
  selector: 'app-gestionar-calendario',
  imports: [CommonModule, FormsModule, LayoutComponent],
  templateUrl: './gestionar-calendario.component.html',
})
export class GestionarCalendarioComponent implements OnInit {
  // Semana actual (ISO week)
  current = weekKey(new Date());

  // Bloques (misma visual que Schedule)
  blocks: Block[] = [
    { label: '08:00 - 09:30', code: '(1 - 2)' },
    { label: '09:40 - 11:10', code: '(3 - 4)' },
    { label: '11:20 - 12:50', code: '(5 - 6)' },
    { label: '13:00 - 14:30', code: '(7 - 8)', isLunch: true },
    { label: '14:45 - 16:15', code: '(9 - 10)' },
    { label: '16:20 - 17:50', code: '(11 - 12)' },
    { label: '17:55 - 19:25', code: '(13 - 14)' },
    { label: '19:30 - 21:00', code: '(15 - 16)' },
  ];

  days: { key: DayKey; label: string }[] = [
    { key: 'lun', label: 'Lunes' },
    { key: 'mar', label: 'Martes' },
    { key: 'mie', label: 'Miércoles' },
    { key: 'jue', label: 'Jueves' },
    { key: 'vie', label: 'Viernes' },
  ];

  // Grid de eventos globales: 7 slots por día (todos menos almuerzo)
  eventsGrid: Record<DayKey, GlobalCell[]> = {
    lun: this.emptyRow(),
    mar: this.emptyRow(),
    mie: this.emptyRow(),
    jue: this.emptyRow(),
    vie: this.emptyRow(),
  };

  // Estado del modal
  modal: {
    open: boolean;
    dayKey: DayKey | null;
    dayLabel: string;
    blockLabel: string;
    dataIndex: number;
    model: {
      title: string;
      note: string;
    };
  } = {
    open: false,
    dayKey: null,
    dayLabel: '',
    blockLabel: '',
    dataIndex: -1,
    model: { title: '', note: '' },
  };

  // Alertas sencillas
  alertMessage = '';
  alertType: 'success' | 'danger' | 'warning' = 'success';

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.cargarEventosSemana();
  }

  /* ===== Helpers básicos ===== */

  private emptyRow(): GlobalCell[] {
    return [null, null, null, null, null, null, null];
  }

  private resetGrid() {
    this.eventsGrid = {
      lun: this.emptyRow(),
      mar: this.emptyRow(),
      mie: this.emptyRow(),
      jue: this.emptyRow(),
      vie: this.emptyRow(),
    };
  }

  private showAlert(msg: string, type: 'success' | 'danger' | 'warning') {
    this.alertMessage = msg;
    this.alertType = type;
    setTimeout(() => (this.alertMessage = ''), 2500);
  }

  /* ===== Etiquetas semana ===== */

  weekLabel(): string {
    const monday = mondayOfISOWeek(this.current);
    const sunday = new Date(monday);
    sunday.setUTCDate(monday.getUTCDate() + 6);
    const f = (d: Date) =>
      `${pad(d.getUTCDate())}/${pad(d.getUTCMonth() + 1)}`;
    return `Del ${f(monday)} al ${f(sunday)}`;
  }

  weekIsoLabel(): string {
    const [anio, w] = this.current.split('-W');
    const semana = Number(w);
    return `año ${anio} - semana ${semana}`;
  }

  /**
   * Convierte una fecha a DayKey.
   * Esperado: "YYYY-MM-DD". Si llegara "YYYY-MM-DDTHH:mm:ss...", se recorta.
   */
  private fechaToDayKey(fecha: string): DayKey | null {
    const dateOnly = fecha?.slice(0, 10);
    const [yearStr, monthStr, dayStr] = dateOnly.split('-');
    if (!yearStr || !monthStr || !dayStr) return null;

    const year = Number(yearStr);
    const month = Number(monthStr);
    const dayNum = Number(dayStr);
    if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(dayNum)) {
      return null;
    }

    const d = new Date(year, month - 1, dayNum); // local
    const dayOfWeek = d.getDay(); // 0-dom, 1-lun, ...

    const map: Record<number, DayKey> = {
      1: 'lun',
      2: 'mar',
      3: 'mie',
      4: 'jue',
      5: 'vie',
    };

    return map[dayOfWeek] ?? null;
  }

  /* ===== Mapping bloque visible <-> índice de datos (0..6) ===== */

  visibleIndexToDataIndex(visibleIndex: number): number {
    let count = -1;
    for (let i = 0; i < this.blocks.length; i++) {
      if (this.blocks[i].isLunch) continue;
      count++;
      if (i === visibleIndex) return count;
    }
    return -1; // almuerzo
  }

  private blockCodeToDataIndex(code: string): number | null {
    const codes = [
      '(1 - 2)',
      '(3 - 4)',
      '(5 - 6)',
      '(7 - 8)',
      '(9 - 10)',
      '(11 - 12)',
      '(13 - 14)',
      '(15 - 16)',
    ];
    const position = codes.indexOf(code);
    if (position === -1) return null;

    if (code === '(7 - 8)') return null; // almuerzo
    if (position < 3) return position;
    if (position > 3) return position - 1;

    return null;
  }

  private dataIndexToBlockCode(dataIndex: number): string | null {
    let count = -1;
    for (let i = 0; i < this.blocks.length; i++) {
      if (this.blocks[i].isLunch) continue;
      count++;
      if (count === dataIndex) return this.blocks[i].code;
    }
    return null;
  }

  /* ===== Cargar eventos globales de la semana ===== */

  cargarEventosSemana() {
    this.resetGrid();

    this.dataService.getEventosGlobalesSemana(this.current).subscribe({
      next: (items: GlobalEvent[]) => {
        items.forEach((ev) => {
          const dayKey = this.fechaToDayKey(ev.fecha);
          const dataIndex = this.blockCodeToDataIndex(ev.blockCode);

          if (!dayKey || dataIndex === null) return;

          this.eventsGrid[dayKey][dataIndex] = {
            title: ev.titulo,
            note: ev.descripcion ?? undefined,
          };
        });
      },
      error: (err) => {
        console.error('Error cargando eventos globales:', err);
        this.showAlert('Error cargando eventos de la semana', 'danger');
      },
    });
  }

  /* ===== Helpers para la tabla ===== */

  hasEvent(dayKey: DayKey, dataIndex: number): boolean {
    return !!this.eventsGrid[dayKey]?.[dataIndex];
  }

  getEventTitle(dayKey: DayKey, dataIndex: number): string | null {
    return this.eventsGrid[dayKey]?.[dataIndex]?.title ?? null;
  }

  getEventNote(dayKey: DayKey, dataIndex: number): string | null {
    return this.eventsGrid[dayKey]?.[dataIndex]?.note ?? null;
  }

  getCellClasses(dayKey: DayKey, dataIndex: number) {
    const has = this.hasEvent(dayKey, dataIndex);

    return {
      'bg-red-50 border border-red-200 dark:bg-red-500/10 dark:border-red-500/40': has,
    };
  }

  /* ===== Modal ===== */

  openModal(dayKey: DayKey, visibleIndex: number) {
    const dataIndex = this.visibleIndexToDataIndex(visibleIndex);
    if (dataIndex === -1) return;

    const day = this.days.find((d) => d.key === dayKey);
    const block = this.blocks[visibleIndex];

    this.modal.open = true;
    this.modal.dayKey = dayKey;
    this.modal.dayLabel = day ? day.label : '';
    this.modal.blockLabel = block ? block.label : '';
    this.modal.dataIndex = dataIndex;

    const current = this.eventsGrid[dayKey][dataIndex];
    this.modal.model = {
      title: current?.title ?? '',
      note: current?.note ?? '',
    };
  }

  closeModal() {
    this.modal.open = false;
    this.modal.dayKey = null;
    this.modal.dataIndex = -1;
    this.modal.dayLabel = '';
    this.modal.blockLabel = '';
    this.modal.model = { title: '', note: '' };
  }

  saveFromModal() {
    const { dayKey, dataIndex, model } = this.modal;
    if (!dayKey || dataIndex === -1) return;

    const title = model.title.trim();
    const note = model.note.trim();

    if (!title) {
      this.showAlert('El título del evento es obligatorio.', 'warning');
      return;
    }

    this.eventsGrid[dayKey][dataIndex] = {
      title,
      note: note || undefined,
    };

    this.guardarSemana();
    this.closeModal();
  }

  clearFromModal() {
    const { dayKey, dataIndex } = this.modal;
    if (!dayKey || dataIndex === -1) return;

    this.eventsGrid[dayKey][dataIndex] = null;

    this.guardarSemana();
    this.closeModal();
  }

  /* ===== Guardar semana en backend ===== */

  guardarSemana() {
    const payload: GlobalEventPayload[] = [];

    (Object.keys(this.eventsGrid) as DayKey[]).forEach((dayKey) => {
      this.eventsGrid[dayKey].forEach((cell, dataIndex) => {
        if (!cell) return;

        const blockCode = this.dataIndexToBlockCode(dataIndex);
        if (!blockCode) return;

        payload.push({
          dayKey,
          blockCode,
          titulo: cell.title,
          descripcion: cell.note,
        });
      });
    });

    this.dataService.saveEventosGlobalesSemana(this.current, payload).subscribe({
      next: () => {
        this.showAlert('Eventos de la semana guardados', 'success');
        this.cargarEventosSemana();
      },
      error: (err) => {
        console.error('Error guardando eventos globales:', err);
        this.showAlert('Error guardando eventos', 'danger');
      },
    });
  }
}
