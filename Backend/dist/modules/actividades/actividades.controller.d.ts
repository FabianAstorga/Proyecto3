import { ActividadService } from './actividades.service';
import { CreateActividadDto } from './dto/create-actividad.dto';
import { UpdateActividadDto } from './dto/update-actividad.dto';
export declare class ActividadController {
    private readonly actividadService;
    constructor(actividadService: ActividadService);
    create(dto: CreateActividadDto): Promise<import("../../database/entities/actividad.entity").Actividad>;
    findAll(): Promise<import("../../database/entities/actividad.entity").Actividad[]>;
    findOne(id: number): Promise<import("../../database/entities/actividad.entity").Actividad | null>;
    update(id: number, dto: UpdateActividadDto): Promise<import("../../database/entities/actividad.entity").Actividad | null>;
    remove(id: number): Promise<import("typeorm").DeleteResult>;
}
