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

type TipoActividadLite = {
  id: number;
  nombre: string;
  requiereDetalle: boolean;
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

  // Catálogos (desde backend)
  tiposActividad: TipoActividadLite[] = [];

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

  // Feriados (desde backend) -> usados solo en multi-día
  private feriadosISO = new Set<string>();

  // === Form ===
  form = this.fb.group(
    {
      descripcionAct: ['', [Validators.required, Validators.maxLength(500)]],

      // fecha principal sin restricción de mes
      fecha: [new Date(), Validators.required],

      // ✅ ahora guardamos el ID del tipo
      tipo_actividad_id: [null as number | null, Validators.required],

      // ✅ detalle libre solo si el tipo lo requiere
      tipoActividadDetalle: [''],

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
    // 1) cargar catálogos desde backend
    this.loadTiposActividad();
    this.loadFeriadosMesActual();

    // 2) Validador condicional según requiereDetalle del tipo seleccionado (por ID)
    this.form.get('tipo_actividad_id')!.valueChanges.subscribe((val: number | null) => {
      const detalleCtrl = this.form.get('tipoActividadDetalle')!;
      const tipo = this.tiposActividad.find((t) => t.id === val);
      const requiere = !!tipo?.requiereDetalle;

      if (requiere) {
        detalleCtrl.addValidators([Validators.required, Validators.maxLength(100)]);
      } else {
        detalleCtrl.clearValidators();
        detalleCtrl.reset('');
      }
      detalleCtrl.updateValueAndValidity({ emitEvent: false });
    });

    // 3) Validación específica de la sección multi-día
    this.multi.addValidators(this.validateMultiSection.bind(this));
  }

  // --------- Getter para el template (mostrar input detalle) ----------
  get requiereDetalleSeleccionado(): boolean {
    const id = this.form.get('tipo_actividad_id')?.value as number | null;
    if (!id) return false;
    return this.tiposActividad.find((t) => t.id === id)?.requiereDetalle ?? false;
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
  private validateMultiSection(group: AbstractControl): ValidationErrors | null {
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
    return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
      .toISOString()
      .slice(0, 10);
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

  // ==== Carga catálogos desde backend ====
  private loadTiposActividad(): void {
    this.dataService.getTiposActividad(true).subscribe({
      next: (list: any[]) => {
        const ordenados = (list ?? [])
          .map((x) => ({
            id: Number(x.id),
            nombre: String(x.nombre ?? '').trim(),
            orden: Number(x.orden ?? 0),
            requiereDetalle: !!x.requiereDetalle,
            activo: !!x.activo,
          }))
          .filter((x) => x.id > 0 && x.nombre && x.activo)
          .sort((a, b) => a.orden - b.orden);

        this.tiposActividad = ordenados.map((x) => ({
          id: x.id,
          nombre: x.nombre,
          requiereDetalle: x.requiereDetalle,
        }));

        // setear valor inicial válido
        const actual = this.form.get('tipo_actividad_id')!.value as number | null;
        const first = this.tiposActividad[0]?.id ?? null;

        if (!actual || !this.tiposActividad.some((t) => t.id === actual)) {
          if (first) this.form.get('tipo_actividad_id')!.setValue(first, { emitEvent: true });
        } else {
          // fuerza recalcular validación detalle
          this.form.get('tipo_actividad_id')!.setValue(actual, { emitEvent: true });
        }
      },
      error: (err) => {
        console.error('Error cargando tipos de actividad:', err);
        // fallback mínimo para no romper
        this.tiposActividad = [{ id: 1, nombre: 'Taller', requiereDetalle: false }];
        this.form.get('tipo_actividad_id')!.setValue(1, { emitEvent: true });
      },
    });
  }

  private loadFeriadosMesActual(): void {
    this.dataService.getFeriados(this.monthStartISO, this.monthEndISO, true).subscribe({
      next: (list: any[]) => {
        const set = new Set<string>();
        (list ?? []).forEach((x) => {
          const fecha = String(x.fecha ?? '').slice(0, 10);
          if (fecha) set.add(fecha);
        });
        this.feriadosISO = set;

        // revalida multi si ya habían fechas seleccionadas
        this.multi.updateValueAndValidity({ emitEvent: false });
      },
      error: (err) => {
        console.error('Error cargando feriados:', err);
        this.feriadosISO = new Set<string>();
      },
    });
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
      tipo_actividad_id: this.tiposActividad[0]?.id ?? null,
      tipoActividadDetalle: '',
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

  // ==== Envío (alineado con backend nuevo) ====
  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const base = this.form.value;

    const tipoId = base.tipo_actividad_id as number;
    const requiere = this.requiereDetalleSeleccionado;

    const detalle =
      requiere && base.tipoActividadDetalle
        ? String(base.tipoActividadDetalle).trim()
        : undefined;

    const multi = base.multi!;
    const mode = multi.mode as MultiMode | undefined;

    let payload: CreateActividadPayload;

    if (!mode || mode === 'none') {
      payload = {
        modo: 'simple',
        descripcion: base.descripcionAct ?? '',
        estado: (base.estado as any) ?? 'Pendiente',
        tipo_actividad_id: tipoId,
        tipoActividadDetalle: detalle,
        fecha: this.toISO(base.fecha as Date),
      };
    } else if (mode === 'specific') {
      const fechas_especificas = this.specificDates.controls.map((c) => ({
        fecha: this.toISO(c.value as Date),
      }));

      payload = {
        modo: 'fechas_especificas',
        descripcion: base.descripcionAct ?? '',
        estado: (base.estado as any) ?? 'Pendiente',
        tipo_actividad_id: tipoId,
        tipoActividadDetalle: detalle,
        fechas_especificas,
      };
    } else {
      const s = multi.weekly!.start as Date;
      const e = multi.weekly!.end as Date;
      const dias_semana = this.getDiasSemanaNombres();

      payload = {
        modo: 'repeticion_semanal',
        descripcion: base.descripcionAct ?? '',
        estado: (base.estado as any) ?? 'Pendiente',
        tipo_actividad_id: tipoId,
        tipoActividadDetalle: detalle,
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
