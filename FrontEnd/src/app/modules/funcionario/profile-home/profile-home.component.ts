import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LayoutComponent } from '../../../shared/layout/layout.component';

type Activity = {
  fecha: string;
  titulo: string;
  detalle: string;
  estado: 'Aprobada' | 'Pendiente' | 'Rechazada';
  horas: number;
};

@Component({
  standalone: true,
  selector: 'app-profile-home',
  imports: [CommonModule, RouterLink, LayoutComponent],
  templateUrl: './profile-home.component.html',
})
export class ProfileHomeComponent {
  user = {
    firstName: 'Cesar',
    lastName: 'Pinto',
    email: 'cesar.pinto.castillo@alumnos.uta.cl',
    role: 'Académico',
    photoUrl: '/usuario(1).png',
  };

  activitiesCount = 8;
  notificationLabel = 'Urgente';
  lastSession = '2025-10-16 14:22';

  recent: Activity[] = [
    {
      fecha: '2025-10-15',
      titulo: 'Taller de CAD',
      detalle: 'Modelado 3D',
      estado: 'Aprobada',
      horas: 4,
    },
    {
      fecha: '2025-10-10',
      titulo: 'Seminario de Materiales',
      detalle: 'Compósitos avanzados',
      estado: 'Pendiente',
      horas: 2,
    },
    {
      fecha: '2025-10-05',
      titulo: 'Voluntariado Feria UTA',
      detalle: 'Apoyo logístico',
      estado: 'Aprobada',
      horas: 5,
    },
    {
      fecha: '2025-10-12',
      titulo: 'Capacitación Docente',
      detalle: 'Uso de plataformas virtuales',
      estado: 'Aprobada',
      horas: 3,
    },
    {
      fecha: '2025-10-09',
      titulo: 'Reunión de Facultad',
      detalle: 'Presentación de proyectos de investigación',
      estado: 'Pendiente',
      horas: 2,
    },
    {
      fecha: '2025-10-03',
      titulo: 'Evaluación Parcial',
      detalle: 'Aplicación de prueba a estudiantes de Ingeniería',
      estado: 'Aprobada',
      horas: 6,
    },
    {
      fecha: '2025-09-29',
      titulo: 'Asesoría Académica',
      detalle: 'Orientación a nuevos alumnos de primer año',
      estado: 'Rechazada',
      horas: 1,
    },
  ];

  // Modal
  showDetails = false;

  // Simulación de datos del backend
  cargoDescripcion: string[] = [
    'Impartir clases teóricas y prácticas según carga académica asignada.',
    'Preparar programas, guías y materiales de aprendizaje alineados a los resultados de aprendizaje.',
    'Planificar evaluaciones, calificar y retroalimentar oportunamente a los estudiantes.',
    'Realizar atención a estudiantes en horarios de consulta y tutorías.',
    'Desarrollar y/o participar en proyectos de investigación y/o innovación docente.',
    'Actualizar contenidos y metodologías incorporando tecnologías educativas pertinentes.',
    'Participar en comités, consejos de escuela y actividades de vinculación con el medio.',
    'Mantener la gestión documental en los sistemas institucionales (actas, notas, evidencias).',
    'Cumplir con la normativa académica, reglamentos internos y políticas de calidad.',
    'Promover un ambiente de respeto, inclusión y aprendizaje activo en el aula.',
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
