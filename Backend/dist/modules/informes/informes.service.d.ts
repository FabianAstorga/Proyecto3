import { Repository } from 'typeorm';
import { Informe } from 'src/database/entities/informe.entity';
import { Usuario } from 'src/database/entities/usuario.entity';
export declare class InformesService {
    private readonly informeRepository;
    private readonly usuarioRepository;
    constructor(informeRepository: Repository<Informe>, usuarioRepository: Repository<Usuario>);
    obtenerOCrearInforme(usuarioId: number, fecha: Date): Promise<Informe>;
    private extraerPeriodo;
    findByUsuario(usuarioId: number): Promise<Informe[]>;
    findOne(id: number): Promise<Informe | null>;
    marcarComoEnviado(id: number): Promise<Informe | null>;
}
