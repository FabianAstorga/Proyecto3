export interface Activity {
  id: number;
  titulo: string;
  detalle: string;
  fecha: string;
  tipo: string;
  horas: number;
  estado: 'Aprobada' | 'Pendiente' | 'Rechazada';
  userId: number | null;
  userName: string;
}
