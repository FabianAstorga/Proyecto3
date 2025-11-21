import { Repository } from 'typeorm';
import { Informe } from 'src/database/entities/informe.entity';
export declare class InformesService {
    private readonly informeRepository;
    constructor(informeRepository: Repository<Informe>);
    obtenerOCrearInforme(usuarioId: number, fecha: Date): Promise<Informe>;
    private extraerPeriodo;
    findByUsuario(usuarioId: number): Promise<Informe[]>;
    findOne(id: number): Promise<Informe | null>;
    marcarComoEnviado(id: number): Promise<Informe | null>;
}
