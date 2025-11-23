import { Informe } from './informe.entity';
import { Usuario } from './usuario.entity';
export declare class Actividad {
    id_actividad: number;
    titulo: string;
    descripcion: string;
    fecha: Date;
    tipo: string;
    estado: boolean;
    esRepetitiva: boolean;
    usuario: Usuario;
    informe: Informe;
}
