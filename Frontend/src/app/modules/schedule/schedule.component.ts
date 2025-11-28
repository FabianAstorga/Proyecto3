// src/app/modules/schedule/schedule.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { LayoutComponent } from '../../components/layout/layout.component';
import { User } from '../../models/user.model';
import { DataService } from '../../services/data.service';
import {
  BackendHorario,
  SaveHorarioPayload,
  DayKey,
  GlobalEventBackend,
} from '../../models/horario.models';

type Block = { label: string; code: string; isLunch?: boolean };
type Cell = { title: string; room?: string; note?: string } | null;

@Component({
  standalone: true,
  selector: 'app-schedule',
  imports: [CommonModule, LayoutComponent, FormsModule],
  templateUrl: './schedule.component.html',
})
export class ScheduleComponent implements OnInit {
  // ===== Usuario =====
  user: User | undefined;

  get userFirstName(): string {
    return this.user?.firstName ?? '';
  }

  canEdit = true; // por ahora todo editable en front

  // Bloques visibles en la tabla
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

  // Fecha ejemplo por día (se usa solo al guardar el horario personal)
  fechaPorDia: Record<DayKey, string> = {
    lun: '2024-12-30',
    mar: '2024-12-31',
    mie: '2025-01-01',
    jue: '2025-01-02',
    vie: '2025-01-03',
  };

  // 7 slots (todos menos almuerzo) por día
  schedule: Record<DayKey, Cell[]> = {
    lun: [null, null, null, null, null, null, null],
    mar: [null, null, null, null, null, null, null],
    mie: [null, null, null, null, null, null, null],
    jue: [null, null, null, null, null, null, null],
    vie: [null, null, null, null, null, null, null],
  };

  // Eventos globales por día e índice (capa visual)
  globalEvents: Record<DayKey, { [index: number]: GlobalEventBackend }> = {
    lun: {},
    mar: {},
    mie: {},
    jue: {},
    vie: {},
  };

  // ===== Modal =====
  modal = {
    open: false,
    day: null as DayKey | null,
    dayLabel: '',
    blockLabel: '',
    index: -1,
    model: { title: '', room: '', note: '' },
  };

  // ===== Toast (notificación) =====
  toast = {
    show: false,
    type: 'success' as 'success' | 'error',
    message: '',
  };
  private toastTimeout: any;

  constructor(
    private route: ActivatedRoute,
    private dataService: DataService
  ) {
    console.log('[SCHEDULE] Constructor ejecutado');
  }

  ngOnInit(): void {
    console.log('[SCHEDULE] ngOnInit ejecutado');

    const idParam = this.route.snapshot.paramMap.get('id');
    const routeId = idParam ? Number(idParam) : NaN;

    this.dataService.getMyProfile().subscribe({
      next: (user) => {
        this.user = user;
        console.log('[SCHEDULE] Perfil cargado:', user);

        if (Number.isFinite(routeId) && routeId !== user.id) {
          console.warn(
            'El id de la ruta no coincide con el usuario logueado:',
            'ruta =',
            routeId,
            'user.id =',
            user.id
          );
        }

        // Cargar horario personal
        this.dataService.getHorarioByUser(user.id!).subscribe({
          next: (horarios) => {
            console.log('[SCHEDULE] Horario personal cargado:', horarios);
            this.applyBackendHorario(horarios);

            // Luego eventos globales de la semana actual
            this.loadGlobalEventsForWeek();
          },
          error: (err) =>
            console.error('Error cargando horario desde backend:', err),
        });
      },
      error: (err) => {
        console.error('Error cargando perfil para horario:', err);
      },
    });
  }

  // ===== Cargar horario personal =====
  applyBackendHorario(horarios: BackendHorario[]): void {
    (Object.keys(this.schedule) as DayKey[]).forEach((day) => {
      this.schedule[day] = [null, null, null, null, null, null, null];
    });

    const bloqueToIndex: Record<string, { day: DayKey; index: number }> = {};

    this.days.forEach((d) => {
      this.blocks.forEach((b, visibleIndex) => {
        if (b.isLunch) return;
        const dataIndex = this.visibleIndexToDataIndex(visibleIndex);
        if (dataIndex === -1) return;

        const key = `${d.label} ${b.code}`; // Ej: "Lunes (1 - 2)"
        bloqueToIndex[key] = { day: d.key, index: dataIndex };
      });
    });

    horarios.forEach((h) => {
      const info = bloqueToIndex[h.bloque];
      if (!info) return;

      this.schedule[info.day][info.index] = {
        title: h.titulo,
        room: h.sala || undefined,
        note: h.descripcion || undefined,
      };
    });
  }

