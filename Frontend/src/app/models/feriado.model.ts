export type TipoFeriado = 'nacional' | 'regional' | 'institucional';

export interface Feriado {
  id: number;
  fecha: string; // YYYY-MM-DD
  nombre?: string | null;
  tipo: TipoFeriado;
  regionCodigo?: string | null;
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateFeriadoDto {
  fecha: string;
  nombre?: string | null;
  tipo: TipoFeriado;
  regionCodigo?: string | null;
  activo?: boolean;
}

export type UpdateFeriadoDto = Partial<CreateFeriadoDto>;
