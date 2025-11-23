import { UsuariosService } from "./usuarios.service";
import { CreateUsuarioDto } from "./dto/create-usuario.dto";
import { UpdateUsuarioDto } from "./dto/update-usuario.dto";
import type { Request } from "express";
export declare class UsuariosController {
    private readonly usuariosService;
    constructor(usuariosService: UsuariosService);
    create(createUsuarioDto: CreateUsuarioDto): Promise<import("../../database/entities/usuario.entity").Usuario>;
    findAll(): Promise<import("../../database/entities/usuario.entity").Usuario[]>;
    findOne(id: number): Promise<import("../../database/entities/usuario.entity").Usuario>;
    findProfile(req: Request): Promise<import("../../database/entities/usuario.entity").Usuario>;
    updateMyProfile(req: Request, updateUsuarioDto: UpdateUsuarioDto): Promise<import("../../database/entities/usuario.entity").Usuario | null>;
    update(id: number, updateUsuarioDto: UpdateUsuarioDto): Promise<import("../../database/entities/usuario.entity").Usuario | null>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
