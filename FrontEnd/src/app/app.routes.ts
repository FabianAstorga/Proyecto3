import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register', // 👈 AÑADIDO
    loadComponent: () =>
      import('./features/register/register.component').then(m => m.RegisterComponent)
  },
  { path: '**', redirectTo: '' }
];
