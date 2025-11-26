// src/app/modules/schedule/schedule.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { LayoutComponent } from '../../components/layout/layout.component';
import { User } from '../../models/user.model';
import { DataService } from '../../services/data.service';
import { BackendHorario, SaveHorarioPayload } from '../../models/horario.models';

type Block = { label: string; code: string; isLunch?: boolean };
type DayKey = 'lun' | 'mar' | 'mie' | 'jue' | 'vie';
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

  // Fecha de ejemplo por día (ajusta a la semana que quieras)
  fechaPorDia: Record<DayKey, string> = {
    lun: '2024-12-30', // Lunes
    mar: '2024-12-31', // Martes
    mie: '2025-01-01', // Miércoles
    jue: '2025-01-02', // Jueves
    vie: '2025-01-03', // Viernes
  };

  // 7 slots (todos menos almuerzo) por día
  schedule: Record<DayKey, Cell[]> = {
    lun: [null, null, null, null, null, null, null],
    mar: [null, null, null, null, null, null, null],
    mie: [null, null, null, null, null, null, null],
    jue: [null, null, null, null, null, null, null],
    vie: [null, null, null, null, null, null, null],
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
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const routeId = idParam ? Number(idParam) : NaN;

    // Usamos el perfil del usuario logueado
    this.dataService.getMyProfile().subscribe({
      next: (user) => {
        this.user = user;

        // Solo para debug: si el id de la ruta no coincide con el logueado
        if (Number.isFinite(routeId) && routeId !== user.id) {
          console.warn(
            'El id de la ruta no coincide con el usuario logueado:',
            'ruta =', routeId, 'user.id =', user.id
          );
        }

        // Cargar horario desde el backend para este usuario
        this.dataService.getHorarioByUser(user.id!).subscribe({
          next: (horarios) => this.applyBackendHorario(horarios),
          error: (err) =>
            console.error('Error cargando horario desde backend:', err),
        });
      },
      error: (err) => {
        console.error('Error cargando perfil para horario:', err);
      },
    });
  }

  // ===== Cargar horario que viene del back en el grid =====
  applyBackendHorario(horarios: BackendHorario[]): void {
    // Limpio primero
    (Object.keys(this.schedule) as DayKey[]).forEach((day) => {
      this.schedule[day] = [null, null, null, null, null, null, null];
    });

    // Mapa bloque -> { day, index } construido en base a los mismos days/blocks
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

  // ===== Guardar TODO el horario en el backend =====
  // (lo usamos cuando el usuario guarda una celda)
  saveSchedule(showToast = true): void {
    if (!this.user?.id) return;

    const payload: SaveHorarioPayload[] = [];

    this.blocks.forEach((b, visibleIndex) => {
      if (b.isLunch) return;

      const dataIndex = this.visibleIndexToDataIndex(visibleIndex);
      const [horaInicioLabel, horaFinLabel] = b.label.split(' - '); // "08:00", "09:30"

      this.days.forEach((d) => {
        const cell = this.schedule[d.key][dataIndex];
        if (!cell) return;

        const fecha = this.fechaPorDia[d.key];

        payload.push({
          bloque: `${d.label} ${b.code}`, // Ej: "Lunes (1 - 2)"
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

  // Ahora: guardar celda -> actualizar grid -> guardar TODO el horario -> toast
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

    // Auto-save del horario completo
    this.saveSchedule(true);

    this.closeModal();
  }

  clearFromModal(): void {
    if (!this.modal.open || !this.modal.day) return;
    this.schedule[this.modal.day][this.modal.index] = null;

    // También persistimos el cambio (se borra ese bloque)
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
}
