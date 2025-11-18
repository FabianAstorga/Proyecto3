// v3-modal-centrado (front puro, sin persistencia y sin panel lateral)
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { LayoutComponent } from '../../components/layout/layout.component';

type Block = { label: string; code: string; isLunch?: boolean };
type DayKey = 'lun' | 'mar' | 'mie' | 'jue' | 'vie' | 'sab';
type Cell = { title: string; room?: string; note?: string } | null;

@Component({
  standalone: true,
  selector: 'app-schedule',
  imports: [CommonModule, LayoutComponent, FormsModule],
  templateUrl: './schedule.component.html',
})
export class ScheduleComponent {
  // ya no usamos nav por rol, el horario es común
  canEdit = true; // front puro

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
    { key: 'sab', label: 'Sábado' },
  ];

  // 7 slots (todos menos almuerzo) por día
  schedule: Record<DayKey, Cell[]> = {
    lun: [
      { title: 'Cálculo I', room: 'A-201' },
      null,
      null,
      { title: 'Física', room: 'Lab 3' },
      null,
      null,
      null,
    ],
    mar: [
      null,
      { title: 'Programación', room: 'B-105' },
      null,
      null,
      null,
      null,
      null,
    ],
    mie: [
      null,
      null,
      { title: 'CAD', room: 'Lab CAD' },
      null,
      null,
      null,
      null,
    ],
    jue: [
      null,
      null,
      null,
      { title: 'Materiales', room: 'C-301' },
      null,
      null,
      null,
    ],
    vie: [
      null,
      null,
      null,
      null,
      { title: 'Electrónica', room: 'D-102' },
      null,
      null,
    ],
    sab: [
      null,
      null,
      null,
      null,
      null,
      { title: 'Taller Proyecto', room: 'Makerspace' },
      null,
    ],
  };

  // ===== Modal centrado =====
  modal = {
    open: false,
    day: null as DayKey | null,
    dayLabel: '',
    blockLabel: '',
    index: -1, // índice de datos (0..6)
    model: { title: '', room: '', note: '' },
  };

  // índice visible (incluye lunch) → índice real (sin lunch)
  visibleIndexToDataIndex(visibleIndex: number): number {
    let count = -1;
    for (let i = 0; i < this.blocks.length; i++) {
      if (this.blocks[i].isLunch) continue;
      count++;
      if (i === visibleIndex) return count;
    }
    return -1; // almuerzo
  }

  openModal(day: DayKey, visibleIndex: number): void {
    if (!this.canEdit) return;
    const dataIndex = this.visibleIndexToDataIndex(visibleIndex);
    if (dataIndex === -1) return; // almuerzo no editable

    const current = this.schedule[day][dataIndex] ?? null;
    this.modal.open = true;
    this.modal.day = day;
    this.modal.dayLabel = this.days.find(d => d.key === day)?.label ?? '';
    this.modal.blockLabel = this.blocks[visibleIndex]?.label ?? '';
    this.modal.index = dataIndex;
    this.modal.model = {
      title: current?.title ?? '',
      room: current?.room ?? '',
      note: current?.note ?? '',
    };
  }

  saveFromModal(): void {
    if (!this.modal.open || !this.modal.day) return;
    const t = this.modal.model.title.trim();
    const payload: Cell = t
      ? {
          title: t,
          room: this.modal.model.room?.trim() || undefined,
          note: this.modal.model.note?.trim() || undefined,
        }
      : null;
    this.schedule[this.modal.day][this.modal.index] = payload;
    this.closeModal();
  }

  clearFromModal(): void {
    if (!this.modal.open || !this.modal.day) return;
    this.schedule[this.modal.day][this.modal.index] = null;
    this.closeModal();
  }

  closeModal(): void {
    this.modal.open = false;
    this.modal.day = null;
    this.modal.index = -1;
    this.modal.dayLabel = '';
    this.modal.blockLabel = '';
    this.modal.model = { title: '', room: '', note: '' };
  }
}
