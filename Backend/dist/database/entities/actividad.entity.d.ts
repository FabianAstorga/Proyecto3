import { Informe } from './informe.entity';
export declare class Actividad {
    id_actividad: number;
    titulo: string;
    descripcion: string;
    fecha: Date;
    tipo: string;
    estado: boolean;
    esRepetitiva: boolean;
    informe: Informe;
}
