// src/app/models/horario.models.ts

// Lo que devuelve el backend al consultar el horario de un usuario
export interface BackendHorario {
  id_agenda: number;
  bloque: string;       // Ej: "Lunes (1 - 2)"
  fecha: string;        // "2025-01-01T00:00:00.000Z" o similar
  horaInicio: string;   // ISO o "2025-01-01T08:00:00.000Z" según tu back
  horaFin: string | null;
  esDisponible: boolean;
  titulo: string;
  sala: string | null;
  descripcion: string | null;
}

// Lo que el front envía al backend para guardar / reemplazar horario
export interface SaveHorarioPayload {
  bloque: string;
  fecha: string;            // "YYYY-MM-DD"
  horaInicio: string;       // "HH:mm"
  horaFin?: string | null;  // "HH:mm" o null
  esDisponible?: boolean;
  titulo: string;
  sala?: string | null;
  descripcion?: string | null;
}

export type DayKey = 'lun' | 'mar' | 'mie' | 'jue' | 'vie';

export interface GlobalEventBackend {
  id: number;
  fecha: string;       // "2025-01-01"
  blockCode: string;   // "(1 - 2)", "(3 - 4)", etc.
  titulo: string;
  descripcion: string | null;
}

// Lo que mandamos desde el front al backend
export interface GlobalEventPayload {
  dayKey: DayKey;
  blockCode: string;
  titulo: string;
  descripcion?: string;
}