import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  LayoutComponent,
  NavItem,
} from '../../../components/layout/layout.component';
import { Activity } from '../../../models/activity.model';
import { User } from '../../../models/user.model';
import { AuthService } from '../../../services/auth.service'; // ajusta la ruta según tu proyecto
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-historial-funcionario',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    LayoutComponent,
    HttpClientModule,
  ],
  templateUrl: './historial-funcionario.component.html',
})
export class HistorialFuncionarioComponent implements OnInit {
  // Usuario logueado
  user: User | null = null;

  // Sidebar
  navItems: NavItem[] = [
    { label: 'Inicio Perfil', link: '/director/perfil' },
    { label: 'Historial Funcionario', link: '/director/historial-funcionario' },
  ];
  logoutLink = '/login';

  // Datos de usuarios y actividades
  usuarios: User[] = [];
  actividades: Activity[] = [];

  // Selecciones
  funcionarioSeleccionadoId: number | null = null;
  mesSeleccionado: string = '';
  actividadesFiltradas: Activity[] = [];

  // Inyección de AuthService
  private authService = inject(AuthService);

  ngOnInit(): void {
    // Obtener usuario desde AuthService

    // Cargar datos desde localStorage o servicio
    this.usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    this.actividades = JSON.parse(localStorage.getItem('actividades') || '[]');
  }

  seleccionarFuncionario() {
    if (this.funcionarioSeleccionadoId) {
      this.filtrarActividades();
    } else {
      this.actividadesFiltradas = [];
    }
  }

  cambiarMes(event: any) {
    this.mesSeleccionado = event.target.value;
    this.filtrarActividades();
  }

  filtrarActividades() {
    let filtradas = this.actividades.filter(
      (a) => a.userId === this.funcionarioSeleccionadoId
    );

    if (this.mesSeleccionado) {
      filtradas = filtradas.filter((a) =>
        a.fecha.startsWith(this.mesSeleccionado)
      );
    }

    this.actividadesFiltradas = filtradas.sort(
      (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    );
  }
}
