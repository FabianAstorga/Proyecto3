export interface BackendUser {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  rol: string; // 'funcionario' | 'secretaria' | 'administrador'
  telefono: string;
  foto_url?: string | null;
  contrasena: string;
}
