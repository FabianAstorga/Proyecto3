import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

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
  imports: [CommonModule, RouterLink],
  templateUrl: './profile-home.component.html'
})
export class ProfileHomeComponent {

  user = {
    firstName: 'Cesar',
    lastName: 'Pinto',
    email: 'cesar.pinto.castillo@alumnos.uta.cl',
    role: 'Académico',
    photoUrl: '/avatar.jpg' 
  };

  activitiesCount = 8;
  notificationLabel = 'Urgente';
  lastSession = '2025-10-16 14:22';

  recent: Activity[] = [
    { fecha: '2025-10-15', titulo: 'Taller de CAD', detalle: 'Modelado 3D', estado: 'Aprobada', horas: 4 },
    { fecha: '2025-10-10', titulo: 'Seminario de Materiales', detalle: 'Compósitos avanzados', estado: 'Pendiente', horas: 2 },
    { fecha: '2025-10-05', titulo: 'Voluntariado Feria UTA', detalle: 'Apoyo logístico', estado: 'Aprobada', horas: 5 }
  ];

  onAvatarError(e: Event) {
    (e.target as HTMLImageElement).src = '/avatar.png';
  }
}
