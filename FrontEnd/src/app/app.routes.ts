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
      { path: '', pathMatch: 'full', redirectTo: 'perfil' },

      {
        path: 'perfil',
        loadComponent: () =>
          import(
            './modules/funcionario/profile-home/profile-home.component'
          ).then((m) => m.ProfileHomeComponent),
      },
      {
        path: 'horario',
        loadComponent: () =>
          import('./modules/funcionario/schedule/schedule.component').then(
            (m) => m.ScheduleComponent
          ),
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
      { path: '', pathMatch: 'full', redirectTo: 'perfil' },

      {
        path: 'perfil',
        loadComponent: () =>
          import(
            './modules/secretaria/profile-home/profile-home.component'
          ).then((m) => m.ProfileHomeComponent),
      },
      {
        path: 'horario',
        loadComponent: () =>
          import('./modules/secretaria/schedule/schedule.component').then(
            (m) => m.ScheduleComponent
          ),
      },
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
          {
            path: 'nueva',
            loadComponent: () =>
              import(
                './modules/secretaria/activity-new/activity-new.component'
              ).then((m) => m.ActivityNewComponent),
          },
        ],
      },

      // ---- GESTIONAR (fuera de actividades)
      {
        path: 'gestionar-funcionario',
        loadComponent: () =>
          import(
            './modules/secretaria/gestionar-funcionario/gestionar-funcionario.component'
          ).then((m) => m.GestionarFuncionarioComponent),
      },
      {
        path: 'gestiona-horario',
        loadComponent: () =>
          import(
            './modules/secretaria/gestiona-horario/gestiona-horario.component'
          ).then((m) => m.GestionaHorarioComponent),
      },
      {
        path: 'gestionar-totem',
        loadComponent: () =>
          import(
            './modules/secretaria/gestionar-totem/gestionar-totem.component'
          ).then((m) => m.GestionarTotemComponent),
      },
    ],
  },

  // ============================
  // Área DIRECTOR
  // ============================
  {
    path: 'director',
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'perfil' },

      {
        path: 'perfil',
        loadComponent: () =>
          import('./modules/director/profile-home/profile-home.component').then(
            (m) => m.ProfileHomeComponent
          ),
      },
      {
        path: 'horario',
        loadComponent: () =>
          import('./modules/director/schedule/schedule.component').then(
            (m) => m.ScheduleComponent
          ),
      },
      {
        path: 'actividades',
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'historial' },
          {
            path: 'historial',
            loadComponent: () =>
              import(
                './modules/director/activities-history/activities-history.component'
              ).then((m) => m.ActivitiesHistoryComponent),
          },
          {
            path: 'nueva',
            loadComponent: () =>
              import(
                './modules/director/activity-new/activity-new.component'
              ).then((m) => m.ActivityNewComponent),
          },
        ],
      },
    ],
  },

  // ----------------------------
  // Compatibilidad (rutas “viejas”) -> funcionario
  // ----------------------------
  { path: 'perfil', pathMatch: 'full', redirectTo: 'funcionario/perfil' },
  { path: 'horario', pathMatch: 'full', redirectTo: 'funcionario/horario' },
  {
    path: 'actividades',
    pathMatch: 'full',
    redirectTo: 'funcionario/actividades',
  },
  {
    path: 'actividades/historial',
    pathMatch: 'full',
    redirectTo: 'funcionario/actividades/historial',
  },
  {
    path: 'actividades/nueva',
    pathMatch: 'full',
    redirectTo: 'funcionario/actividades/nueva',
  },

  { path: '**', redirectTo: '' },
];
