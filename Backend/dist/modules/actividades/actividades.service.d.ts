import { Repository } from "typeorm";
import { CreateActividadDto } from "./dto/create-actividad.dto";
import { Actividad } from "src/database/entities/actividad.entity";
import { Usuario } from "src/database/entities/usuario.entity";
export declare class ActividadService {
    private readonly actividadRepository;
    private readonly usuarioRepository;
    constructor(actividadRepository: Repository<Actividad>, usuarioRepository: Repository<Usuario>);
    create(dto: CreateActividadDto, userId: number): Promise<Actividad>;
    findAll(): Promise<Actividad[]>;
    findOne(id: number): Promise<Actividad | null>;
    remove(id: number): Promise<import("typeorm").DeleteResult>;
}