  // ===== Guardar TODO el horario personal =====
  saveSchedule(showToast = true): void {
    if (!this.user?.id) return;

    const payload: SaveHorarioPayload[] = [];

    this.blocks.forEach((b, visibleIndex) => {
      if (b.isLunch) return;

      const dataIndex = this.visibleIndexToDataIndex(visibleIndex);
      const [horaInicioLabel, horaFinLabel] = b.label.split(' - ');

      this.days.forEach((d) => {
        const cell = this.schedule[d.key][dataIndex];
        if (!cell) return;

        const fecha = this.fechaPorDia[d.key];

        payload.push({
          bloque: `${d.label} ${b.code}`,
          fecha,
          horaInicio: horaInicioLabel,
          horaFin: horaFinLabel,
          esDisponible: true,
          titulo: cell.title,
          sala: cell.room || null,
          descripcion: cell.note || null,
        });
      });
    });

    console.log('[SCHEDULE] Guardando horario personal payload:', payload);

    this.dataService.saveHorarioByUser(this.user.id!, payload).subscribe({
      next: () => {
        if (showToast) {
          this.showToast('success', 'Horario guardado correctamente');
        }
      },
      error: (err) => {
        console.error('Error guardando horario:', err);
        if (showToast) {
          this.showToast('error', 'Error al guardar el horario');
        }
      },
    });
  }

  // ===== Toast helper =====
  private showToast(type: 'success' | 'error', message: string) {
    this.toast.type = type;
    this.toast.message = message;
    this.toast.show = true;

    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }

    this.toastTimeout = setTimeout(() => {
      this.toast.show = false;
    }, 2500);
  }

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
    this.modal.dayLabel = this.days.find((d) => d.key === day)?.label ?? '';
    this.modal.blockLabel = this.blocks[visibleIndex]?.label ?? '';
    this.modal.index = dataIndex;
    this.modal.model = {
      title: current?.title ?? '',
      room: current?.room ?? '',
      note: current?.note ?? '',
    };
  }

  // Guardar celda -> actualizar grid -> guardar TODO el horario -> toast
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
    this.saveSchedule(true);
    this.closeModal();
  }

  clearFromModal(): void {
    if (!this.modal.open || !this.modal.day) return;
    this.schedule[this.modal.day][this.modal.index] = null;
    this.saveSchedule(true);
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

  // ===== Helpers para fechas / semanas y eventos globales =====

  private pad(n: number): string {
    return n.toString().padStart(2, '0');
  }

  // ISO week para una fecha (en local)
  private weekKey(fecha: Date): string {
    const d = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
    const day = d.getDay() || 7;
    d.setDate(d.getDate() + 4 - day);
    const year = d.getFullYear();
    const yearStart = new Date(year, 0, 1);
    const week = Math.ceil(
      ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
    );
    return `${year}-W${this.pad(week)}`;
  }

  /**
   * Conversión segura de 'YYYY-MM-DD' -> DayKey
   * Usamos constructor con year, month, day para evitar el desfase por UTC
   * que hacía que '2025-11-24' (lunes) se convirtiera en domingo en zonas -03.
   */
  private fechaToDayKey(fecha: string): DayKey | null {
    const [yearStr, monthStr, dayStr] = fecha.split('-');
    const year = Number(yearStr);
    const month = Number(monthStr);
    const dayNum = Number(dayStr);

    const d = new Date(year, month - 1, dayNum); // local, sin shift de zona
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
    if (position < 3) return position; // 0,1,2 -> 0,1,2
    if (position > 3) return position - 1; // 4..7 -> 3..6

    return null;
  }

  private loadGlobalEventsForWeek(): void {
    const today = new Date();
    const isoWeek = this.weekKey(today);

    console.log('[SCHEDULE] Solicitando eventos globales para semana ISO:', isoWeek);

    // Reset
    this.globalEvents = { lun: {}, mar: {}, mie: {}, jue: {}, vie: {} };

    this.dataService.getEventosGlobalesSemana(isoWeek).subscribe({
      next: (items: GlobalEventBackend[]) => {
        console.log('[SCHEDULE] Eventos globales recibidos:', items);

        items.forEach((ev) => {
          const dayKey = this.fechaToDayKey(ev.fecha as any);
          const dataIndex = this.blockCodeToDataIndex(ev.blockCode);

          console.log(
            '[SCHEDULE] Mapeando evento:',
            ev,
            '→ dayKey =',
            dayKey,
            'dataIndex =',
            dataIndex
          );

          if (!dayKey || dataIndex === null) return;
          this.globalEvents[dayKey][dataIndex] = ev;
        });

        console.log('[SCHEDULE] Estado final de globalEvents:', this.globalEvents);
      },
      error: (err) => {
        console.error('Error cargando eventos globales en horario:', err);
      },
    });
  }

  hasGlobalEvent(day: DayKey, dataIndex: number): boolean {
    return !!this.globalEvents[day]?.[dataIndex];
  }

  getGlobalEventTitle(day: DayKey, dataIndex: number): string | null {
    return this.globalEvents[day]?.[dataIndex]?.titulo ?? null;
  }

  // ===== Clases visuales de cada celda =====
  getCellClasses(dayKey: DayKey, dataIndex: number) {
    const hasGlobal = this.hasGlobalEvent(dayKey, dataIndex);
    const cell = this.schedule[dayKey]?.[dataIndex] ?? null;

    return {
      // Solo actividad personal (sin evento global)
      'bg-indigo-50 dark:bg-indigo-500/10': !!cell && !hasGlobal,

      // Evento global presente
      'bg-red-50 border border-red-200 dark:bg-red-500/10 dark:border-red-500/40':
        hasGlobal,
    };
  }
}
