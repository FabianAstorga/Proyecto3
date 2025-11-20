import {
  Injectable,
  ConflictException,
  BadRequestException,
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
    // Validación: correo ya existe
    const existingUser = await this.usuariosService.findOneByEmail(
      registerDto.correo,
    );
    if (existingUser) {
      throw new ConflictException('❌ Este correo ya está registrado.');
    }

    // Validaciones adicionales opcionales
    if (registerDto.contrasena.length < 8) {
      throw new BadRequestException('❌ La contraseña debe tener al menos 8 caracteres.');
    }

    const rol = registerDto.rol || 'funcionario';

    const createUsuarioDto: CreateUsuarioDto = {
      correo: registerDto.correo,
      contrasena: registerDto.contrasena,
      nombre: registerDto.nombre,
      apellido: registerDto.apellido,
      telefono: registerDto.telefono,
      rol: rol,
    };

    // Crear usuario
    const usuario = await this.usuariosService.create(createUsuarioDto);

    // Generar token
    const payload = {
      sub: usuario.id,
      correo: usuario.correo,
      rol: usuario.rol,
    };

    const token = this.jwtService.sign(payload);
    const { contrasena, ...usuarioSinContrasena } = usuario;

    return {
      message: '✔ Usuario registrado exitosamente.',
      user: usuarioSinContrasena,
      access_token: token,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usuariosService.findOneByEmailWithPassword(
      loginDto.correo,
    );

    if (!user) throw new UnauthorizedException('❌ Correo o contraseña incorrectos.');

    const match = await bcrypt.compare(loginDto.contrasena, user.contrasena);
    if (!match) throw new UnauthorizedException('❌ Correo o contraseña incorrectos.');

    const payload = {
      sub: user.id,
      correo: user.correo,
      rol: user.rol,
    };

    const token = this.jwtService.sign(payload);

    const { contrasena, ...usuarioSinContrasena } = user;

    return {
      message: '✔ Inicio de sesión exitoso.',
      user: usuarioSinContrasena,
      access_token: token,
    };
  }
}
