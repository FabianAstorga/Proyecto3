import { Repository } from 'typeorm';
import { CreateActividadDto } from './dto/create-actividad.dto';
import { UpdateActividadDto } from './dto/update-actividad.dto';
import { Actividad } from 'src/database/entities/actividad.entity';
import { Usuario } from 'src/database/entities/usuario.entity';
import { InformesService } from '../informes/informes.service';
export declare class ActividadService {
    private readonly actividadRepository;
    private readonly usuarioRepository;
    private readonly informesService;
    constructor(actividadRepository: Repository<Actividad>, usuarioRepository: Repository<Usuario>, informesService: InformesService);
    create(dto: CreateActividadDto, userId: number): Promise<Actividad | Actividad[]>;
    private crearSimple;
    private crearConFechasEspecificas;
    private crearConRepeticionSemanal;
    private generarFechasPorDiasSemana;
    findAll(): Promise<Actividad[]>;
    findByUser(userId: number): Promise<Actividad[]>;
    findOne(id: number): Promise<Actividad | null>;
    update(id: number, dto: UpdateActividadDto): Promise<Actividad | null>;
    remove(id: number): Promise<import("typeorm").DeleteResult>;
}
