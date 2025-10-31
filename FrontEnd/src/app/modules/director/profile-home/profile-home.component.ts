import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LayoutComponent } from '../../../shared/layout/layout.component';

type Report = {
  fecha: string;
  titulo: string;
  detalle: string;
  estado: 'Aprobado' | 'En revisión' | 'Rechazado';
};

@Component({
  standalone: true,
  selector: 'app-profile-home',
  imports: [CommonModule, RouterLink, LayoutComponent],
  templateUrl: './profile-home.component.html'
})
export class ProfileHomeComponent {
  user = {
    firstName: 'Rodrigo',
    lastName: 'Salazar Díaz',
    email: 'rodrigo.salazar@uta.cl',
    role: 'Director',
    photoUrl: '/usuario(1).png'
  };

  reportsReviewed = 14;
  notificationLabel = '3 pendientes';
  lastSession = '2025-10-31 10:15';

  recent: Report[] = [
    { fecha: '2025-10-30', titulo: 'Informe mensual de actividades', detalle: 'Consolidado general del departamento', estado: 'Aprobado' },
    { fecha: '2025-10-29', titulo: 'Evaluación académica docente', detalle: 'Revisión de desempeño 2° semestre', estado: 'En revisión' },
    { fecha: '2025-10-28', titulo: 'Propuesta de nuevo equipamiento', detalle: 'Solicitud de recursos laboratorio', estado: 'Aprobado' },
    { fecha: '2025-10-26', titulo: 'Revisión de asistencia académica', detalle: 'Control administrativo mensual', estado: 'Aprobado' },
    { fecha: '2025-10-25', titulo: 'Informe de vinculación con el medio', detalle: 'Actividades con empresas colaboradoras', estado: 'Rechazado' },
    { fecha: '2025-10-24', titulo: 'Revisión de carga docente', detalle: 'Ajustes por licencias y reemplazos', estado: 'En revisión' },
    { fecha: '2025-10-23', titulo: 'Seguimiento de prácticas profesionales', detalle: 'Informe consolidado de estudiantes', estado: 'Aprobado' }
  ];

  // Modal
  showDetails = false;

  cargoDescripcion: string[] = [
    'Dirigir y coordinar las actividades académicas, administrativas y financieras del departamento.',
    'Supervisar el cumplimiento de los planes de docencia, investigación y vinculación con el medio.',
    'Revisar y aprobar los informes de gestión de las distintas áreas y programas.',
    'Promover el desarrollo profesional del cuerpo académico y administrativo.',
    'Coordinar con la Facultad y la Universidad la planificación estratégica del departamento.',
    'Representar al departamento en reuniones, comités y actos oficiales.',
    'Fomentar la calidad, innovación y mejora continua en los procesos internos.',
    'Gestionar los recursos humanos, materiales y presupuestarios asignados.',
    'Velar por el cumplimiento de la normativa universitaria y ética institucional.',
    'Impulsar proyectos que fortalezcan la imagen y posicionamiento del departamento.'
  ];

  openDetails() { this.showDetails = true; }
  closeDetails() { this.showDetails = false; }

  onAvatarError(e: Event) {
    (e.target as HTMLImageElement).src = '/avatar.png';
  }
}
