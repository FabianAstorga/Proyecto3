import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

export type NavItem = { label: string; link: string };

@Component({
  standalone: true,
  selector: 'app-layout',
  imports: [CommonModule, RouterLink],
  templateUrl: './layout.component.html',
})
export class LayoutComponent implements OnInit {
  /** Ítems del menú lateral (se sobreescriben según rol) */
  @Input() navItems: NavItem[] = [];

  /** A dónde apunta el botón de cerrar sesión */
  @Input() logoutLink = '/';

  /** --- lógica de sidebar con transición suave --- */
  isCollapsed = true; // ancho (w-14 / w-72)
  showMenu = false;   // aparición de contenido (fade/slide)

  private _showT?: any;
  private _hideT?: any;

  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    this.buildMenu();
  }

  /** Construye el menú lateral según rol + id del usuario logueado */
  private buildMenu(): void {
    const role = this.authService.getUserRole()?.toLowerCase();
    const id = this.authService.getUserId();

    if (!role || !id) {
      // Sin sesión válida: menú vacío
      this.navItems = [];
      return;
    }

    switch (role) {
      // ================= FUNCIONARIO =================
      case 'funcionario':
        this.navItems = [
          { label: 'Inicio perfil',      link: `/funcionario/${id}/perfil` },
          { label: 'Ingresar registro',  link: `/funcionario/${id}/actividades/nueva` },
          { label: 'Mi historial',       link: `/funcionario/${id}/actividades/historial` },
          { label: 'Mi horario',         link: `/funcionario/${id}/horario` },
        ];
        break;

      // ================= SECRETARÍA =================
      case 'secretaria':
        this.navItems = [
          { label: 'Perfil secretaria',      link: `/secretaria/${id}/perfil` },
          { label: 'Historial funcionarios', link: `/secretaria/${id}/actividades/historial` },
          { label: 'Mi horario',             link: `/secretaria/${id}/horario` },
          { label: 'Gestionar calendario',   link: `/secretaria/${id}/calendario` },
        ];
        break;

      // ================= ADMINISTRADOR =================
      case 'administrador':
        this.navItems = [
          { label: 'Panel administrador',    link: `/admin/${id}/perfil` },
          { label: 'Gestionar calendario',   link: `/admin/${id}/calendario` },
          { label: 'Gestionar funcionarios', link: `/admin/${id}/funcionarios` },
        ];
        break;

      // Rol inesperado → sin menú
      default:
        this.navItems = [];
        break;
    }
  }

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

  // Cierre de sesión real
  onLogout() {
    this.authService.logout();
  }
}
