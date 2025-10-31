import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  ReactiveFormsModule, FormBuilder, Validators, FormArray, AbstractControl, ValidationErrors
} from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule }      from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, NativeDateAdapter } from '@angular/material/core';
import { MatSelectModule }     from '@angular/material/select';

import { LayoutComponent } from '../../../shared/layout/layout.component';

type WeekFlags = { mon:boolean; tue:boolean; wed:boolean; thu:boolean; fri:boolean; sat:boolean; sun:boolean };

/** Adapter para que la semana comience en lunes */
class MondayFirstDateAdapter extends NativeDateAdapter {
  override getFirstDayOfWeek(): number { return 1; } // 0=Domingo, 1=Lunes
}

/** Formatos de fecha: dd/MM/yyyy */
export const ES_DATE_FORMATS = {
  parse:   { dateInput: 'dd/MM/yyyy' },
  display: {
    dateInput: 'dd/MM/yyyy',
    monthYearLabel: 'MMMM yyyy',
    dateA11yLabel: 'dd/MM/yyyy',
    monthYearA11yLabel: 'MMMM yyyy'
  }
};

@Component({
  standalone: true,
  selector: 'app-activity-new',
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatDatepickerModule, MatNativeDateModule, MatSelectModule,
    LayoutComponent
  ],
  templateUrl: './activity-new.component.html',
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-CL' },          // Español (Chile)
    { provide: DateAdapter, useClass: MondayFirstDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: ES_DATE_FORMATS }
  ]
})
export class ActivityNewComponent {
  private fb = inject(FormBuilder);

  // Catálogos demo
  tiposActividad = ['Taller', 'Seminario', 'Voluntariado', 'Investigación', 'Deportivo', 'Cultural'];
  estados = ['Realizada', 'Pendiente'];

  // Mes actual (límites)
  private readonly now = new Date();
  private readonly firstDay = new Date(this.now.getFullYear(), this.now.getMonth(), 1);
  private readonly lastDay  = new Date(this.now.getFullYear(), this.now.getMonth() + 1, 0);

  readonly monthStartISO = this.toISO(this.firstDay);
  readonly monthEndISO   = this.toISO(this.lastDay);

  // Feriados 2025 (Chile)
  private readonly feriadosISO = new Set<string>([
    '2025-01-01','2025-04-18','2025-04-19','2025-05-01','2025-05-21',
    '2025-06-07','2025-06-20','2025-06-29','2025-07-16','2025-08-15',
    '2025-09-18','2025-09-19','2025-10-12','2025-10-31','2025-11-01',
    '2025-11-16','2025-12-08','2025-12-14','2025-12-25'
  ]);

  // Hoy
  readonly today = new Date();

  form = this.fb.group({
    descripcionAct: ['', [Validators.required, Validators.maxLength(500)]],
    fecha: [this.today, Validators.required],
    tipo_actividad: [this.tiposActividad[0], Validators.required],
    estado: [this.estados[0], Validators.required],

    multi: this.fb.group({
      enable: [false],
      mode: ['specific' as 'specific' | 'weekly'],
      specificDates: this.fb.array<Date>([]),
      weekly: this.fb.group({
        start: [this.today, Validators.required],
        end:   [this.today, Validators.required],
        weekdays: this.fb.group<WeekFlags>({
          mon: false, tue: false, wed: false, thu: false, fri: false, sat: false, sun: false
        })
      })
    })
  });

  constructor() {
    // Validador de mes (defensa extra)
    this.form.addValidators(this.restrictToCurrentMonth.bind(this));
  }

  // Getters
  get f() { return this.form.controls; }
  get multi() { return this.form.get('multi')!; }
  get specificDates(): FormArray { return this.multi.get('specificDates') as FormArray; }
  get weekly() { return this.multi.get('weekly')!; }
  get weekdays() { return this.weekly.get('weekdays')!; }

  // ==== UI helpers (datepicker) ====
  dateFilter = (d: Date | null): boolean => {
    if (!d) return false;
    const iso = this.toISO(d);
    return iso >= this.monthStartISO && iso <= this.monthEndISO && !this.feriadosISO.has(iso);
  };

