import type { Request } from 'express';
import { InformesService } from './informes.service';
export declare class InformesController {
    private readonly informesService;
    constructor(informesService: InformesService);
    findMisInformes(req: Request): Promise<import("../../database/entities/informe.entity").Informe[]>;
    findOne(id: number): Promise<import("../../database/entities/informe.entity").Informe | null>;
    marcarComoEnviado(id: number): Promise<import("../../database/entities/informe.entity").Informe | null>;
}
