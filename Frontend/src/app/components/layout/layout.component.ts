import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

export type NavIcon = 'home' | 'plus' | 'chart' | 'calendar' | 'users' | 'docs';

export type NavItem = {
  label: string;
  link: string;
  icon: NavIcon;
};

@Component({
  standalone: true,
  selector: 'app-layout',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './layout.component.html',
})
export class LayoutComponent implements OnInit {
  /** Ítems del menú lateral (se sobreescriben según rol) */
  @Input() navItems: NavItem[] = [];

  /** A dónde apunta el botón de cerrar sesión */
  @Input() logoutLink = '/';

  /** --- lógica de sidebar con transición suave --- */
  isCollapsed = true; // ancho (w-20 / w-72)
  showMenu = false; // aparición de contenido (fade/slide)

  /** Tema actual */
  currentTheme: 'light' | 'dark' = 'light';

  private _showT?: any;
  private _hideT?: any;

  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    this.initTheme();
    this.buildMenu();
  }

  /** Inicializa el tema desde localStorage o media query */
  private initTheme(): void {
    const stored = (localStorage.getItem('theme') as 'light' | 'dark' | null) ?? null;
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;

    this.currentTheme = stored ?? (prefersDark ? 'dark' : 'light');

    const html = document.documentElement;
    html.classList.toggle('dark', this.currentTheme === 'dark');
  }

  toggleTheme(): void {
    this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    const html = document.documentElement;
    html.classList.toggle('dark', this.currentTheme === 'dark');
    localStorage.setItem('theme', this.currentTheme);
  }

  /** Construye el menú lateral según rol + id del usuario logueado */
  private buildMenu(): void {
    const role = this.authService.getUserRole()?.toLowerCase();
    const id = this.authService.getUserId();

    if (!role || !id) {
      this.navItems = [];
      return;
    }

    switch (role) {
      // ================= FUNCIONARIO =================
      case 'funcionario':
        this.navItems = [
          { label: 'Inicio perfil', link: `/funcionario/${id}/perfil`, icon: 'home' },
          { label: 'Ingresar registro', link: `/funcionario/${id}/actividades/nueva`, icon: 'plus' },
          { label: 'Mi historial', link: `/funcionario/${id}/actividades/historial`, icon: 'chart' },
          { label: 'Mi horario', link: `/funcionario/${id}/horario`, icon: 'calendar' },
        ];
        break;

      // ================= SECRETARÍA =================
      case 'secretaria':
        this.navItems = [
          { label: 'Perfil secretaria', link: `/secretaria/${id}/perfil`, icon: 'home' },
          { label: 'Historial funcionarios', link: `/secretaria/${id}/actividades/historial`, icon: 'docs' },
          { label: 'Mi horario', link: `/secretaria/${id}/horario`, icon: 'calendar' },
          { label: 'Gestionar calendario', link: `/secretaria/${id}/calendario`, icon: 'calendar' },
        ];
        break;

      // ================= ADMINISTRADOR =================
      case 'administrador':
        this.navItems = [
          { label: 'Panel administrador', link: `/admin/${id}/perfil`, icon: 'home' },
          { label: 'Gestionar calendario', link: `/admin/${id}/calendario`, icon: 'calendar' },
          { label: 'Gestionar funcionarios', link: `/admin/${id}/funcionarios`, icon: 'users' },
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
