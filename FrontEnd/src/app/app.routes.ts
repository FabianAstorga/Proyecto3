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
  // Área SECRETARÍA (Adaptada para Layout cargado en cada componente)
  // ============================
  {
    path: 'secretaria',
    // La ruta principal /secretaria redirige al perfil con el ID.
    children: [
      // 1. PERFIL (Inicio - Carga el Layout + Contenido)
      {
        path: 'perfil/:id',
        loadComponent: () =>
          import(
            './modules/secretaria/profile-home/profile-home.component'
          ).then((m) => m.ProfileHomeComponent),
      },

      // 2. HORARIO (Carga el Layout + Contenido)
      {
        path: 'horario',
        loadComponent: () =>
          import('./modules/secretaria/schedule/schedule.component').then(
            (m) => m.ScheduleComponent
          ),
      },

      // 3. RUTAS DE ACTIVIDADES (Carga el Layout + Contenido)
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

      // 4. GESTIÓN FUNCIONARIO (Carga el Layout + Contenido)
      {
        path: 'gestionar-funcionario',
        loadComponent: () =>
          import(
            './modules/secretaria/gestionar-funcionario/gestionar-funcionario.component'
          ).then((m) => m.GestionarFuncionarioComponent),
      },

      // 5. GESTIÓN HORARIO (Carga el Layout + Contenido)
      {
        path: 'gestionar-calendario',
        loadComponent: () =>
          import(
            './modules/secretaria/gestionar-calendario/gestionar-calendario.component'
          ).then((m) => m.GestionarCalendarioComponent),
      },

      // 6. GESTIÓN TÓTEM (Carga el Layout + Contenido)
      {
        path: 'gestionar-salas',
        loadComponent: () =>
          import(
            './modules/secretaria/gestionar-salas/gestionar-salas.component'
          ).then((m) => m.GestionarSalasComponent),
      },

      // Redirección inicial (si navegan solo a /secretaria)
      { path: '', pathMatch: 'full', redirectTo: 'perfil/0' }, // Usar un ID por defecto
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

  { path: '**', redirectTo: '' },
];
