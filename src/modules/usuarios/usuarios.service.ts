/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Usuario } from '../../database/entities/usuario.entity';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async create(createUsuarioDto: CreateUsuarioDto) {
    // Verificar duplicado de correo
    const existente = await this.usuarioRepository.findOne({
      where: { correo: createUsuarioDto.correo },
    });
    if (existente) {
      throw new ConflictException(
        `El correo ${createUsuarioDto.correo} ya está registrado.`,
      );
    }

    // Encriptar contraseña si se envía
    if (createUsuarioDto.contrasena) {
      const salt = await bcrypt.genSalt(10);
      createUsuarioDto.contrasena = await bcrypt.hash(
        createUsuarioDto.contrasena,
        salt,
      );
    }

    // instancia del usuario
    const nuevoUsuario = this.usuarioRepository.create(createUsuarioDto);
    // Guardar
    return this.usuarioRepository.save(nuevoUsuario);
  }

  findAll() {
    return this.usuarioRepository.find();
  }

  async findOne(id: number) {
    const usuario = await this.usuarioRepository.findOne({ where: { id } });
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado.`);
    }
    return usuario;
  }

  // Actualizar o Encripta aaun usuario existente.
  async update(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    const usuario = await this.usuarioRepository.findOne({ where: { id } });
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado.`);
    }

    // Encriptar contraseña si se envía
    if (updateUsuarioDto.contrasena) {
      const salt = await bcrypt.genSalt(10);
      updateUsuarioDto.contrasena = await bcrypt.hash(
        updateUsuarioDto.contrasena,
        salt,
      );
    }

    // Actualizar registro
    await this.usuarioRepository.update(id, updateUsuarioDto);
    return this.usuarioRepository.findOne({ where: { id } });
  }

  /**
   * Eliminar un usuario por ID.
   * - Verifica existencia antes de eliminar.
   */
  async remove(id: number) {
    const usuario = await this.usuarioRepository.findOne({ where: { id } });
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado.`);
    }

    await this.usuarioRepository.delete(id);
    return { message: `Usuario con ID ${id} eliminado correctamente.` };
  }

  /**
   * Actualizar solo la foto del usuario (por URL).
   * Se podría usar cuando subes una imagen y obtienes la URL.
   */
  async updateFoto(id: number, fotoUrl: string) {
    const usuario = await this.usuarioRepository.findOne({ where: { id } });
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado.`);
    }

    usuario.foto_url = fotoUrl;
    await this.usuarioRepository.save(usuario);
    return usuario;
  }
  /**
   * Buscar usuario por correo electrónico.
   * Se usa para validaciones y autenticación.
   */
  findOneByEmail(correo: string) {
    return this.usuarioRepository.findOne({ where: { correo } });
  }

  /**
   * Buscar usuario por correo e incluir contraseña (para login).
   */
  findOneByEmailWithPassword(correo: string) {
    return this.usuarioRepository.findOne({
      where: { correo },
      select: ['id', 'correo', 'contrasena', 'estado', 'nombre', 'apellido'],
    });
  }
}
