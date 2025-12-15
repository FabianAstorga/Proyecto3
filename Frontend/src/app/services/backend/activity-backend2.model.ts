export interface BackendActividad {
  id_actividad: number;
  descripcion: string | null;
  fecha: string; // 'YYYY-MM-DD' o ISO
  estado: string; // 'Pendiente' | 'Realizada' | etc.
  esRepetitiva: boolean;

  // Nuevo
  tipoActividadDetalle?: string | null;

  // puede venir como relación (si agregaste relations en backend)
  tipoActividad?: {
    id: number;
    nombre: string;
    requiereDetalle?: boolean;
    activo?: boolean;
  } | null;

  // o puede venir como FK plano (según tu entidad/serializer)
  tipo_actividad_id?: number;

  usuario?: {
    id: number;
    nombre: string;
    apellido: string;
  } | null;
}
