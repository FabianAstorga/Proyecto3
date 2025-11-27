/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcryptjs";
import { CreateUsuarioDto } from "./dto/create-usuario.dto";
import { UpdateUsuarioDto } from "./dto/update-usuario.dto";
import { Usuario } from "../../database/entities/usuario.entity";

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>
  ) {}

  /**
   * Crear usuario — Solo administrador (según tu controlador)
   */
  async create(createUsuarioDto: CreateUsuarioDto) {


    const existeCorreo = await this.usuarioRepository.findOne({
          where: { correo: createUsuarioDto.correo },
        });

        if (existeCorreo) {
          throw new ConflictException('El correo ya está registrado');
        }



    // 1) Hashear la contraseña que viene en el DTO
    const hash = await bcrypt.hash(createUsuarioDto.contrasena, 10);

    // 2) Reemplazarla por el hash
    createUsuarioDto.contrasena = hash;

    // 3) Crear y guardar la entidad
    const usuario = this.usuarioRepository.create(createUsuarioDto);
    return this.usuarioRepository.save(usuario);
  }

  /**
   * Obtener todos los usuarios — Solo administrador
   */
  findAll() {
    return this.usuarioRepository.find();
  }

  /**
   * Obtener un usuario por ID
   */
  async findOne(id: number) {
    const usuario = await this.usuarioRepository.findOne({ where: { id } });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado.`);
    }

    return usuario;
  }

  /**
   * Actualizar MIS datos (ruta PATCH /me)
   */
  async updateMyProfile(id: number, dto: UpdateUsuarioDto) {
    const usuario = await this.usuarioRepository.findOne({ where: { id } });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado.`);
    }

    // Encriptar contraseña si se envía
    if (dto.contrasena) {
      const salt = await bcrypt.genSalt(10);
      dto.contrasena = await bcrypt.hash(dto.contrasena, salt);
    }

    await this.usuarioRepository.update(id, dto);
    return this.usuarioRepository.findOne({ where: { id } });
  }

  /**
   * Actualizar cualquier usuario (Solo admin)
   */
  async update(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    const usuario = await this.usuarioRepository.findOne({ where: { id } });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado.`);
    }



  // Si se está cambiando el correo, validar que no exista
      if (updateUsuarioDto.correo && updateUsuarioDto.correo !== usuario.correo) {
        const existeCorreo = await this.usuarioRepository.findOne({
          where: { correo: updateUsuarioDto.correo },
        });

        if (existeCorreo) {
          throw new ConflictException('El correo ya está registrado por otro usuario');
        }
      }


    // Encriptar contraseña si llega
    if (updateUsuarioDto.contrasena) {
      const salt = await bcrypt.genSalt(10);
      updateUsuarioDto.contrasena = await bcrypt.hash(
        updateUsuarioDto.contrasena,
        salt
      );
    }

    await this.usuarioRepository.update(id, updateUsuarioDto);
    return this.usuarioRepository.findOne({ where: { id } });
  }

  /**
   * Eliminar usuario — Solo administrador
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
   * Actualizar solo foto del usuario
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
   * Buscar usuario por correo (para registro, validaciones, etc.)
   */
  findOneByEmail(correo: string) {
    return this.usuarioRepository.findOne({ where: { correo } });
  }

  /**
   * Buscar usuario por correo + incluir contraseña (para login)
   */
  findOneByEmailWithPassword(correo: string) {
    return this.usuarioRepository.findOne({
      where: { correo },
      select: [
        "id",
        "correo",
        "contrasena",
        "estado",
        "nombre",
        "apellido",
        "rol",
      ],
    });
  }
}
