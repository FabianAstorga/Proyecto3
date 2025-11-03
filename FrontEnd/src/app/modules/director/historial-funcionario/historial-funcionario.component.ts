import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  LayoutComponent,
  NavItem,
} from '../../../components/layout/layout.component';
import { DIRECTOR_NAV_ITEMS } from '../profile-home/director.nav';

type Estado = 'Aprobada' | 'Pendiente' | 'Rechazada';

type Activity = {
  fecha: string;   // 'YYYY-MM-DD'
  titulo: string;
  detalle: string;
  estado: Estado;
  userId: number;
};

type User = {
  id: number;
  firstName: string;
  lastName: string;
  role: string;
};

type Combined = Activity & {
  firstName: string;
  lastName: string;
  fullName: string;
  role: string;
};

@Component({
  selector: 'app-historial-funcionario',
  standalone: true,
  imports: [CommonModule, FormsModule, LayoutComponent],
  templateUrl: './historial-funcionario.component.html',
})
export class HistorialFuncionarioComponent implements OnInit {
  // Sidebar / layout
  navItems: NavItem[] = DIRECTOR_NAV_ITEMS;
  logoutLink = '/login';

  loading = true;
  error?: string;

  users: User[] = [];
  activities: Activity[] = [];
  combined: Combined[] = [];

  // Filtros
  selectedUserId: number | null = null;
  selectedEstado: Estado | null = null;
  selectedDate: string | null = null; // 'YYYY-MM-DD'

  // UI dropdowns
  showUserMenu = false;
  showEstadoMenu = false;

  ngOnInit(): void {
    try {
      this.users = JSON.parse(localStorage.getItem('usuarios') || '[]') as User[];
      this.activities = JSON.parse(localStorage.getItem('actividades') || '[]') as Activity[];

      // Ordenamos usuarios por nombre
      this.users = this.users.slice().sort((a, b) =>
        `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
      );

      const byId = new Map(this.users.map(u => [u.id, u]));

      // Combinamos actividades con datos de usuario
      this.combined = this.activities
        .map(a => {
          const u = byId.get(a.userId);
          const firstName = u?.firstName ?? '—';
          const lastName = u?.lastName ?? '';
          const role = u?.role ?? '—';
          return {
            ...a,
            firstName,
            lastName,
            fullName: `${firstName} ${lastName}`.trim(),
            role,
          } as Combined;
        })
        .sort((a, b) => (a.fecha < b.fecha ? 1 : a.fecha > b.fecha ? -1 : 0));
    } catch (e) {
      console.error(e);
      this.error = 'Error cargando historial';
    } finally {
      this.loading = false;
    }
  }

  // ===== Helpers UI =====
  statusPillClass(est: Estado): string {
    switch (est) {
      case 'Aprobada':
        return 'bg-emerald-500/10 text-emerald-700 border border-emerald-300';
      case 'Pendiente':
        return 'bg-amber-500/10 text-amber-700 border border-amber-300';
      case 'Rechazada':
        return 'bg-red-500/10 text-red-700 border border-red-300';
    }
  }

  get estados(): Estado[] {
    return ['Aprobada', 'Pendiente', 'Rechazada'];
  }

  get selectedUserLabel(): string {
    if (this.selectedUserId === null) return 'Todos';
    const u = this.users.find(x => x.id === this.selectedUserId);
    return u ? `${u.firstName} ${u.lastName}` : 'Desconocido';
  }

  get selectedEstadoLabel(): string {
    return this.selectedEstado ?? 'Todos';
  }

  clearFilters(): void {
    this.selectedUserId = null;
    this.selectedEstado = null;
    this.selectedDate = null;
  }

  // ===== Filtrado previo al agrupado =====
  get filteredCombined(): Combined[] {
    return this.combined.filter(a => {
      const byUser = this.selectedUserId === null || a.userId === this.selectedUserId;
      const byEstado = this.selectedEstado === null || a.estado === this.selectedEstado;
      const byDate = !this.selectedDate || a.fecha === this.selectedDate;
      return byUser && byEstado && byDate;
    });
  }

  // ===== Agrupado por fecha =====
  get groupedFiltered(): Array<{ fecha: string; items: Combined[] }> {
    const arr = this.filteredCombined;
    const map = new Map<string, Combined[]>();

    for (const it of arr) {
      const list = map.get(it.fecha);
      if (list) list.push(it);
      else map.set(it.fecha, [it]);
    }

    return Array.from(map.entries())
      .map(([fecha, items]) => ({ fecha, items }))
      .sort((a, b) => (a.fecha < b.fecha ? 1 : a.fecha > b.fecha ? -1 : 0));
  }

  // ===== PDF simulado por fecha =====
  downloadByDate(fechaISO: string): void {
    console.log('Descargar PDF para fecha:', fechaISO);
    alert(`Descargar PDF de actividades del ${new Date(fechaISO).toLocaleDateString()}`);
  }

  // ===== Dropdowns =====
  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
    if (this.showUserMenu) this.showEstadoMenu = false;
  }
  toggleEstadoMenu(): void {
    this.showEstadoMenu = !this.showEstadoMenu;
    if (this.showEstadoMenu) this.showUserMenu = false;
  }
  selectUser(id: number | null): void {
    this.selectedUserId = id;
    this.showUserMenu = false;
  }
  selectEstado(e: Estado | null): void {
    this.selectedEstado = e;
    this.showEstadoMenu = false;
  }

  // Cerrar menús al hacer click fuera
  @HostListener('document:click', ['$event'])
  onDocClick(ev: MouseEvent) {
    const target = ev.target as HTMLElement;
    const inMenuOrButton = target.closest('[data-menu]') || target.closest('[data-menu-btn]');
    if (!inMenuOrButton) {
      this.showUserMenu = false;
      this.showEstadoMenu = false;
    }
  }
}
