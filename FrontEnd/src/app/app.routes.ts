import { Routes } from '@angular/router';
import { AuthGuard } from './services/auth.guard'; // ajusta la ruta si tu guard está en otra carpeta

export const routes: Routes = [
  // ============================
  // Home público
  // ============================
  {
    path: '',
    loadComponent: () =>
      import('./modules/home/home.component').then((m) => m.HomeComponent),
  },

  // ============================
  // Área FUNCIONARIO
  // ============================
  {
    path: 'funcionario',
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    data: { roles: ['Funcionario'] },
    children: [
      // Perfil (usa componentes globales)
      {
        path: 'perfil',
        loadComponent: () =>
          import('./modules/profile-home/profile-home.component').then(
            (m) => m.ProfileHomeComponent
          ),
      },
      {
        path: 'perfil/:id',
        loadComponent: () =>
          import('./modules/profile-home/profile-home.component').then(
            (m) => m.ProfileHomeComponent
          ),
      },

      // Horario común
      {
        path: 'horario',
        loadComponent: () =>
          import('./modules/schedule/schedule.component').then(
            (m) => m.ScheduleComponent
          ),
      },

      // Actividades (historial + nueva)
      {
        path: 'actividades',
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'historial' },
          {
            path: 'historial',
            loadComponent: () =>
              import(
                './modules/activities-history/activities-history.component'
              ).then((m) => m.ActivitiesHistoryComponent),
          },
          {
            path: 'nueva',
            loadComponent: () =>
              import('./modules/activity-new/activity-new.component').then(
                (m) => m.ActivityNewComponent
              ),
          },
        ],
      },

      // Default /funcionario -> perfil
      { path: '', pathMatch: 'full', redirectTo: 'perfil' },
    ],
  },

  // ============================
  // Área SECRETARÍA (usa los mismos módulos comunes)
  // ============================
  {
    path: 'secretaria',
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    data: { roles: ['Secretaria', 'Administrador'] }, // si quieres que el admin entre por aquí
    children: [
      {
        path: 'perfil',
        loadComponent: () =>
          import('./modules/profile-home/profile-home.component').then(
            (m) => m.ProfileHomeComponent
          ),
      },
      {
        path: 'perfil/:id',
        loadComponent: () =>
          import('./modules/profile-home/profile-home.component').then(
            (m) => m.ProfileHomeComponent
          ),
      },

      // Horario común
      {
        path: 'horario',
        loadComponent: () =>
          import('./modules/schedule/schedule.component').then(
            (m) => m.ScheduleComponent
          ),
      },

      // Actividades (solo historial para secretaria)
      {
        path: 'actividades',
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'historial' },
          {
            path: 'historial',
            loadComponent: () =>
              import(
                './modules/activities-history/activities-history.component'
              ).then((m) => m.ActivitiesHistoryComponent),
          },
        ],
      },

      // Vistas de gestión propias de secretaria/admin
      {
        path: 'gestionar-funcionario',
        loadComponent: () =>
          import(
            './modules/gestionar-funcionario/gestionar-funcionario.component'
          ).then((m) => m.GestionarFuncionarioComponent),
      },
      {
        path: 'gestionar-calendario',
        loadComponent: () =>
          import(
            './modules/gestionar-calendario/gestionar-calendario.component'
          ).then((m) => m.GestionarCalendarioComponent),
      },

      // Default /secretaria -> perfil
      { path: '', pathMatch: 'full', redirectTo: 'perfil' },
    ],
  },

  // ============================
  // Alias simple (si lo necesitas)
  // ============================
  {
    path: 'actividad',
    redirectTo: '/secretaria/actividades/historial',
    pathMatch: 'full',
  },

  // ============================
  // Wildcard
  // ============================
  { path: '**', redirectTo: '' },
];
