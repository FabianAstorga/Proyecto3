// src/app/modules/gestionar-calendario/gestionar-calendario.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LayoutComponent } from '../../components/layout/layout.component';

import {
  DayKey,
  GlobalEventBackend,
  GlobalEventPayload,
} from '../../models/horario.models';
import { DataService } from '../../services/data.service';

interface Block {
  label: string;
  code: string;
}

interface ScheduleEvent {
  title: string;
  blockIndex: number; // índice al arreglo blocks[]
  note?: string;
}

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

  // Bloques disponibles para los eventos
  blocks: Block[] = [
    { label: '08:00 - 09:30', code: '(1 - 2)' },
    { label: '09:40 - 11:10', code: '(3 - 4)' },
    { label: '11:20 - 12:50', code: '(5 - 6)' },
    { label: '13:00 - 14:30', code: '(7 - 8)' },
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

  // Eventos transversales por día (en memoria)
  eventsByDay: Record<DayKey, ScheduleEvent[]> = {
    lun: [],
    mar: [],
    mie: [],
    jue: [],
    vie: [],
  };

  // Estado del modal
  modal: {
    open: boolean;
    dayKey: DayKey | null;
    dayLabel: string;
    model: {
      title: string;
      blockIndex: number | null;
      note: string;
    };
    availableBlocks: number[];
  } = {
    open: false,
    dayKey: null,
    dayLabel: '',
    model: {
      title: '',
      blockIndex: null,
      note: '',
    },
    availableBlocks: [],
  };

  // Alertas sencillas del componente
  alertMessage = '';
  alertType: 'success' | 'danger' | 'warning' = 'success';

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.cargarEventosSemana();
  }

  /* ===== Alertas ===== */

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

  /* ===== Helpers para mapear backend -> front ===== */

  private resetEvents() {
    this.eventsByDay = {
      lun: [],
      mar: [],
      mie: [],
      jue: [],
      vie: [],
    };
  }

  // convierte "2025-01-01" -> 'mie' (por ejemplo)
  private fechaToDayKey(fecha: string): DayKey | null {
    const d = new Date(fecha);
    const day = d.getDay(); // 0-dom, 1-lun, ..., 6-sab

    const map: Record<number, DayKey> = {
      1: 'lun',
      2: 'mar',
      3: 'mie',
      4: 'jue',
      5: 'vie',
    };

    return map[day] ?? null;
  }

  private blockCodeToIndex(code: string): number | null {
    const idx = this.blocks.findIndex((b) => b.code === code);
    return idx === -1 ? null : idx;
  }

  /* ===== Cargar eventos globales de la semana ===== */

  cargarEventosSemana() {
    this.resetEvents();

    this.dataService.getEventosGlobalesSemana(this.current).subscribe({
      next: (items: GlobalEventBackend[]) => {
        items.forEach((ev) => {
          const dayKey = this.fechaToDayKey(ev.fecha);
          const blockIndex = this.blockCodeToIndex(ev.blockCode);
          if (!dayKey || blockIndex === null) return;

          this.eventsByDay[dayKey].push({
            title: ev.titulo,
            blockIndex,
            note: ev.descripcion ?? undefined,
          });
        });
      },
      error: (err) => {
        console.error('Error cargando eventos globales:', err);
        this.showAlert('Error cargando eventos de la semana', 'danger');
      },
    });
  }

  /* ===== Bloques libres por día ===== */

  private getFreeBlocks(dayKey: DayKey): number[] {
    const used = new Set(
      this.eventsByDay[dayKey].map((ev) => ev.blockIndex),
    );
    return this.blocks
      .map((_, i) => i)
      .filter((i) => !used.has(i));
  }

  hasFreeBlocks(dayKey: DayKey): boolean {
    return this.getFreeBlocks(dayKey).length > 0;
  }

  /* ===== Modal ===== */

  openModal(dayKey: DayKey) {
    const free = this.getFreeBlocks(dayKey);
    if (!free.length) {
      this.showAlert('Todos los bloques de este día ya tienen un evento.', 'warning');
      return;
    }

    const day = this.days.find((d) => d.key === dayKey);
    this.modal.open = true;
    this.modal.dayKey = dayKey;
    this.modal.dayLabel = day ? day.label : '';
    this.modal.availableBlocks = free;
    this.modal.model = {
      title: '',
      blockIndex: null,
      note: '',
    };
  }

  closeModal() {
    this.modal.open = false;
    this.modal.dayKey = null;
    this.modal.availableBlocks = [];
  }

  saveFromModal() {
    const { dayKey, model } = this.modal;
    if (!dayKey) return;

    const title = model.title.trim();
    if (!title || model.blockIndex === null) {
      this.showAlert('Completa título y bloque antes de guardar.', 'warning');
      return;
    }

    const ev: ScheduleEvent = {
      title,
      blockIndex: model.blockIndex,
      note: model.note.trim() || undefined,
    };

    this.eventsByDay[dayKey].push(ev);

    this.closeModal();
  }

  /* ===== Guardar semana (llamando backend) ===== */

  guardarSemana() {
    const payload: GlobalEventPayload[] = [];

    (Object.keys(this.eventsByDay) as DayKey[]).forEach((dayKey) => {
      this.eventsByDay[dayKey].forEach((ev) => {
        const block = this.blocks[ev.blockIndex];
        if (!block) return;

        payload.push({
          dayKey,
          blockCode: block.code,
          titulo: ev.title,
          descripcion: ev.note,
        });
      });
    });

    this.dataService
      .saveEventosGlobalesSemana(this.current, payload)
      .subscribe({
        next: () => {
          this.showAlert('Eventos de la semana guardados', 'success');
        },
        error: (err) => {
          console.error('Error guardando eventos globales:', err);
          this.showAlert('Error guardando eventos', 'danger');
        },
      });
  }
}
