import { NavItem } from '../../../components/layout/layout.component';

export const DIRECTOR_NAV_ITEMS: NavItem[] = [
  { label: 'Inicio perfil',          link: '/director/perfil' },              // sin :id, como quieres
  { label: 'Historial Funcionarios', link: '/director/actividades/historial' },
  { label: 'Calendario',             link: '/director/horario' },             // asegúrate de tener esta ruta
];
