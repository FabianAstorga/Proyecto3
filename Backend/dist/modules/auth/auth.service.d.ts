import { JwtService } from '@nestjs/jwt';
import { UsuariosService } from '../usuarios/usuarios.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private usuariosService;
    private jwtService;
    constructor(usuariosService: UsuariosService, jwtService: JwtService);
    register(registerDto: RegisterDto): Promise<{
        message: string;
        user: {
            id: number;
            rol: string;
            nombre: string;
            apellido: string;
            correo: string;
            estado: boolean;
            telefono: string;
            foto_url: string;
            fecha_creacion: Date;
            cargos: import("../../database/entities/empleado-cargo.entity").EmpleadoCargo[];
            informes: import("../../database/entities/informe.entity").Informe[];
            horarios: import("../../database/entities/horario.entity").Horario[];
            actividades: import("../../database/entities/actividad.entity").Actividad[];
        };
        access_token: string;
    }>;
    login(loginDto: LoginDto): Promise<{
        message: string;
        user: {
            id: number;
            rol: string;
            nombre: string;
            apellido: string;
            correo: string;
            estado: boolean;
            telefono: string;
            foto_url: string;
            fecha_creacion: Date;
            cargos: import("../../database/entities/empleado-cargo.entity").EmpleadoCargo[];
            informes: import("../../database/entities/informe.entity").Informe[];
            horarios: import("../../database/entities/horario.entity").Horario[];
            actividades: import("../../database/entities/actividad.entity").Actividad[];
        };
        access_token: string;
    }>;
}
