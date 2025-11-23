import { Repository } from 'typeorm';
import { CreateCargoDto } from './dto/create-cargo.dto';
import { UpdateCargoDto } from './dto/update-cargo.dto';
import { Cargo } from 'src/database/entities/cargo.entity';
export declare class CargosService {
    private readonly cargoRepository;
    constructor(cargoRepository: Repository<Cargo>);
    create(dto: CreateCargoDto): Promise<Cargo>;
    findAll(): Promise<Cargo[]>;
    findOne(id: number): Promise<Cargo>;
    update(id: number, dto: UpdateCargoDto): Promise<Cargo>;
    remove(id: number): Promise<Cargo>;
}
