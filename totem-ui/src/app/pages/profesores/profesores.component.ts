import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

interface Academic {
  name: string;
  title: string;          
  department: string;
  area: string;          
  office: string;
  email: string;
  phone: string;
  degree: 'Doctorado' | 'Magíster' | 'Licenciatura';
  experienceYears: number;
  publications: number;
  officeHours: string;
}

@Component({
  standalone: true,
  selector: 'app-profesores',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './profesores.component.html',
})
export class ProfesoresComponent {


  nombre = '';

  private all = signal<Academic[]>([
    {
      name: 'Dr. María Elena González',
      title: 'Decana de Facultad',
      department: 'Administración',
      area: 'Gestión Estratégica',
      office: 'A-101',
      email: 'maria.gonzalez@universidad.cl',
      phone: '+56 2 2345 6789',
      degree: 'Doctorado',
      experienceYears: 15,
      publications: 45,
      officeHours: 'Lunes a Viernes · 10:30 – 12:00',
    },
    {
      name: 'Prof. Carlos Mendoza',
      title: 'Profesor Titular',
      department: 'Ingeniería',
      area: 'Sistemas de Información',
      office: 'B-205',
      email: 'carlos.mendoza@universidad.cl',
      phone: '+56 2 2201 4567',
      degree: 'Magíster',
      experienceYears: 12,
      publications: 28,
      officeHours: 'Lunes a Jueves · 14:00 – 16:30',
    },
    {
      name: 'Dra. Ana Patricia Silva',
      title: 'Directora de Investigación',
      department: 'Humanidades',
      area: 'Biotecnología',
      office: 'C-108',
      email: 'ana.silva@universidad.cl',
      phone: '+56 2 2134 5678',
      degree: 'Doctorado',
      experienceYears: 18,
      publications: 67,
      officeHours: 'Martes y Jueves · 10:00 – 12:00',
    },
    {
      name: 'Prof. Roberto Fernández',
      title: 'Profesor Asociado',
      department: 'Humanidades',
      area: 'Literatura Contemporánea',
      office: 'C-201',
      email: 'roberto.fernandez@universidad.cl',
      phone: '+56 2 2987 1122',
      degree: 'Magíster',
      experienceYears: 14,
      publications: 19,
      officeHours: 'Miércoles · 11:30 – 13:00',
    },
  ]);


  academics = computed(() => {
    const q = this.nombre.trim().toLowerCase();
    if (!q) return this.all();
    return this.all().filter(a =>
      a.name.toLowerCase().includes(q) ||
      a.department.toLowerCase().includes(q) ||
      a.area.toLowerCase().includes(q)
    );
  });

  total = computed(() => this.all().length);
  departamentos = computed(() => new Set(this.all().map(a => a.department)).size);
  doctores = computed(() => this.all().filter(a => a.degree === 'Doctorado').length);
  publicaciones = computed(() => this.all().reduce((acc, a) => acc + a.publications, 0));

  buscar() {  }
  limpiar() { this.nombre = ''; }
}
