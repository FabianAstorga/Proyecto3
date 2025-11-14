import { Routes } from '@angular/router';

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
    children: [
      // Perfil sin id (usa usuario logueado) y con id (perfil específico)
      {
        path: 'perfil',
        loadComponent: () =>
          import('./modules/profile-home/profile-home.component')
            .then((m) => m.ProfileHomeComponent),
      },
      {
        path: 'perfil/:id',
        loadComponent: () =>
          import('./modules/profile-home/profile-home.component')
            .then((m) => m.ProfileHomeComponent),
      },

      // Horario
      {
        path: 'horario',
        loadComponent: () =>
          import('./modules/schedule/schedule.component')
            .then((m) => m.ScheduleComponent),
      },

      // Actividades
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
              import(
                './modules/activity-new/activity-new.component'
              ).then((m) => m.ActivityNewComponent),
          },
        ],
      },

      // Default /funcionario -> perfil (sin id)
      { path: '', pathMatch: 'full', redirectTo: 'perfil' },
    ],
  },

  // ============================
  // Área SECRETARÍA
  // ============================
  {
    path: 'secretaria',
    children: [
      // PERFIL (si quieres, puedes añadir también 'perfil' sin :id)
      {
        path: 'perfil/:id',
        loadComponent: () =>
          import('./modules/secretaria/profile-home/profile-home.component')
            .then((m) => m.ProfileHomeComponent),
      },

      // HORARIO
      {
        path: 'horario',
        loadComponent: () =>
          import('./modules/secretaria/schedule/schedule.component')
            .then((m) => m.ScheduleComponent),
      },

      // ACTIVIDADES
      {
        path: 'actividades',
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'historial' },
          {
            path: 'historial',
            loadComponent: () =>
              import(
                './modules/secretaria/activities-history/activities-history.component'
              ).then((m) => m.ActivitiesHistoryComponent),
          },
        ],
      },

      // Rutas propias
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
      {
        path: 'gestionar-salas',
        loadComponent: () =>
          import(
            './modules/secretaria/gestionar-salas/gestionar-salas.component'
          ).then((m) => m.GestionarSalasComponent),
      },

      // Default /secretaria -> perfil/0 (si prefieres, puedes cambiarlo luego a 'perfil')
      { path: '', pathMatch: 'full', redirectTo: 'perfil/0' },
    ],
  },

  // ============================
  // Área DIRECTOR
  // ============================
  {
    path: 'director',
    children: [
      // Perfil sin id y con id
      {
        path: 'perfil',
        loadComponent: () =>
          import('./modules/director/profile-home/profile-home.component')
            .then((m) => m.ProfileHomeComponent),
      },
      {
        path: 'perfil/:id',
        loadComponent: () =>
          import('./modules/director/profile-home/profile-home.component')
            .then((m) => m.ProfileHomeComponent),
      },

      // Calendario
      {
        path: 'horario',
        loadComponent: () =>
          import('./modules/director/schedule/schedule.component')
            .then((m) => m.ScheduleComponent),
      },

      // Actividades -> Historial
      {
        path: 'actividades',
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'historial' },
          {
            path: 'historial',
            loadComponent: () =>
              import(
                './modules/director/historial-funcionario/historial-funcionario.component'
              ).then((m) => m.HistorialFuncionarioComponent),
          },
        ],
      },

      // Default /director -> perfil (sin id)
      { path: '', pathMatch: 'full', redirectTo: 'perfil' },
    ],
  },

  // ============================
  // Alias: ACTIVIDAD (redirige al historial de Secretaría)
  // ============================
  {
    path: 'actividad',
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'historial' },
      {
        path: 'historial',
        redirectTo: '/secretaria/actividades/historial',
        pathMatch: 'full',
      },
    ],
  },

  // ============================
  // Wildcard
  // ============================
  { path: '**', redirectTo: '' },
];
