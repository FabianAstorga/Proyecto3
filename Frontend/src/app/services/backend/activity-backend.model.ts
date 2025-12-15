export type ModoCreacion =
  | 'simple'
  | 'fechas_especificas'
  | 'repeticion_semanal';

export type EstadoActividadBackend =
  | 'Pendiente'
  | 'En Progreso'
  | 'Realizada'
  | 'Cancelada';

export type CreateActividadPayload =
  | {
      modo: 'simple';
      descripcion: string;
      estado?: EstadoActividadBackend;

      // ✅ nuevo
      tipo_actividad_id: number;
      // ✅ opcional (solo si el tipo lo requiere)
      tipoActividadDetalle?: string;

      fecha: string; // yyyy-mm-dd
    }
  | {
      modo: 'fechas_especificas';
      descripcion: string;
      estado?: EstadoActividadBackend;

      tipo_actividad_id: number;
      tipoActividadDetalle?: string;

      fechas_especificas: { fecha: string }[];
    }
  | {
      modo: 'repeticion_semanal';
      descripcion: string;
      estado?: EstadoActividadBackend;

      tipo_actividad_id: number;
      tipoActividadDetalle?: string;

      fecha_desde: string; // yyyy-mm-dd
      fecha_hasta: string; // yyyy-mm-dd
      dias_semana: string[]; // ['Lunes', ...]
    };
