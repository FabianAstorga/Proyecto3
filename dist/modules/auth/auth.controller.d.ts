import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    create(LoginDto: LoginDto): string;
    findAll(): string;
    findOne(id: string): string;
    update(id: string, RegisterDto: RegisterDto): string;
    remove(id: string): string;
}
