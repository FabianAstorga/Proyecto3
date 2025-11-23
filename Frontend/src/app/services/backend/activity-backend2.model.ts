import { BackendUser } from "./user-backend.model";

export interface BackendActividad {
  id_actividad: number;
  titulo: string;
  descripcion: string;
  fecha: string; // 'YYYY-MM-DD'
  tipo: string;
  estado: boolean; // true / false
  esRepetitiva: boolean;
  usuario: BackendUser | null; // puede venir null si no hay usuario
  informe: any | null;
}
