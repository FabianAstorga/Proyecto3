export class CreateHorarioDto {
  bloque: string;
  fecha: string;          // "2025-01-01"
  horaInicio: string;     // "08:00"
  horaFin?: string | null;
  esDisponible?: boolean;
  titulo: string;
  sala?: string | null;
  descripcion?: string | null;
}
