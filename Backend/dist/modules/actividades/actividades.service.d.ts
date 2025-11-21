import { Repository } from 'typeorm';
import { CreateActividadDto } from './dto/create-actividad.dto';
import { UpdateActividadDto } from './dto/update-actividad.dto';
import { Actividad } from 'src/database/entities/actividad.entity';
import { InformesService } from '../informes/informes.service';
export declare class ActividadService {
    private readonly actividadRepository;
    private readonly informesService;
    constructor(actividadRepository: Repository<Actividad>, informesService: InformesService);
    create(dto: CreateActividadDto, usuarioId: number): Promise<Actividad | Actividad[]>;
    private crearSimple;
    private crearConFechasEspecificas;
    private crearConRepeticionSemanal;
    private generarFechasPorDiasSemana;
    findAll(): Promise<Actividad[]>;
    findOne(id: number): Promise<Actividad | null>;
    update(id: number, dto: UpdateActividadDto): Promise<Actividad | null>;
    remove(id: number): Promise<import("typeorm").DeleteResult>;
}
