import { InformesService } from './informes.service';
export declare class InformesController {
    private readonly informesService;
    constructor(informesService: InformesService);
    findMisInformes(req: any): Promise<import("../../database/entities/informe.entity").Informe[]>;
    findByUsuario(usuarioId: string): Promise<import("../../database/entities/informe.entity").Informe[]>;
    findOne(id: string): Promise<import("../../database/entities/informe.entity").Informe | null>;
    marcarComoEnviado(id: string): Promise<import("../../database/entities/informe.entity").Informe | null>;
}
