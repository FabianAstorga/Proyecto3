import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms'; // ✅ Import necesario para ngModel

import { LayoutComponent } from '../../../components/layout/layout.component';
import { SECRETARIA_NAV_ITEMS } from '../profile-home/secretaria.nav';

type Estado = 'Aprobada' | 'Pendiente' | 'Rechazada';

type Activity = {
  fecha: string;   // 'YYYY-MM-DD'
  titulo: string;
  detalle: string;
  estado: Estado;
  horas: number;
  userId: number;
};

type User = {
  id: number;
  firstName: string;
  lastName: string;
  role: string;
};

type ViewMode = 'fecha' | 'funcionarioMes';

@Component({
  standalone: true,
  selector: 'app-activities-history',
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule, // ✅ agregado
    LayoutComponent
  ],
  templateUrl: './activities-history.component.html',
})
export class ActivitiesHistoryComponent implements OnInit {
  private http = inject(HttpClient);

  // Mantiene el patrón del layout de Secretaría
  secretariaNavItems = SECRETARIA_NAV_ITEMS;

  loading = true;
  error?: string;

  // Vista seleccionada
  mode: ViewMode = 'funcionarioMes'; // Por defecto según lo que pidió César

  // Lista combinada y ordenada por fecha desc
  combined: Array<Activity & { fullName: string; role: string }> = [];

  // Agrupado: Funcionario -> Mes -> Items
  grouped: Array<{
    fullName: string;
    role: string;
    months: Array<{ key: string; label: string; items: Activity[] }>;
  }> = [];

  // Conteo para activar scroll del historial “antiguo”
  get totalRows(): number {
    return this.combined.length;
  }

  ngOnInit(): void {
    Promise.all([
      this.http.get<User[]>('/assets/data/users.json').toPromise(),
      this.http.get<Activity[]>('/assets/data/activities.json').toPromise(),
    ])
      .then(([users, acts]) => {
        if (!users || !acts) throw new Error('Datos incompletos');

        const byId = new Map(users.map(u => [u.id, u]));
        // flat list
        this.combined = acts
          .map(a => {
            const u = byId.get(a.userId);
            return {
              ...a,
              fullName: u ? `${u.firstName} ${u.lastName}` : 'Desconocido',
              role: u?.role ?? '—',
            };
          })
          .sort((a, b) => (a.fecha < b.fecha ? 1 : a.fecha > b.fecha ? -1 : 0));

        // grouped by Funcionario -> Mes
        const byUser = new Map<string, { fullName: string; role: string; months: Map<string, Activity[]> }>();
        for (const row of this.combined) {
          const userKey = `${row.fullName}||${row.role}`;
          if (!byUser.has(userKey)) {
            byUser.set(userKey, { fullName: row.fullName, role: row.role, months: new Map() });
          }
          const cont = byUser.get(userKey)!;
          const mKey = row.fecha.slice(0, 7); // YYYY-MM
          if (!cont.months.has(mKey)) cont.months.set(mKey, []);
          cont.months.get(mKey)!.push(row);
        }

        // ordenar meses desc y actividades desc
        this.grouped = Array.from(byUser.values()).map(u => {
          const monthEntries = Array.from(u.months.entries())
            .sort((a, b) => (a[0] < b[0] ? 1 : a[0] > b[0] ? -1 : 0))
            .map(([key, items]) => ({
              key,
              label: this.monthLabel(key),
              items: items.sort((a, b) => (a.fecha < b.fecha ? 1 : a.fecha > b.fecha ? -1 : 0)),
            }));
          return { fullName: u.fullName, role: u.role, months: monthEntries };
        })
        // ordenar funcionarios alfabéticamente
        .sort((a, b) => a.fullName.localeCompare(b.fullName));
      })
      .catch(err => {
        console.error(err);
        this.error = 'Error cargando historial';
      })
      .finally(() => (this.loading = false));
  }

  // Etiqueta mes en español: “octubre 2025”
  private monthLabel(yyyyMm: string): string {
    const [y, m] = yyyyMm.split('-').map(Number);
    const dt = new Date(Date.UTC(y, (m - 1), 1));
    const fmt = new Intl.DateTimeFormat('es-CL', { month: 'long', year: 'numeric', timeZone: 'UTC' });
    const s = fmt.format(dt);
    // capitalizar primera letra
    return s.charAt(0).toLowerCase() === s.charAt(0)
      ? s.charAt(0).toUpperCase() + s.slice(1)
      : s;
  }

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
}
