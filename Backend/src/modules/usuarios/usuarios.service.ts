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
import * as fs from "fs";
import * as path from "path";

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
      throw new ConflictException("El correo ya está registrado");
    }
    const hash = await bcrypt.hash(createUsuarioDto.contrasena, 10);
    createUsuarioDto.contrasena = hash;
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
  async update(id: number, dto: UpdateUsuarioDto) {
    const usuario = await this.usuarioRepository.findOne({ where: { id } });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado.`);
    }

    // ================= FOTO =================

    // 🧹 Función helper para borrar foto física
    // ================= FOTO =================
    // ================= FOTO =================
    const eliminarFotoFisica = (fotoUrl?: string | null) => {
      if (!fotoUrl || fotoUrl === "/usuario(1).png") return;

      const filePath = path.join(process.cwd(), fotoUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    };

    // 🧠 CASO 1: SUBIR NUEVA FOTO
    if (dto.foto_url && dto.foto_url.startsWith("/uploads")) {
      eliminarFotoFisica(usuario.foto_url);
      usuario.foto_url = dto.foto_url;
    }

    // 🧠 CASO 2: QUITAR FOTO
    if (dto.removePhoto === "true") {
      eliminarFotoFisica(usuario.foto_url);
      usuario.foto_url = "/usuario(1).png";
    }

    // ================= OTROS CAMPOS =================

    if (dto.nombre !== undefined) usuario.nombre = dto.nombre;
    if (dto.apellido !== undefined) usuario.apellido = dto.apellido;
    if (dto.correo !== undefined) usuario.correo = dto.correo;
    if (dto.telefono !== undefined) usuario.telefono = dto.telefono;
    if (dto.rol !== undefined) usuario.rol = dto.rol;

    if (dto.contrasena) {
      const salt = await bcrypt.genSalt(10);
      usuario.contrasena = await bcrypt.hash(dto.contrasena, salt);
    }

    await this.usuarioRepository.save(usuario);
    return usuario;
  }

  /**
   * Eliminar usuario — Solo administrador
   */
  async remove(id: number) {
    const usuario = await this.usuarioRepository.findOne({ where: { id } });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado.`);
    }

    // 🧹 Eliminar foto física si existe y no es la por defecto
    if (usuario.foto_url && usuario.foto_url !== "/usuario(1).png") {
      const filePath = path.join(process.cwd(), usuario.foto_url);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
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
