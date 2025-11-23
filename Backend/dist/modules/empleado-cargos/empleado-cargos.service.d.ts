import { Repository } from "typeorm";
import { EmpleadoCargo } from "src/database/entities/empleado-cargo.entity";
import { CreateEmpleadoCargoDto } from "./dto/create-empleado-cargo.dto";
import { UpdateEmpleadoCargoDto } from "./dto/update-empleado-cargo.dto";
export declare class EmpleadoCargoService {
    private readonly repository;
    constructor(repository: Repository<EmpleadoCargo>);
    create(dto: CreateEmpleadoCargoDto): Promise<EmpleadoCargo>;
    findAll(): Promise<EmpleadoCargo[]>;
    findOne(id: number): Promise<EmpleadoCargo>;
    update(id: number, dto: UpdateEmpleadoCargoDto): Promise<EmpleadoCargo>;
    remove(id: number): Promise<void>;
    findByUser(usuarioId: number): Promise<EmpleadoCargo[]>;
}
