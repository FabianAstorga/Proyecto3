import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, FormArray, AbstractControl } from '@angular/forms';

type WeekFlags = { mon:boolean; tue:boolean; wed:boolean; thu:boolean; fri:boolean; sat:boolean; sun:boolean };

@Component({
  standalone: true,
  selector: 'app-activity-new',
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './activity-new.component.html'
})
export class ActivityNewComponent {
  private fb = inject(FormBuilder);

  tiposActividad = ['Taller', 'Seminario', 'Voluntariado', 'Investigación', 'Deportivo', 'Cultural'];
  estados = [ 'Realizada', 'Pendiente'];

  readonly today = new Date().toISOString().slice(0, 10);

  form = this.fb.group({
    descripcionAct: ['', [Validators.required, Validators.maxLength(500)]],
    fecha: [this.today, Validators.required],
    tipo_actividad: [this.tiposActividad[0], Validators.required],
    estado: [this.estados[0], Validators.required],

    multi: this.fb.group({
      enable: [false],
      mode: ['specific' as 'specific' | 'weekly'],
      specificDates: this.fb.array<string>([]),
      weekly: this.fb.group({
        start: [this.today, Validators.required],
        end:   [this.today, Validators.required],
        weekdays: this.fb.group<WeekFlags>({
          mon: false, tue: false, wed: false, thu: false, fri: false, sat: false, sun: false
        })
      })
    })
  });

  get f() { return this.form.controls; }
  get multi() { return this.form.get('multi')!; }
  get specificDates(): FormArray { return this.multi.get('specificDates') as FormArray; }
  get weekly() { return this.multi.get('weekly')!; }
  get weekdays() { return this.weekly.get('weekdays')!; }

  addSpecificDate(value = this.today) {
    this.specificDates.push(this.fb.control(value, Validators.required));
  }

  removeSpecificDate(i: number) {
    this.specificDates.removeAt(i);
  }

  private toISODate(d: Date): string {
    return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
      .toISOString().slice(0,10);
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
    return map.filter(([k, num]) => w[k]).map(([, num]) => num);
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const base = this.form.value;
    const fechas = new Set<string>([base.fecha!]);

    const multi = base.multi!;
    if (multi.enable) {
      if (multi.mode === 'specific') {
        for (const c of this.specificDates.controls) {
          const v = (c as AbstractControl).value as string;
          if (v) fechas.add(v);
        }
      } else {
        const s = new Date(multi.weekly!.start!);
        const e = new Date(multi.weekly!.end!);
        const wdays = this.selectedWeekdays();
        for (const d of this.daysBetween(s, e)) {
          if (wdays.includes(d.getDay())) fechas.add(this.toISODate(d));
        }
      }
    }

    const payload = {
      descripcionAct: base.descripcionAct,
      tipo_actividad: base.tipo_actividad,
      estado: base.estado,
      fechas: Array.from(fechas).sort()
    };

    console.log('Payload actividad:', payload);
  }
}
