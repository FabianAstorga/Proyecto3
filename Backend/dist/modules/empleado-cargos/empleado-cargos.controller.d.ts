import { CreateEmpleadoCargoDto } from './dto/create-empleado-cargo.dto';
import { UpdateEmpleadoCargoDto } from './dto/update-empleado-cargo.dto';
import { EmpleadoCargoService } from './empleado-cargos.service';
export declare class EmpleadoCargoController {
    private readonly service;
    constructor(service: EmpleadoCargoService);
    create(dto: CreateEmpleadoCargoDto): Promise<import("../../database/entities/empleado-cargo.entity").EmpleadoCargo>;
    findAll(): Promise<import("../../database/entities/empleado-cargo.entity").EmpleadoCargo[]>;
    findOne(id: string): Promise<import("../../database/entities/empleado-cargo.entity").EmpleadoCargo>;
    update(id: string, dto: UpdateEmpleadoCargoDto): Promise<import("../../database/entities/empleado-cargo.entity").EmpleadoCargo>;
    remove(id: string): Promise<void>;
}
