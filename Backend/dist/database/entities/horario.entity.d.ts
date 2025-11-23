import { Usuario } from './usuario.entity';
export declare class Horario {
    id_agenda: number;
    bloque: string;
    fecha: Date;
    horaInicio: Date;
    horaFin: Date;
    esDisponible: boolean;
    usuario: Usuario;
}
