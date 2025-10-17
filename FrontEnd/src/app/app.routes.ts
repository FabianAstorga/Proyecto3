import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./modules/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./modules/login/login.component').then(m => m.LoginComponent)
  },
  
  {
    path: 'perfil',
    loadComponent: () =>
      import('./modules/profile-home/profile-home.component').then(m => m.ProfileHomeComponent)
  },
  {
    path: 'actividades/historial',
    loadComponent: () =>
      import('./modules/activities-history/activities-history.component').then(m => m.ActivitiesHistoryComponent)
  },
  {
    path: 'actividades/nueva',
    loadComponent: () =>
      import('./modules/activity-new/activity-new.component').then(m => m.ActivityNewComponent)
  },

  { path: '**', redirectTo: '' }
];
