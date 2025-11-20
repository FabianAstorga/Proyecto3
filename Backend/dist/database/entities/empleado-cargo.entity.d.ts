import { Cargo } from './cargo.entity';
import { Usuario } from './usuario.entity';
export declare class EmpleadoCargo {
    id: number;
    fecha_inicio: Date;
    fecha_fin: Date;
    usuario: Usuario;
    cargo: Cargo;
}
