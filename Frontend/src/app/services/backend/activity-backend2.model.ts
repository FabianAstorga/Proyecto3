import { BackendUser } from "./user-backend.model";

export interface BackendActividad {
  id_actividad: number;
  titulo: string;
  descripcion: string;
  fecha: string; // 'YYYY-MM-DD'
  tipo: string;
  estado: string; // 'Pendiente' | 'En Progreso' | 'Realizada' | 'Cancelada'
  esRepetitiva: boolean;
  usuario: BackendUser | null;
  informe: any | null;
}
