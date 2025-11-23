import { CreateEmpleadoCargoDto } from "./dto/create-empleado-cargo.dto";
import { UpdateEmpleadoCargoDto } from "./dto/update-empleado-cargo.dto";
import { EmpleadoCargoService } from "./empleado-cargos.service";
export declare class EmpleadoCargoController {
    private readonly service;
    constructor(service: EmpleadoCargoService);
    create(dto: CreateEmpleadoCargoDto): Promise<import("../../database/entities/empleado-cargo.entity").EmpleadoCargo>;
    findAll(): Promise<import("../../database/entities/empleado-cargo.entity").EmpleadoCargo[]>;
    findOne(id: number): Promise<import("../../database/entities/empleado-cargo.entity").EmpleadoCargo>;
    update(id: number, dto: UpdateEmpleadoCargoDto): Promise<import("../../database/entities/empleado-cargo.entity").EmpleadoCargo>;
    remove(id: number): Promise<void>;
}
