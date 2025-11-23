import { EmpleadoCargo } from './empleado-cargo.entity';
export declare class Cargo {
    id_cargo: number;
    ocupacion: string;
    descripcion: string;
    empleados: EmpleadoCargo[];
}
