import { Repository } from "typeorm";
import { CreateUsuarioDto } from "./dto/create-usuario.dto";
import { UpdateUsuarioDto } from "./dto/update-usuario.dto";
import { Usuario } from "../../database/entities/usuario.entity";
export declare class UsuariosService {
    private readonly usuarioRepository;
    constructor(usuarioRepository: Repository<Usuario>);
    create(createUsuarioDto: CreateUsuarioDto): Promise<Usuario>;
    findAll(): Promise<Usuario[]>;
    findOne(id: number): Promise<Usuario>;
    updateMyProfile(id: number, dto: UpdateUsuarioDto): Promise<Usuario | null>;
    update(id: number, updateUsuarioDto: UpdateUsuarioDto): Promise<Usuario | null>;
    remove(id: number): Promise<{
        message: string;
    }>;
    updateFoto(id: number, fotoUrl: string): Promise<Usuario>;
    findOneByEmail(correo: string): Promise<Usuario | null>;
    findOneByEmailWithPassword(correo: string): Promise<Usuario | null>;
}
