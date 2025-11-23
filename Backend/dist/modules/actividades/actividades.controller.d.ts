import type { Request } from "express";
import { ActividadService } from "./actividades.service";
import { CreateActividadDto } from "./dto/create-actividad.dto";
export declare class ActividadController {
    private readonly actividadService;
    constructor(actividadService: ActividadService);
    create(dto: CreateActividadDto, req: Request): Promise<import("../../database/entities/actividad.entity").Actividad>;
    findAll(): Promise<import("../../database/entities/actividad.entity").Actividad[]>;
    findOne(id: number): Promise<import("../../database/entities/actividad.entity").Actividad | null>;
    remove(id: number): Promise<import("typeorm").DeleteResult>;
}
