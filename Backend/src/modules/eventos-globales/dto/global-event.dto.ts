// src/modules/eventos-globales/dto/global-event.dto.ts
export type DayKey = 'lun' | 'mar' | 'mie' | 'jue' | 'vie';

export class GlobalEventDto {
  dayKey: DayKey;     // 'lun', 'mar', 'mie', 'jue', 'vie'
  blockCode: string;  // "(1 - 2)", "(3 - 4)", etc.
  titulo: string;
  descripcion?: string;
}
