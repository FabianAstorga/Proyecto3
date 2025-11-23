import { Component, Input, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, RouterLink } from "@angular/router";
import { User } from "../../models/user.model";
import { AuthService } from "../../services/auth.service";

export type NavItem = { label: string; link: string };

@Component({
  standalone: true,
  selector: "app-layout",
  imports: [CommonModule, RouterLink],
  templateUrl: "./layout.component.html",
})
export class LayoutComponent implements OnInit {
  // Inputs desde el padre
  @Input() logoutLink = "/";
  @Input() user: User | undefined;
  @Input() navItems: NavItem[] = [];

  isCollapsed = true;
  showMenu = false;

  private _showT?: ReturnType<typeof setTimeout>;
  private _hideT?: ReturnType<typeof setTimeout>;

  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    this.loadUser();
  }

  /** Carga el usuario logueado desde AuthService si no viene del padre */
  private loadUser(): void {
    if (!this.user) {
      const storedUser = this.authService.getUserFromStorage();
      if (!storedUser || !this.authService.isLoggedIn()) {
        this.router.navigate(["/login"]);
        return;
      }
      this.user = storedUser;
    }

    // Solo construye menú si no viene desde el padre
    if (!this.navItems || this.navItems.length === 0) {
      this.buildMenu();
    }
  }

  /** Construye el menú lateral según rol */
  private buildMenu(): void {
    if (!this.user) return;

    const role = this.user.role.toLowerCase();
    const id = this.user.id;

    switch (role) {
      case "funcionario":
        this.navItems = [
          { label: "Inicio perfil", link: `/funcionario/${id}/perfil` },
          {
            label: "Ingresar registro",
            link: `/funcionario/${id}/actividades/nueva`,
          },
          {
            label: "Mi historial",
            link: `/funcionario/${id}/actividades/historial`,
          },
          { label: "Mi horario", link: `/funcionario/${id}/horario` },
        ];
        break;

      case "secretaria":
        this.navItems = [
          { label: "Perfil secretaria", link: `/secretaria/${id}/perfil` },
          {
            label: "Historial funcionarios",
            link: `/secretaria/${id}/actividades/historial`,
          },
          { label: "Mi horario", link: `/secretaria/${id}/horario` },
          {
            label: "Gestionar calendario",
            link: `/secretaria/${id}/calendario`,
          },
        ];
        break;

      case "administrador":
        this.navItems = [
          { label: "Panel de Control", link: `/admin/${id}/perfil` },
          { label: "Gestionar Calendario", link: `/admin/${id}/calendario` },
          {
            label: "Gestionar Funcionarios",
            link: `/admin/${id}/funcionarios`,
          },
          { label: "Gestionar Cargos", link: `/admin/${id}/cargos` },
          { label: "Asignar Cargos", link: `/admin/${id}/asignar` },
        ];
        break;

      default:
        this.navItems = [];
        break;
    }
  }

  // Sidebar hover
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

  onAvatarError(e: Event) {
    (e.target as HTMLImageElement).src = "/avatar-de-usuario.png";
  }

  // Logout
  onLogout() {
    this.authService.logout();
    this.router.navigate([this.logoutLink]); // redirige al login o link pasado
  }
}
