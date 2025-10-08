import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home.component').then(m => m.HomeComponent) },
  { path: 'profesores', loadComponent: () => import('./pages/profesores/profesores.component').then(m => m.ProfesoresComponent) },
  { path: 'funcionarios', loadComponent: () => import('./pages/funcionarios/funcionarios.component').then(m => m.FuncionariosComponent) },
  { path: 'salas', loadComponent: () => import('./pages/salas/salas.component').then(m => m.SalasComponent) },
  { path: '**', redirectTo: '' },
];
