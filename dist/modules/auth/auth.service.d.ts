import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthService {
    create(LoginDto: LoginDto): string;
    findAll(): string;
    findOne(id: number): string;
    update(id: number, RegisterDto: RegisterDto): string;
    remove(id: number): string;
}
