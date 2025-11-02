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
      {
        path: 'perfil/:id',
        loadComponent: () =>
          import('./modules/funcionario/profile-home/profile-home.component')
            .then((m) => m.ProfileHomeComponent),
      },
      {
        path: 'horario',
        loadComponent: () =>
          import('./modules/funcionario/schedule/schedule.component')
            .then((m) => m.ScheduleComponent),
      },
      {
        path: 'actividades',
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'historial' },
          {
            path: 'historial',
            loadComponent: () =>
              import(
                './modules/funcionario/activities-history/activities-history.component'
              ).then((m) => m.ActivitiesHistoryComponent),
          },
          {
            path: 'nueva',
            loadComponent: () =>
              import(
                './modules/funcionario/activity-new/activity-new.component'
              ).then((m) => m.ActivityNewComponent),
          },
        ],
      },
    ],
  },

  // ============================
  // Área SECRETARÍA
  // ============================
  {
    path: 'secretaria',
    children: [
      // PERFIL
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

      // ACTIVIDADES (historial y nueva)
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

      // Rutas propias de secretaría
      {
        path: 'gestionar-funcionario',
        loadComponent: () =>
          import(
            './modules/secretaria/gestionar-funcionario/gestionar-funcionario.component'
          ).then((m) => m.GestionarFuncionarioComponent),
      },
      {
        path: 'gestionar-calendario',
        loadComponent: () =>
          import(
            './modules/secretaria/gestionar-calendario/gestionar-calendario.component'
          ).then((m) => m.GestionarCalendarioComponent),
      },
      {
        path: 'gestionar-salas',
        loadComponent: () =>
          import(
            './modules/secretaria/gestionar-salas/gestionar-salas.component'
          ).then((m) => m.GestionarSalasComponent),
      },

      // Redirección inicial para /secretaria
      { path: '', pathMatch: 'full', redirectTo: 'perfil/0' },
    ],
  },

  // ============================
  // Área DIRECTOR
  // ============================
  {
    path: 'director',
    children: [
      {
        path: 'perfil/:id',
        loadComponent: () =>
          import('./modules/director/profile-home/profile-home.component')
            .then((m) => m.ProfileHomeComponent),
      },
      {
        path: 'horario',
        loadComponent: () =>
          import('./modules/director/schedule/schedule.component')
            .then((m) => m.ScheduleComponent),
      },
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

  { path: '**', redirectTo: '' },
];
