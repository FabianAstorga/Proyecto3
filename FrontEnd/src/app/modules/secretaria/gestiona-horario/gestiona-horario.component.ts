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
  // ISO week string: YYYY-W##
  const tmp = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  // Jueves de la semana garantiza semana ISO
  tmp.setUTCDate(tmp.getUTCDate() + 4 - (tmp.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((+tmp - +yearStart) / 86400000 + 1) / 7);
  return `${tmp.getUTCFullYear()}-W${pad(week)}`;
}
function mondayOfISOWeek(iso: string) {
  // iso = 'YYYY-W##'
  const year = Number(iso.slice(0, 4));
  const week = Number(iso.slice(6));
  const simple = new Date(Date.UTC(year, 0, 4)); // 4 de enero siempre semana 1
  const dayOfWeek = simple.getUTCDay() || 7;
  const monday = new Date(simple);
  monday.setUTCDate(simple.getUTCDate() - dayOfWeek + 1 + (week - 1) * 7);
  return monday;
}

@Component({
  standalone: true,
  selector: 'app-gestiona-horario',
  imports: [CommonModule, FormsModule, LayoutComponent],
  templateUrl: './gestiona-horario.component.html',
})
export class GestionaHorarioComponent {
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

  // Celda seleccionada
  selected: { day: DayKey; bi: number } | null = null;

  // Campos editor (compatibles con ngModel)
  editorTitle = '';
  editorRoom?: string;
  editorNote?: string;

  // Label “Del dd/mm al dd/mm”
  weekLabel(): string {
    const monday = mondayOfISOWeek(this.current);
    const sunday = new Date(monday);
    sunday.setUTCDate(monday.getUTCDate() + 6);
    const f = (d: Date) => `${pad(d.getUTCDate())}/${pad(d.getUTCMonth() + 1)}`;
    return `Del ${f(monday)} al ${f(sunday)}`;
  }

  onWeekChange(ev: Event) {
    const input = ev.target as HTMLInputElement | null;
    const value = input?.value ?? '';
    if (!value) return;
    this.current = value;
    this.selected = null;
  }

  openEditor(day: DayKey, bi: number) {
    if (this.blocks[bi].isLunch) return;
    this.selected = { day, bi };
    const cell = this.schedule[day][bi];
    this.editorTitle = cell?.title ?? '';
    this.editorRoom = cell?.room;
    this.editorNote = cell?.note;
  }

  selectedDayLabel(): string {
    if (!this.selected) return '';
    const d = this.days.find((x) => x.key === this.selected!.day);
    return d?.label ?? '';
  }

  selectedBlockLabel(): string {
    if (!this.selected) return '';
    const bi = this.selected!.bi;
    return this.blocks[bi]?.label ?? '';
  }

  applyCell() {
    if (!this.selected) return;
    const { day, bi } = this.selected;
    const t = this.editorTitle?.trim();
    this.schedule[day][bi] = t
      ? { title: t, room: this.editorRoom, note: this.editorNote }
      : null;
    this.selected = null;
  }

  clearCell() {
    if (!this.selected) return;
    const { day, bi } = this.selected;
    this.schedule[day][bi] = null;
    this.selected = null;
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
