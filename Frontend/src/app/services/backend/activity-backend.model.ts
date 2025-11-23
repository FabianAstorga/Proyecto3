export type ModoCreacion = 'simple' | 'fechas_especificas' | 'repeticion_semanal';

export interface CreateActividadPayload {
  modo: ModoCreacion;
  titulo: string;
  descripcion: string;
  tipo: string;
  estado?: string; // 'Pendiente' | 'En Progreso' | 'Realizada' | 'Cancelada'
  
  // Para modo 'simple'
  fecha?: string; // 'YYYY-MM-DD'
  
  // Para modo 'fechas_especificas'
  fechas_especificas?: Array<{ fecha: string }>;
  
  // Para modo 'repeticion_semanal'
  fecha_desde?: string;
  fecha_hasta?: string;
  dias_semana?: string[]; // ['Lunes', 'Martes', etc.]
}
