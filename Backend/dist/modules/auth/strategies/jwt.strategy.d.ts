import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsuariosService } from '../../usuarios/usuarios.service';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private configService;
    private usuariosService;
    constructor(configService: ConfigService, usuariosService: UsuariosService);
    validate(payload: any): Promise<import("../../../database/entities/usuario.entity").Usuario>;
}
export {};
