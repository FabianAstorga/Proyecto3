import { Repository } from 'typeorm';
import { CreateActividadDto } from './dto/create-actividad.dto';
import { UpdateActividadDto } from './dto/update-actividad.dto';
import { Actividad } from 'src/database/entities/actividad.entity';
export declare class ActividadService {
    private readonly actividadRepository;
    constructor(actividadRepository: Repository<Actividad>);
    create(dto: CreateActividadDto): Promise<Actividad>;
    findAll(): Promise<Actividad[]>;
    findOne(id: number): Promise<Actividad | null>;
    update(id: number, dto: UpdateActividadDto): Promise<Actividad | null>;
    remove(id: number): Promise<import("typeorm").DeleteResult>;
}
