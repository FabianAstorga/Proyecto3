import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

type Status = 'Disponible' | 'En reunión' | 'Fuera de oficina';

interface Staff {
  name: string;
  title: string;          
  department: string;
  building: string;
  floor: string;
  office: string;
  email: string;
  phone: string;           
  ext: string;             
  supervisor: string;
  since: string;           
  schedule: string;       
  status: Status;
  skills: string[];
}

@Component({
  standalone: true,
  selector: 'app-funcionarios',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './funcionarios.component.html',
})
export class FuncionariosComponent {
  nombre = '';
  cargo = '';

  // datos mock
  private all = signal<Staff[]>([
    {
      name: 'Marcela Riquelme',
      title: 'Jefa de Admisión',
      department: 'Admisión y Matrículas',
      building: 'Edificio Central',
      floor: 'Segundo Piso',
      office: 'B-205',
      email: 'm.riquelme@universidad.cl',
      phone: '+56 2 2345 1122',
      ext: '2512',
      supervisor: 'Dirección Académica',
      since: '2016',
      schedule: 'Lunes a Viernes · 09:00–13:00',
      status: 'Disponible',
      skills: ['Gestión de procesos', 'CRM', 'Atención a público'],
    },
    {
      name: 'Jorge Paredes',
      title: 'Coordinador de Finanzas',
      department: 'Finanzas',
      building: 'Ala Norte',
      floor: 'Primer Piso',
      office: 'A-101',
      email: 'jorge.paredes@universidad.cl',
      phone: '+56 2 2201 3344',
      ext: '1103',
      supervisor: 'Gerencia de Administración',
      since: '2018',
      schedule: 'Lunes a Jueves · 14:00–17:00',
      status: 'En reunión',
      skills: ['Presupuesto', 'SAP', 'Tesorería'],
    },
    {
      name: 'Patricia Gómez',
      title: 'Encargada de Biblioteca',
      department: 'Biblioteca',
      building: 'Edificio Central',
      floor: 'Primer Piso',
      office: 'B-108',
      email: 'p.gomez@universidad.cl',
      phone: '+56 2 2987 6600',
      ext: '6601',
      supervisor: 'Vicerrectoría Académica',
      since: '2013',
      schedule: 'Lunes a Viernes · 10:00–12:00',
      status: 'Disponible',
      skills: ['Gestión de catálogos', 'Repositorios', 'Atención usuarios'],
    },
    {
      name: 'Rodrigo Fuentes',
      title: 'Soporte TI',
      department: 'Tecnologías de la Información',
      building: 'Ala Sur',
      floor: 'Tercer Piso',
      office: 'C-301',
      email: 'r.fuentes@universidad.cl',
      phone: '+56 2 2134 5566',
      ext: '3301',
      supervisor: 'Jefatura TI',
      since: '2020',
      schedule: 'Lunes a Viernes · 09:30–11:30',
      status: 'Fuera de oficina',
      skills: ['Redes', 'Service Desk', 'Hardware'],
    },
    {
      name: 'Carolina Araya',
      title: 'Asistente de Postgrado',
      department: 'Postgrado',
      building: 'Edificio Central',
      floor: 'Segundo Piso',
      office: 'B-210',
      email: 'carolina.araya@universidad.cl',
      phone: '+56 2 2345 7788',
      ext: '2210',
      supervisor: 'Dirección de Postgrado',
      since: '2019',
      schedule: 'Martes y Jueves · 11:00–13:00',
      status: 'Disponible',
      skills: ['Postulaciones', 'SIGE', 'Trámites'],
    },
    {
      name: 'Felipe Navarro',
      title: 'Coordinador de Infraestructura',
      department: 'Infraestructura',
      building: 'Ala Norte',
      floor: 'Segundo Piso',
      office: 'A-205',
      email: 'f.navarro@universidad.cl',
      phone: '+56 2 2345 9900',
      ext: '2290',
      supervisor: 'Gerencia Operaciones',
      since: '2015',
      schedule: 'Lun, Mié, Vie · 15:00–17:00',
      status: 'En reunión',
      skills: ['Obras', 'Contratos', 'Proveedores'],
    },
  ]);


  results = computed(() => {
    const qn = this.nombre.trim().toLowerCase();
    const qc = this.cargo.trim().toLowerCase();
    return this.all().filter(p => {
      const byName  = !qn || p.name.toLowerCase().includes(qn);
      const byTitle = !qc || p.title.toLowerCase().includes(qc);
      return byName && byTitle;
    });
  });

  buscar() {  }
  limpiar() { this.nombre = ''; this.cargo = ''; }

 
  normalizeTel(phone: string): string {
    return (phone || '').replace(/\s+/g, '');
  }
  digits(phone: string): string {
    return (phone || '').replace(/\D+/g, '');
  }


  statusClasses(s: Status) {
    switch (s) {
      case 'Disponible': return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
      case 'En reunión': return 'bg-amber-50 text-amber-700 ring-amber-200';
      default:           return 'bg-slate-50 text-slate-700 ring-slate-200';
    }
  }
}
