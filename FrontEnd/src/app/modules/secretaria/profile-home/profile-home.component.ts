import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LayoutComponent } from '../../../shared/layout/layout.component';

type Gestion = {
  fecha: string;
  titulo: string;
  detalle: string;
  estado: 'Completada' | 'Pendiente' | 'Rechazada';
  duracion: number;
};

@Component({
  standalone: true,
  selector: 'app-profile-home',
  imports: [CommonModule, RouterLink, LayoutComponent],
  templateUrl: './profile-home.component.html',
})
export class ProfileHomeComponent {
  user = {
    firstName: 'María',
    lastName: 'Rojas Pérez',
    email: 'maria.rojas@uta.cl',
    role: 'Secretaría',
    photoUrl: '/usuario(1).png',
  };

  tasksCount = 27;
  notificationLabel = '2 nuevas';
  lastSession = '2025-10-30 09:48';

  recent: Gestion[] = [
    {
      fecha: '2025-10-30',
      titulo: 'Gestión de horario docente',
      detalle: 'Actualización de bloques académicos',
      estado: 'Completada',
      duracion: 45,
    },
    {
      fecha: '2025-10-29',
      titulo: 'Registro de actividad académica',
      detalle: 'Ingreso de informes de asistencia',
      estado: 'Completada',
      duracion: 30,
    },
    {
      fecha: '2025-10-28',
      titulo: 'Actualización de totem informativo',
      detalle: 'Carga de noticias y horarios',
      estado: 'Pendiente',
      duracion: 25,
    },
    {
      fecha: '2025-10-27',
      titulo: 'Revisión de documentación docente',
      detalle: 'Control de actas y registros firmados',
      estado: 'Completada',
      duracion: 60,
    },
    {
      fecha: '2025-10-26',
      titulo: 'Coordinación con Dirección',
      detalle: 'Preparación de reunión mensual',
      estado: 'Pendiente',
      duracion: 35,
    },
    {
      fecha: '2025-10-25',
      titulo: 'Atención a estudiantes',
      detalle: 'Recepción de solicitudes académicas',
      estado: 'Completada',
      duracion: 50,
    },
    {
      fecha: '2025-10-23',
      titulo: 'Actualización de correos masivos',
      detalle: 'Envío de recordatorios administrativos',
      estado: 'Rechazada',
      duracion: 20,
    },
  ];

  // Modal
  showDetails = false;

  // Simulación de datos del backend
  cargoDescripcion: string[] = [
    'Apoyar la gestión administrativa y académica del departamento.',
    'Coordinar reuniones, actas y documentación oficial del área.',
    'Atender consultas de estudiantes, docentes y público general.',
    'Registrar y mantener actualizados los horarios y salas asignadas.',
    'Gestionar el flujo de información entre dirección, docentes y funcionarios.',
    'Colaborar en la organización de eventos académicos y de vinculación.',
    'Supervisar el uso y estado del sistema de registro de actividades.',
    'Emitir reportes y respaldos administrativos cuando sean requeridos.',
    'Mantener la confidencialidad y orden de los documentos institucionales.',
    'Velar por el cumplimiento de plazos y requerimientos administrativos.',
  ];

  openDetails() {
    this.showDetails = true;
  }
  closeDetails() {
    this.showDetails = false;
  }

  onAvatarError(e: Event) {
    (e.target as HTMLImageElement).src = '/avatar.png';
  }
}
