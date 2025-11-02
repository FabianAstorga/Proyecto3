import { Injectable } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Usuario } from './entities/usuario.entity';
import { Repository } from 'typeorm'; 
import { InjectRepository } from '@nestjs/typeorm';
import * as bcryptjs from 'bcryptjs';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuariosService {

  constructor(@InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>) {
    
  } 

  async create(createUsuarioDto: CreateUsuarioDto) {
    
    if (createUsuarioDto.contrasena) {
      const salt = await bcrypt.genSalt();
      createUsuarioDto.contrasena = await bcrypt.hash(createUsuarioDto.contrasena, salt);
    }
    
    const nuevoUsuario = this.usuarioRepository.create(createUsuarioDto);
    return this.usuarioRepository.save(nuevoUsuario);
  }

  findOneByEmail(correo: string) {
    return this.usuarioRepository.findOneBy({ correo });
  }

  findAll() {
    return `This action returns all usuarios`;
  }

  findOne(id: number) {
    return `This action returns a #${id} usuario`;
  }

  update(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    return `This action updates a #${id} usuario`;
  }

  remove(id: number) {
    return `This action removes a #${id} usuario`;
  }
}
