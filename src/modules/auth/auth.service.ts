import {
  Injectable,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsuariosService } from '../usuarios/usuarios.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { CreateUsuarioDto } from '../usuarios/dto/create-usuario.dto';

@Injectable()
export class AuthService {
  constructor(
    private usuariosService: UsuariosService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usuariosService.findOneByEmail(
      registerDto.correo,
    );
    if (existingUser) throw new ConflictException('Correo ya registrado.');

    // El rol viene directamente del DTO
    const rol = registerDto.rol || 'funcionario';

    const createUsuarioDto: CreateUsuarioDto = {
      correo: registerDto.correo,
      contrasena: registerDto.contrasena,
      nombre: registerDto.nombre,
      apellido: registerDto.apellido,
      telefono: registerDto.telefono,
      rol: rol,
    };

    const usuario = await this.usuariosService.create(createUsuarioDto);

    const payload = {
      sub: usuario.id,
      correo: usuario.correo,
      rol: usuario.rol,
    };

    const token = this.jwtService.sign(payload);
    const { contrasena, ...usuarioSinContrasena } = usuario;

    return { user: usuarioSinContrasena, access_token: token };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usuariosService.findOneByEmailWithPassword(
      loginDto.correo,
    );

    if (!user) throw new UnauthorizedException('Credenciales inválidas.');

    const match = await bcrypt.compare(loginDto.contrasena, user.contrasena);
    if (!match) throw new UnauthorizedException('Credenciales inválidas.');

    const payload = {
      sub: user.id,
      correo: user.correo,
      rol: user.rol, // 👈 aquí usamos el rol del usuario
    };

    const token = this.jwtService.sign(payload);

    const { contrasena, ...usuarioSinContrasena } = user;
    return { user: usuarioSinContrasena, access_token: token };
  }
}
