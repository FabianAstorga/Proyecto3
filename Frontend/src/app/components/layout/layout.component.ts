import { Component, Input, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, RouterLink, RouterLinkActive } from "@angular/router";
import { User } from "../../models/user.model";
import { AuthService } from "../../services/auth.service";

export type NavIcon =
  | "home"
  | "plus"
  | "chart"
  | "calendar"
  | "users"
  | "docs"
  | "clock"
  | "settings"
  | "flag";

export type NavItem = {
  label: string;
  link: string;
  icon: NavIcon;
};

@Component({
  standalone: true,
  selector: "app-layout",
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: "./layout.component.html",
})
export class LayoutComponent implements OnInit {
  @Input() logoutLink = "/";
  @Input() user: User | undefined;
  @Input() navItems: NavItem[] = [];

  isCollapsed = true;
  showMenu = false;

  currentTheme: "light" | "dark" = "light";

  private _showT?: ReturnType<typeof setTimeout>;
  private _hideT?: ReturnType<typeof setTimeout>;

  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    this.initTheme();
    this.loadUser();
  }

  private loadUser(): void {
    if (!this.user) {
      const storedUser = this.authService.getUserFromStorage();
      if (!storedUser || !this.authService.isLoggedIn()) {
        this.router.navigate(["/login"]);
        return;
      }
      this.user = storedUser;
    }

    if (!this.navItems || this.navItems.length === 0) {
      this.buildMenu();
    }
  }

  private buildMenu(): void {
    if (!this.user) return;

    const role = this.user.role.toLowerCase();
    const id = this.user.id;

    switch (role) {
      case "funcionario":
        this.navItems = [
          { label: "Inicio perfil", link: `/funcionario/${id}/perfil`, icon: "home" },
          { label: "Ingresar registro", link: `/funcionario/${id}/actividades/nueva`, icon: "plus" },
          { label: "Pendientes", link: `/funcionario/${id}/actividades/pendientes`, icon: "clock" },
          { label: "Mi historial", link: `/funcionario/${id}/actividades/historial`, icon: "chart" },
          { label: "Mi horario", link: `/funcionario/${id}/horario`, icon: "calendar" },
        ];
        break;

      case "secretaria":
        this.navItems = [
          { label: "Perfil secretaria", link: `/secretaria/${id}/perfil`, icon: "home" },
          { label: "Historial funcionarios", link: `/secretaria/${id}/actividades/historial`, icon: "docs" },
          { label: "Mi horario", link: `/secretaria/${id}/horario`, icon: "calendar" },
          { label: "Gestionar calendario", link: `/secretaria/${id}/calendario`, icon: "calendar" },
        ];
        break;

      case "administrador":
        this.navItems = [
          { label: "Panel de Control", link: `/admin/${id}/perfil`, icon: "home" },
          { label: "Gestionar Calendario", link: `/admin/${id}/calendario`, icon: "calendar" },
          { label: "Gestionar Funcionarios", link: `/admin/${id}/funcionarios`, icon: "users" },
          { label: "Gestionar Cargos", link: `/admin/${id}/cargos`, icon: "docs" },
          { label: "Asignar Cargos", link: `/admin/${id}/asignar`, icon: "plus" },

          /* ✅ NUEVOS */
          { label: "Tipos de Actividad", link: `/admin/${id}/tipos-actividad`, icon: "settings" },
          { label: "Gestionar Feriados", link: `/admin/${id}/feriados`, icon: "flag" },
        ];
        break;

      default:
        this.navItems = [];
        break;
    }
  }

  private initTheme(): void {
    const stored =
      (localStorage.getItem("theme") as "light" | "dark" | null) ?? null;
    const prefersDark =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-color-scheme: dark)").matches;

    this.currentTheme = stored ?? (prefersDark ? "dark" : "light");

    const html = document.documentElement;
    html.classList.toggle("dark", this.currentTheme === "dark");
  }

  toggleTheme(): void {
    this.currentTheme = this.currentTheme === "light" ? "dark" : "light";
    const html = document.documentElement;
    html.classList.toggle("dark", this.currentTheme === "dark");
    localStorage.setItem("theme", this.currentTheme);
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

  onLogout() {
    this.authService.logout();
    this.router.navigate([this.logoutLink]);
  }
}
