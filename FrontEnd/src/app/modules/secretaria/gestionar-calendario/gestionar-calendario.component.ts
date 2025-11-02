import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LayoutComponent } from '../../../components/layout/layout.component';
import { SECRETARIA_NAV_ITEMS } from '../profile-home/secretaria.nav';

type Block = { label: string; code: string; isLunch?: boolean };
type DayKey = 'lun' | 'mar' | 'mie' | 'jue' | 'vie' | 'sab';
type Cell = { title: string; room?: string; note?: string } | null;

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
export class GestionarCalendarioComponent {
  secretariaNavItems = SECRETARIA_NAV_ITEMS;

  // Semana actual (ISO week)
  current = weekKey(new Date());

  // Bloques
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

  // Días
  days: { key: DayKey; label: string }[] = [
    { key: 'lun', label: 'Lunes' },
    { key: 'mar', label: 'Martes' },
    { key: 'mie', label: 'Miércoles' },
    { key: 'jue', label: 'Jueves' },
    { key: 'vie', label: 'Viernes' },
    { key: 'sab', label: 'Sábado' },
  ];

  // Horario “editable” en memoria
  schedule: Record<DayKey, Cell[]> = {
    lun: Array(this.blocks.length).fill(null),
    mar: Array(this.blocks.length).fill(null),
    mie: Array(this.blocks.length).fill(null),
    jue: Array(this.blocks.length).fill(null),
    vie: Array(this.blocks.length).fill(null),
    sab: Array(this.blocks.length).fill(null),
  };

  // Edición inline
  editingInline: { day: DayKey; bi: number; value: string } | null = null;

  // Label “Del dd/mm al dd/mm”
  weekLabel(): string {
    const monday = mondayOfISOWeek(this.current);
    const sunday = new Date(monday);
    sunday.setUTCDate(monday.getUTCDate() + 6);
    const f = (d: Date) => `${pad(d.getUTCDate())}/${pad(d.getUTCMonth() + 1)}`;
    return `Del ${f(monday)} al ${f(sunday)}`;
  }

  // Muestra "año 2025 - semana 44"
  weekIsoLabel(): string {
    const [anio, w] = this.current.split('-W');
    const semana = Number(w);
    return `año ${anio} - semana ${semana}`;
  }

  // Inline edit
  startInlineEdit(day: DayKey, bi: number) {
    if (this.blocks[bi].isLunch) return;
    const current = this.schedule[day][bi];
    this.editingInline = { day, bi, value: current?.title ?? '' };
  }

  commitInlineEdit() {
    if (!this.editingInline) return;
    const { day, bi, value } = this.editingInline;
    const title = (value || '').trim();
    this.schedule[day][bi] = title ? { title } : null;
    this.editingInline = null;
  }

  cancelInlineEdit() {
    this.editingInline = null;
  }

  onInlineKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      this.commitInlineEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      this.cancelInlineEdit();
    }
  }

  guardarSemana() {
    console.log(
      'Semana',
      this.current,
      'Horario:',
      JSON.parse(JSON.stringify(this.schedule))
    );
    alert('Horario de la semana guardado (demo).');
  }
}
