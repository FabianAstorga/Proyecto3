import { ActividadService } from './actividades.service';
import { CreateActividadDto } from './dto/create-actividad.dto';
import { UpdateActividadDto } from './dto/update-actividad.dto';
export declare class ActividadesController {
    private readonly actividadService;
    constructor(actividadService: ActividadService);
    create(createActividadDto: CreateActividadDto, req: any): Promise<import("../../database/entities/actividad.entity").Actividad | import("../../database/entities/actividad.entity").Actividad[]>;
    findAll(): Promise<import("../../database/entities/actividad.entity").Actividad[]>;
    findOne(id: string): Promise<import("../../database/entities/actividad.entity").Actividad | null>;
    update(id: string, updateActividadDto: UpdateActividadDto): Promise<import("../../database/entities/actividad.entity").Actividad | null>;
    remove(id: string): Promise<import("typeorm").DeleteResult>;
}
