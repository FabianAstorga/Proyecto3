import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

type RoomStatus = 'Disponible' | 'Ocupada';

interface Room {
  name: string;
  code: string;
  type: string;
  capacity: number;
  building: string; 
  floor: string;    
  status: RoomStatus;
  equipment: string[];
}

@Component({
  standalone: true,
  selector: 'app-salas',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './salas.component.html',
})
export class SalasComponent {

  codigo = '';
  piso: string | number = '';


  private allRooms = signal<Room[]>([
    {
      name: 'Sala de Conferencias Principal',
      code: 'A101',
      type: 'Conferencias',
      capacity: 50,
      building: 'Ala Norte',
      floor: 'Primer Piso',
      status: 'Disponible',
      equipment: ['Proyector', 'Sistema de audio', 'WiFi']
    },
    {
      name: 'Aula Magna',
      code: 'B205',
      type: 'Auditorio',
      capacity: 120,
      building: 'Edificio Central',
      floor: 'Segundo Piso',
      status: 'Ocupada',
      equipment: ['Proyector 4K', 'Sistema de audio profesional', 'HDMI']
    },
    {
      name: 'Sala de Reuniones Ejecutiva',
      code: 'C103',
      type: 'Reuniones',
      capacity: 12,
      building: 'Ala Sur',
      floor: 'Primer Piso',
      status: 'Disponible',
      equipment: ['Teleconferencia', 'WiFi']
    },
    {
      name: 'Laboratorio de Computación',
      code: 'A302',
      type: 'Laboratorio',
      capacity: 30,
      building: 'Ala Norte',
      floor: 'Tercer Piso',
      status: 'Disponible',
      equipment: ['PCs', 'Proyector', 'WiFi']
    },
    {
      name: 'Sala de Capacitación',
      code: 'B108',
      type: 'Capacitación',
      capacity: 20,
      building: 'Edificio Central',
      floor: 'Primer Piso',
      status: 'Disponible',
      equipment: ['Proyector', 'WiFi']
    },
    {
      name: 'Sala de Juntas Directorio',
      code: 'C201',
      type: 'Juntas',
      capacity: 8,
      building: 'Ala Sur',
      floor: 'Segundo Piso',
      status: 'Ocupada',
      equipment: ['Pantalla', 'Sistema de audio', 'WiFi']
    }
  ]);

  rooms = computed<Room[]>(() => {
    const cod = this.codigo.trim().toLowerCase();
    const p = String(this.piso ?? '').trim().toLowerCase();
    return this.allRooms().filter(r => {
      const okCode = !cod || r.code.toLowerCase().includes(cod) || r.name.toLowerCase().includes(cod);
      const okFloor = !p || r.floor.toLowerCase().includes(p);
      return okCode && okFloor;
    });
  });

  totalSalas = computed(() => this.allRooms().length);
  disponibles = computed(() => this.allRooms().filter(r => r.status === 'Disponible').length);
  ocupadas    = computed(() => this.allRooms().filter(r => r.status === 'Ocupada').length);
  capacidad   = computed(() => this.allRooms().reduce((acc, r) => acc + r.capacity, 0));

  buscar() {}
  limpiar() { this.codigo = ''; this.piso = ''; }
}
