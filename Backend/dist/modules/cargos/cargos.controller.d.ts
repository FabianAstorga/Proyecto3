import { CargosService } from './cargos.service';
import { CreateCargoDto } from './dto/create-cargo.dto';
import { UpdateCargoDto } from './dto/update-cargo.dto';
export declare class CargosController {
    private readonly cargosService;
    constructor(cargosService: CargosService);
    create(dto: CreateCargoDto): Promise<import("../../database/entities/cargo.entity").Cargo>;
    findAll(): Promise<import("../../database/entities/cargo.entity").Cargo[]>;
    findOne(id: string): Promise<import("../../database/entities/cargo.entity").Cargo>;
    update(id: string, dto: UpdateCargoDto): Promise<import("../../database/entities/cargo.entity").Cargo>;
    remove(id: string): Promise<import("../../database/entities/cargo.entity").Cargo>;
}
