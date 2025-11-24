// src/app/modules/activity-new/activity-new.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormArray,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { RouterLink } from '@angular/router';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  MatNativeDateModule,
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
  NativeDateAdapter,
} from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';

import { LayoutComponent } from '../../components/layout/layout.component';
import { AuthService } from '../../services/auth.service';
import {
  DataService,
  CreateActividadPayload,
  ModoCreacion,
} from '../../services/data.service';

type WeekFlags = {
  mon: boolean;
  tue: boolean;
  wed: boolean;
  thu: boolean;
  fri: boolean;
  sat: boolean;
  sun: boolean;
};

type MultiMode = 'none' | 'specific' | 'weekly';

/** Semana parte en lunes */
class MondayFirstDateAdapter extends NativeDateAdapter {
  override getFirstDayOfWeek(): number {
    return 1;
  }
}

/** Formatos de fecha: dd/MM/yyyy */
export const ES_DATE_FORMATS = {
  parse: { dateInput: 'dd/MM/yyyy' },
  display: {
    dateInput: 'dd/MM/yyyy',
    monthYearLabel: 'MMMM yyyy',
    dateA11yLabel: 'dd/MM/yyyy',
    monthYearA11yLabel: 'MMMM yyyy',
  },
};

@Component({
  standalone: true,
  selector: 'app-activity-new',
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    LayoutComponent,
  ],
  templateUrl: './activity-new.component.html',
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-CL' },
    { provide: DateAdapter, useClass: MondayFirstDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: ES_DATE_FORMATS },
  ],
})
export class ActivityNewComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private dataService = inject(DataService);

  // Link para volver al perfil del funcionario logueado (por si luego lo usas)
  get perfilLink(): string {
    const id = this.auth.getUserId();
    return id != null ? `/funcionario/perfil/${id}` : '/funcionario/perfil';
  }

  // Catálogos
  tiposActividad = [
    'Taller',
    'Seminario',
    'Voluntariado',
    'Investigación',
    'Deportivo',
    'Cultural',
    'Otro (especificar)',
  ];
  estados = ['Pendiente', 'Realizada'];

  // Mes actual (para MULTI-DÍA)
  private readonly now = new Date();
  private readonly firstDay = new Date(
    this.now.getFullYear(),
    this.now.getMonth(),
    1
  );
  private readonly lastDay = new Date(
    this.now.getFullYear(),
    this.now.getMonth() + 1,
    0
  );

  readonly monthStartISO = this.toISO(this.firstDay);
  readonly monthEndISO = this.toISO(this.lastDay);

  // Feriados 2025 (Chile) -> usados solo en multi-día
  private readonly feriadosISO = new Set<string>([
    '2025-01-01',
    '2025-04-18',
    '2025-04-19',
    '2025-05-01',
    '2025-05-21',
    '2025-06-07',
    '2025-06-20',
    '2025-06-29',
    '2025-07-16',
    '2025-08-15',
    '2025-09-18',
    '2025-09-19',
    '2025-10-12',
    '2025-10-31',
    '2025-11-01',
    '2025-11-16',
    '2025-12-08',
    '2025-12-14',
    '2025-12-25',
  ]);

  // === Form ===
  form = this.fb.group(
    {
      descripcionAct: ['', [Validators.required, Validators.maxLength(500)]],

      // fecha principal sin restricción de mes
      fecha: [new Date(), Validators.required],

      tipo_actividad: [<string>this.tiposActividad[0], Validators.required],
      tipo_actividad_otro: [''], // requerido si se elige “Otro (especificar)”
      estado: [<string>this.estados[0], Validators.required],

      multi: this.fb.group({
        mode: ['none' as MultiMode],
        specificDates: this.fb.array<Date>([]),
        weekly: this.fb.group({
          start: [new Date(), Validators.required],
          end: [new Date(), Validators.required],
          weekdays: this.fb.group<WeekFlags>({
            mon: false,
            tue: false,
            wed: false,
            thu: false,
            fri: false,
            sat: false,
            sun: false,
          }),
        }),
      }),
    },
    { validators: [] }
  );

  constructor() {
    // Validador condicional para “tipo_actividad_otro”
    this.form
      .get('tipo_actividad')!
      .valueChanges.subscribe((val: string | null) => {
        const otroCtrl = this.form.get('tipo_actividad_otro')!;
        if (val === 'Otro (especificar)') {
          otroCtrl.addValidators([
            Validators.required,
            Validators.maxLength(100),
          ]);
        } else {
          otroCtrl.clearValidators();
          otroCtrl.reset('');
        }
        otroCtrl.updateValueAndValidity({ emitEvent: false });
      });

    // Validación específica de la sección multi-día
    this.multi.addValidators(this.validateMultiSection.bind(this));
  }

  // Getters de conveniencia
  get f() {
    return this.form.controls;
  }
  get multi() {
    return this.form.get('multi')!;
  }
  get specificDates(): FormArray {
    return this.multi.get('specificDates') as FormArray;
  }
  get weekly() {
    return this.multi.get('weekly')!;
  }

  // ==== Filtros de calendario ====
  /** FECHA PRINCIPAL: sin restricciones */
  dateFilterMain = (_d: Date | null): boolean => true;

  /** MULTI-DÍA: restringe al mes vigente y NO permite feriados */
  dateFilterMulti = (d: Date | null): boolean => {
    if (!d) return false;
    const iso = this.toISO(d);
    return (
      iso >= this.monthStartISO &&
      iso <= this.monthEndISO &&
      !this.feriadosISO.has(iso)
    );
  };

  // ==== Validación MULTI-DÍA ====
  private validateMultiSection(
    group: AbstractControl
  ): ValidationErrors | null {
    const mode = group.get('mode')?.value as MultiMode;
    if (!mode || mode === 'none') return null;

    let anyError = false;

    const inMonth = (dt: Date | null | undefined) =>
      !!dt &&
      this.toISO(dt) >= this.monthStartISO &&
      this.toISO(dt) <= this.monthEndISO;

    if (mode === 'specific') {
      const fa = group.get('specificDates') as FormArray;
      fa.controls.forEach((c) => {
        const v = c.value as Date | null;
        c.setErrors(null);
        if (!inMonth(v)) {
          c.setErrors({ outOfMonth: true });
          anyError = true;
        } else if (v && this.feriadosISO.has(this.toISO(v))) {
          c.setErrors({ holiday: true });
          anyError = true;
        }
      });
    } else {
      const startCtrl = group.get('weekly.start')!;
      const endCtrl = group.get('weekly.end')!;
      const s = startCtrl.value as Date | null;
      const e = endCtrl.value as Date | null;
      startCtrl.setErrors(null);
      endCtrl.setErrors(null);

      if (!inMonth(s)) {
        startCtrl.setErrors({ outOfMonth: true });
        anyError = true;
      }
      if (!inMonth(e)) {
        endCtrl.setErrors({ outOfMonth: true });
        anyError = true;
      }
      if (s && e && s > e) {
        endCtrl.setErrors({ range: true });
        anyError = true;
      }
    }

    return anyError ? { multiInvalid: true } : null;
  }

  // ==== Utilidades ====
  private toISO(d: Date): string {
    return new Date(
      Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())
    )
      .toISOString()
      .slice(0, 10);
  }

  private *daysBetween(start: Date, end: Date) {
    const cur = new Date(start);
    while (cur <= end) {
      yield new Date(cur);
      cur.setDate(cur.getDate() + 1);
    }
  }

  private selectedWeekdays(): number[] {
    const w = this.weekly.get('weekdays')!.value as WeekFlags;
    const map: [keyof WeekFlags, number][] = [
      ['sun', 0],
      ['mon', 1],
      ['tue', 2],
      ['wed', 3],
      ['thu', 4],
      ['fri', 5],
      ['sat', 6],
    ];
    return map.filter(([k]) => (w as any)[k]).map(([, num]) => num);
  }

  private getDiasSemanaNombres(): string[] {
    const w = this.weekly.get('weekdays')!.value as WeekFlags;
    const map: [keyof WeekFlags, string][] = [
      ['sun', 'Domingo'],
      ['mon', 'Lunes'],
      ['tue', 'Martes'],
      ['wed', 'Miércoles'],
      ['thu', 'Jueves'],
      ['fri', 'Viernes'],
      ['sat', 'Sábado'],
    ];
    return map.filter(([k]) => (w as any)[k]).map(([, nombre]) => nombre);
  }

  // ==== Acciones UI MULTI-DÍA ====
  addSpecificDate(value: Date = new Date()) {
    this.specificDates.push(this.fb.control(value, Validators.required));
  }

  removeSpecificDate(i: number) {
    this.specificDates.removeAt(i);
  }

  // ==== Reset limpio ====
  onReset(): void {
    this.form.reset({
      descripcionAct: '',
      fecha: new Date(),
      tipo_actividad: this.tiposActividad[0],
      tipo_actividad_otro: '',
      estado: this.estados[0],
      multi: {
        mode: 'none' as MultiMode,
        specificDates: [],
        weekly: {
          start: new Date(),
          end: new Date(),
          weekdays: {
            mon: false,
            tue: false,
            wed: false,
            thu: false,
            fri: false,
            sat: false,
            sun: false,
          },
        },
      },
    });

    while (this.specificDates.length > 0) {
      this.specificDates.removeAt(0);
    }
  }

  // ==== Envío (modo-compatible con backend del equipo) ====
  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const base = this.form.value;

    const tipoFinal =
      (base.tipo_actividad === 'Otro (especificar)' && base.tipo_actividad_otro
        ? base.tipo_actividad_otro
        : base.tipo_actividad) ?? '';

    const multi = base.multi!;
    const mode = multi.mode as MultiMode | undefined;

    let payload: CreateActividadPayload;

    if (!mode || mode === 'none') {
      // MODO SIMPLE
      payload = {
        modo: 'simple' as ModoCreacion,
        titulo: tipoFinal,
        descripcion: base.descripcionAct ?? '',
        tipo: tipoFinal,
        estado: base.estado ?? 'Pendiente',
        fecha: this.toISO(base.fecha as Date),
      };
    } else if (mode === 'specific') {
      // MODO FECHAS ESPECÍFICAS
      const fechas_especificas = this.specificDates.controls.map((c) => ({
        fecha: this.toISO(c.value as Date),
      }));

      payload = {
        modo: 'fechas_especificas' as ModoCreacion,
        titulo: tipoFinal,
        descripcion: base.descripcionAct ?? '',
        tipo: tipoFinal,
        estado: base.estado ?? 'Pendiente',
        fechas_especificas,
      };
    } else {
      // MODO REPETICIÓN SEMANAL
      const s = multi.weekly!.start as Date;
      const e = multi.weekly!.end as Date;
      const dias_semana = this.getDiasSemanaNombres();

      payload = {
        modo: 'repeticion_semanal' as ModoCreacion,
        titulo: tipoFinal,
        descripcion: base.descripcionAct ?? '',
        tipo: tipoFinal,
        estado: base.estado ?? 'Pendiente',
        fecha_desde: this.toISO(s),
        fecha_hasta: this.toISO(e),
        dias_semana,
      };
    }

    console.log('Payload que se enviará al backend:', payload);

    this.dataService.crearActividad(payload).subscribe({
      next: () => {
        alert('✔ Actividad registrada correctamente');
        this.onReset();
      },
      error: (err) => {
        console.error('Error al crear actividad:', err);
        alert('❌ Ocurrió un error al registrar la actividad');
      },
    });
  }
}
