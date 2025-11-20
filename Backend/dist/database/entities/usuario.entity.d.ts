import { EmpleadoCargo } from './empleado-cargo.entity';
import { Informe } from './informe.entity';
import { Horario } from './horario.entity';
export declare class Usuario {
    id: number;
    rol: string;
    nombre: string;
    apellido: string;
    correo: string;
    contrasena: string;
    estado: boolean;
    telefono: string;
    foto_url: string;
    fecha_creacion: Date;
    cargos: EmpleadoCargo[];
    informes: Informe[];
    horarios: Horario[];
}
