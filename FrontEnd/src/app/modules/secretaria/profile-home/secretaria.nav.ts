import { NavItem } from '../../../components/layout/layout.component';

export const SECRETARIA_NAV_ITEMS: NavItem[] = [
  { label: 'Inicio perfil', link: '/secretaria/perfil' },
  { label: 'Agregar registro', link: '/secretaria/actividades/nueva' },
  { label: 'Horario', link: '/secretaria/horario' },
  { label: 'Historial', link: '/secretaria/actividades/historial' },
  { label: 'Gestión Calendario', link: '/secretaria/gestionar-calendario' },
  { label: 'Gestión Funcionarios', link: '/secretaria/gestionar-funcionario' },
  { label: 'Gestión Salas', link: '/secretaria/gestionar-salas' },
];
