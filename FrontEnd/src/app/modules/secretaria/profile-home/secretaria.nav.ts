import { NavItem } from '../../../shared/layout/layout.component';

export const SECRETARIA_NAV_ITEMS: NavItem[] = [
  { label: 'Inicio perfil', link: '/secretaria/perfil' },
  { label: 'Agregar registro', link: '/secretaria/actividades/nueva' },
  { label: 'Horario', link: '/secretaria/horario' },
  { label: 'Historial', link: '/secretaria/actividades/historial' },
  { label: 'Gestión Horarios', link: '/secretaria/gestiona-horario' },
  { label: 'Gestión Funcionarios', link: '/secretaria/gestionar-funcionario' },
  { label: 'Gestión Tótem', link: '/secretaria/gestionar-totem' },
];
