export interface TipoActividad {
  id: number;
  nombre: string;
  orden: number;
  activo: boolean;
  requiereDetalle: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTipoActividadDto {
  nombre: string;
  orden?: number;
  activo?: boolean;
  requiereDetalle?: boolean;
}

export type UpdateTipoActividadDto = Partial<CreateTipoActividadDto>;
