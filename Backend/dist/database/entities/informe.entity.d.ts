import { Usuario } from "./usuario.entity";
import { Actividad } from "./actividad.entity";
export declare class Informe {
    id_informe: number;
    periodo: string;
    estado: string;
    observaciones: string;
    usuario: Usuario;
    actividades: Actividad[];
}
