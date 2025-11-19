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
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmpleadoCargo } from 'src/database/entities/empleado-cargo.entity';
import { Cargo } from 'src/database/entities/cargo.entity';

@Injectable()
export class AuthService {
  constructor(
    private usuariosService: UsuariosService,
    private jwtService: JwtService,
    @InjectRepository(Cargo)
    private cargoRepository: Repository<Cargo>,
    @InjectRepository(EmpleadoCargo)
    private empleadoCargoRepository: Repository<EmpleadoCargo>,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usuariosService.findOneByEmail(
      registerDto.correo,
    );
    if (existingUser) throw new ConflictException('Correo ya registrado.');

    const role = registerDto.role || 'funcionario';
    const cargo = await this.cargoRepository.findOne({ where: { rol: role } });
    if (!cargo) throw new NotFoundException(`Rol '${role}' no existe.`);

    const createUsuarioDto: CreateUsuarioDto = {
      correo: registerDto.correo,
      contrasena: registerDto.contrasena,
      nombre: registerDto.nombre,
      apellido: registerDto.apellido,
      telefono: registerDto.telefono,
    };

    const usuario = await this.usuariosService.create(createUsuarioDto);

    const empleadoCargo = this.empleadoCargoRepository.create({
      usuario,
      cargo,
      fecha_inicio: new Date(),
    });
    await this.empleadoCargoRepository.save(empleadoCargo);

    const payload = {
      sub: usuario.id,
      correo: usuario.correo,
      roles: [cargo.rol],
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

    const roles = user.asignaciones?.map((a) => a.cargo.rol) || [];
    const payload = { sub: user.id, correo: user.correo, roles };
    const token = this.jwtService.sign(payload);

    const { contrasena, ...usuarioSinContrasena } = user;
    const rolPrincipal = roles.length > 0 ? roles[0] : null;
    return { 
      user: { 
        ...usuarioSinContrasena, 
        role: rolPrincipal 
      }, 
      access_token: token 
    };
  }
}
