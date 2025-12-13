// src/modules/eventos-globales/dto/global-event-out.dto.ts
export class GlobalEventOutDto {
  id: number;
  fecha: string;      // YYYY-MM-DD
  blockCode: string;
  titulo: string;
  descripcion: string | null;
}