  dateClass = (d: Date): string => {
    return this.feriadosISO.has(this.toISO(d)) ? 'holiday-cell' : 'available-cell';
  };

  addSpecificDate(value: Date = this.today) { this.specificDates.push(this.fb.control(value, Validators.required)); }
  removeSpecificDate(i: number) { this.specificDates.removeAt(i); }

  // ==== Validación ====
  private restrictToCurrentMonth(group: AbstractControl): ValidationErrors | null {
    const inMonth = (dt: Date | null | undefined) =>
      !!dt && this.toISO(dt) >= this.monthStartISO && this.toISO(dt) <= this.monthEndISO;

    let anyError = false;

    const fecha = group.get('fecha')?.value as Date | null;
    group.get('fecha')?.setErrors(null);
    if (!inMonth(fecha)) { group.get('fecha')?.setErrors({ outOfMonth: true }); anyError = true; }

    const multi = group.get('multi');
    if (multi?.get('enable')?.value) {
      const mode = multi.get('mode')?.value as 'specific' | 'weekly';
      if (mode === 'specific') {
        const fa = multi.get('specificDates') as FormArray;
        fa.controls.forEach(c => {
          const v = c.value as Date | null;
          if (!inMonth(v)) { c.setErrors({ outOfMonth: true }); anyError = true; }
          else if (c.hasError('outOfMonth')) c.setErrors(null);
        });
      } else {
        const startCtrl = multi.get('weekly.start');
        const endCtrl   = multi.get('weekly.end');
        const s = startCtrl?.value as Date | null;
        const e = endCtrl?.value as Date | null;
        startCtrl?.setErrors(null); endCtrl?.setErrors(null);
        if (!inMonth(s)) { startCtrl?.setErrors({ outOfMonth: true }); anyError = true; }
        if (!inMonth(e)) { endCtrl?.setErrors({ outOfMonth: true }); anyError = true; }
        if (s && e && s > e) { endCtrl?.setErrors({ range: true }); anyError = true; }
      }
    }

    return anyError ? { outOfMonth: true } : null;
  }

  // ==== Utilidades ====
  private toISO(d: Date): string {
    return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
      .toISOString().slice(0, 10);
  }

  private* daysBetween(start: Date, end: Date) {
    const cur = new Date(start);
    while (cur <= end) {
      yield new Date(cur);
      cur.setDate(cur.getDate() + 1);
    }
  }

  private selectedWeekdays(): number[] {
    const w = this.weekdays.value as WeekFlags;
    const map: [keyof WeekFlags, number][] = [
      ['sun',0], ['mon',1], ['tue',2], ['wed',3], ['thu',4], ['fri',5], ['sat',6]
    ];
    return map.filter(([k]) => w[k]).map(([, num]) => num);
  }

  // ==== Envío ====
  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const base = this.form.value;
    const fechas = new Set<string>([this.toISO(base.fecha as Date)]);

    const multi = base.multi!;
    if (multi.enable) {
      if (multi.mode === 'specific') {
        for (const c of this.specificDates.controls) {
          const v = (c as AbstractControl).value as Date;
          const iso = this.toISO(v);
          if (!this.feriadosISO.has(iso) && iso >= this.monthStartISO && iso <= this.monthEndISO) {
            fechas.add(iso);
          }
        }
      } else {
        const s = multi.weekly!.start as Date;
        const e = multi.weekly!.end as Date;
        const wdays = this.selectedWeekdays();
        for (const d of this.daysBetween(s, e)) {
          const iso = this.toISO(d);
          if (wdays.includes(d.getDay()) &&
              !this.feriadosISO.has(iso) &&
              iso >= this.monthStartISO && iso <= this.monthEndISO) {
            fechas.add(iso);
          }
        }
      }
    }

    const payload = {
      descripcionAct: base.descripcionAct,
      tipo_actividad: base.tipo_actividad,
      estado: base.estado,
      fechas: Array.from(fechas).sort()
    };

    console.log('Payload actividad (con feriados bloqueados):', payload);
  }
}
