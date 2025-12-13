// src/app/models/global-event.model.ts
import { DayKey } from './horario.models';

// Lo que viene del backend (GET)
export interface GlobalEvent {
  id: number;
  fecha: string;          // YYYY-MM-DD
  blockCode: string;
  titulo: string;
  descripcion: string | null;
}

// Lo que envías al backend (PUT)
export interface GlobalEventPayload {
  dayKey: DayKey;
  blockCode: string;
  titulo: string;
  descripcion?: string;
}
