import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

export type NavItem = { label: string; link: string };

@Component({
  standalone: true,
  selector: 'app-layout',
  imports: [CommonModule, RouterLink],
  templateUrl: './layout.component.html',
})
export class LayoutComponent {
  /** Título de la hotbar (ej: "Académico") */
  @Input() title = 'Académico';

  /** Ítems del menú lateral */
  @Input() navItems: NavItem[] = [
    { label: 'Inicio perfil', link: '/perfil' },
    { label: 'Agregar registro', link: '/actividades/nueva' },
    { label: 'Horario', link: '/horario' },
    { label: 'Historial', link: '/actividades/historial' },
  ];

  /** A dónde apunta el botón de cerrar sesión */
  @Input() logoutLink = '/login';

  /** --- lógica de sidebar con transición suave --- */
  isCollapsed = true; // ancho (w-14 / w-72)
  showMenu = false; // aparición de contenido (fade/slide)

  private _showT?: any;
  private _hideT?: any;

  onEnterSidebar() {
    this.isCollapsed = false;
    clearTimeout(this._hideT);
    this._showT = setTimeout(() => (this.showMenu = true), 180);
  }

  onLeaveSidebar() {
    this.showMenu = false;
    clearTimeout(this._showT);
    this._hideT = setTimeout(() => (this.isCollapsed = true), 180);
  }
}
