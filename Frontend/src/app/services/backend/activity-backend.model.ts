// payload ejemplo para crear actividad
export interface CreateActividadPayload {
  titulo: string;
  descripcion: string;
  fecha: string; // 'YYYY-MM-DD'
  tipo: string;
  estado: boolean; // o number, según tu DTO
  esRepetitiva: boolean;
}
