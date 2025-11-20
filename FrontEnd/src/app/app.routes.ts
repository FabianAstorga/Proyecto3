import { Routes } from '@angular/router';
import { AuthGuard } from './services/auth.guard';

// HOME público
export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./modules/home/home.component').then(m => m.HomeComponent),
  },

  // ============================
  // ÁREA FUNCIONARIO
  // ============================
  {
    path: 'funcionario/:id',
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    data: { roles: ['Funcionario'] },
    children: [
      {
        path: 'perfil',
        loadComponent: () =>
          import('./modules/profile-home/profile-home.component').then(
            m => m.ProfileHomeComponent
          ),
      },
      {
        path: 'actividades/nueva',
        loadComponent: () =>
          import('./modules/activity-new/activity-new.component').then(
            m => m.ActivityNewComponent
          ),
      },
      {
        path: 'horario',
        loadComponent: () =>
          import('./modules/schedule/schedule.component').then(
            m => m.ScheduleComponent
          ),
      },
      {
        path: 'actividades/historial',
        loadComponent: () =>
          import(
            './modules/my-activities-history/my-activities-history.component'
          ).then(m => m.MyActivitiesHistoryComponent),
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'perfil',
      },
    ],
  },

  // ============================
  // ÁREA SECRETARÍA
  // ============================
  {
    path: 'secretaria/:id',
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    data: { roles: ['Secretaria'] },
    children: [
      {
        path: 'perfil',
        loadComponent: () =>
          import('./modules/profile-home/profile-home.component').then(
            m => m.ProfileHomeComponent
          ),
      },
      {
        path: 'actividades/historial',
        loadComponent: () =>
          import(
            './modules/activities-history/activities-history.component'
          ).then(m => m.ActivitiesHistoryComponent),
      },
      {
        path: 'calendario',
        loadComponent: () =>
          import(
            './modules/gestionar-calendario/gestionar-calendario.component'
          ).then(m => m.GestionarCalendarioComponent),
      },
      {
        path: 'horario',
        loadComponent: () =>
          import('./modules/schedule/schedule.component').then(
            m => m.ScheduleComponent
          ),
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'perfil',
      },
    ],
  },

  // ============================
  // ÁREA ADMINISTRADOR
  // ============================
  {
    path: 'admin/:id',
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    data: { roles: ['Administrador'] },
    children: [
      {
        path: 'perfil',
        loadComponent: () =>
          import('./modules/profile-home/profile-home.component').then(
            m => m.ProfileHomeComponent
          ),
      },
      {
        path: 'funcionarios',
        loadComponent: () =>
          import(
            './modules/gestionar-funcionario/gestionar-funcionario.component'
          ).then(m => m.GestionarFuncionarioComponent),
      },
      {
        path: 'calendario',
        loadComponent: () =>
          import(
            './modules/gestionar-calendario/gestionar-calendario.component'
          ).then(m => m.GestionarCalendarioComponent),
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'funcionarios',
      },
    ],
  },

  // ============================
  // FALLO DE RUTA
  // ============================
  { path: '**', redirectTo: '' },
];
