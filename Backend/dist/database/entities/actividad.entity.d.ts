import { Informe } from './informe.entity';
export declare class Actividad {
    id_actividad: number;
    titulo: string;
    descripcion: string;
    fecha: Date;
    tipo: string;
    estado: string;
    esRepetitiva: boolean;
    informe_id: number;
    informe: Informe;
}
