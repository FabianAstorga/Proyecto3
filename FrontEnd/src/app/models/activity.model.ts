export interface Activity {
  fecha: string;
  titulo: string;
  detalle: string;
  estado: 'Aprobada' | 'Pendiente' | 'Rechazada';
  horas: number;
  userId: number;
}
