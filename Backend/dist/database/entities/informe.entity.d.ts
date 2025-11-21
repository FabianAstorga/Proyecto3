import { Usuario } from './usuario.entity';
import { Actividad } from './actividad.entity';
export declare class Informe {
    id_informe: number;
    periodo: string;
    fechaEnvio: Date;
    fechaRevision: Date;
    estado: string;
    observaciones: string;
    usuario_id: number;
    usuario: Usuario;
    actividades: Actividad[];
}
