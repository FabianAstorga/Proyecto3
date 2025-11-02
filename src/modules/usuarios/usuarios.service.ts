/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable } from '@nestjs/common';
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
    // Encriptar la contraseña si se proporciona
    if (createUsuarioDto.contrasena) {
      const salt = await bcrypt.genSalt(10);
      createUsuarioDto.contrasena = await bcrypt.hash(
        createUsuarioDto.contrasena,
        salt,
      );
    }

    const nuevoUsuario = this.usuarioRepository.create(createUsuarioDto);
    return this.usuarioRepository.save(nuevoUsuario);
  }

  /**
   * Buscar un usuario por su correo electrónico.
   * Se utiliza en la autenticación.
   */
  findOneByEmail(correo: string) {
    return this.usuarioRepository.findOne({ where: { correo } });
  }

  /**
   * Listar todos los usuarios.
   */
  findAll() {
    return this.usuarioRepository.find();
  }

  /**
   * Buscar un usuario por ID.
   */
  findOne(id: number) {
    return this.usuarioRepository.findOne({ where: { id } });
  }

  /**
   * Actualizar los datos de un usuario existente.
   * Si se incluye una nueva contraseña, se encripta antes de guardar.
   */
  async update(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    if (updateUsuarioDto.contrasena) {
      const salt = await bcrypt.genSalt(10);
      updateUsuarioDto.contrasena = await bcrypt.hash(
        updateUsuarioDto.contrasena,
        salt,
      );
    }

    await this.usuarioRepository.update(id, updateUsuarioDto);
    return this.usuarioRepository.findOne({ where: { id } });
  }

  /**
   * Eliminar un usuario por ID.
   */
  async remove(id: number) {
    const usuario = await this.usuarioRepository.findOne({ where: { id } });
    if (!usuario) {
      return { message: `Usuario con ID ${id} no encontrado` };
    }
    await this.usuarioRepository.delete(id);
    return { message: `Usuario con ID ${id} eliminado correctamente` };
  }
}
