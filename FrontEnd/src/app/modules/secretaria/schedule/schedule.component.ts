import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  LayoutComponent,
  NavItem,
} from '../../../components/layout/layout.component';
import { SECRETARIA_NAV_ITEMS } from '../profile-home/secretaria.nav';

type Block = {
  label: string; // "08:00 - 09:30"
  code: string; // "(1 - 2)"
  isLunch?: boolean;
};

type DayKey = 'lun' | 'mar' | 'mie' | 'jue' | 'vie' | 'sab';
type Cell = { title: string; room?: string; note?: string } | null;

@Component({
  standalone: true,
  selector: 'app-schedule',
  imports: [CommonModule, RouterLink, LayoutComponent],
  templateUrl: './schedule.component.html',
})
export class ScheduleComponent {
  secretariaNavItems = SECRETARIA_NAV_ITEMS;

  // Bloques con formato solicitado
  blocks: Block[] = [
    { label: '08:00 - 09:30', code: '(1 - 2)' },
    { label: '09:40 - 11:10', code: '(3 - 4)' },
    { label: '11:20 - 12:50', code: '(5 - 6)' },
    { label: '13:00 - 14:30', code: '(7 - 8)', isLunch: true }, // Almuerzo
    { label: '14:45 - 16:15', code: '(9 - 10)' },
    { label: '16:20 - 17:50', code: '(11 - 12)' },
    { label: '17:55 - 19:25', code: '(13 - 14)' },
    { label: '19:30 - 21:00', code: '(15 - 16)' },
  ];

  // Días (Lunes a Sábado)
  days: { key: DayKey; label: string }[] = [
    { key: 'lun', label: 'Lunes' },
    { key: 'mar', label: 'Martes' },
    { key: 'mie', label: 'Miércoles' },
    { key: 'jue', label: 'Jueves' },
    { key: 'vie', label: 'Viernes' },
    { key: 'sab', label: 'Sábado' },
  ];

  // Ejemplo de carga (puedes reemplazar con datos del backend)
  // Estructura: schedule[dayKey][blockIndex] = Cell | null
  schedule: Record<DayKey, Cell[]> = {
    lun: [
      { title: 'Cálculo I', room: 'A-201' },
      null,
      null,
      null,
      { title: 'Física', room: 'Lab 3' },
      null,
      null,
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
      null,
      null,
      null,
    ],
    jue: [
      null,
      null,
      null,
      null,
      { title: 'Materiales', room: 'C-301' },
      null,
      null,
      null,
      null,
      null,
    ],
    vie: [
      null,
      null,
      null,
      null,
      null,
      { title: 'Electrónica', room: 'D-102' },
      null,
      null,
      null,
      null,
    ],
    sab: [
      null,
      null,
      null,
      null,
      null,
      null,
      { title: 'Taller Proyecto', room: 'Makerspace' },
      null,
      null,
      null,
    ],
  };
}
