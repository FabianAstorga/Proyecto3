import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<string>;
    login(loginDto: LoginDto): Promise<{
        access_token: string;
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
        };
    }>;
}
